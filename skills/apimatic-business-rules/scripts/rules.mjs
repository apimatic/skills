#!/usr/bin/env node
// Business rules in src/rules/ of an APIMatic project.
//
//   node rules.mjs ops   [--input <project root>] [--json]   the spec's operations: file, heading and id of each
//   node rules.mjs index [--input <project root>]            write src/rules/rules.md from the rule files
//   node rules.mjs check [--input <project root>]            check src/rules/ against the format and the spec
//
// <project root> is the directory that contains src/ (default: the current directory). The spec is the OpenAPI 3
// or Swagger 2 file (JSON or YAML) in src/spec/. No dependencies: Node.js only.

import fs from 'node:fs';
import path from 'node:path';

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace'];
const ON = ['auth', 'state', 'order', 'account-config', 'idempotency', 'resilience', 'limits', 'other', '-'];
const DOES = ['side-effects', 'webhooks', 'lists', 'values', 'errors', 'other', '-'];
const KINDS = ['spec', 'docs', 'announcement', 'text', 'code', 'table', 'document', 'url', 'observed'];
const LAYOUT = ['rules.md', 'every-request.md', 'background.md', 'operations', 'sources'];
const IGNORED = new Set(['.gitkeep', '.DS_Store', 'Thumbs.db', 'desktop.ini']);

class Fail extends Error {}

// ---------- arguments and project ----------

function parseArgs(argv) {
  const [cmd, ...rest] = argv;
  const opts = { cmd, input: process.cwd(), json: false };
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--input') opts.input = rest[++i];
    else if (rest[i].startsWith('--input=')) opts.input = rest[i].slice(8);
    else if (rest[i] === '--json') opts.json = true;
    else throw new Fail(`unknown argument: ${rest[i]}`);
  }
  if (!['ops', 'index', 'check'].includes(cmd)) throw new Fail('usage: node rules.mjs ops|index|check [--input <project root>] [--json]');
  return opts;
}

function project(input) {
  const root = path.resolve(input ?? '.');
  const src = path.join(root, 'src');
  if (!fs.existsSync(src)) {
    const hint = path.basename(root) === 'src' ? ' (run from the directory that contains src/, not from inside it)' : '';
    throw new Fail(`no src/ folder in ${root}${hint}`);
  }
  return { root, src, rules: path.join(src, 'rules') };
}

const rel = (from, p) => path.relative(from, p).split(path.sep).join('/');
const readText = (f) => fs.readFileSync(f, 'utf8').replace(/^﻿/, '');
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untagged';

// ---------- the spec ----------

function findSpec(src) {
  const dir = path.join(src, 'spec');
  if (!fs.existsSync(dir)) throw new Fail('no src/spec/ folder: the rules are filed by the operations of the API definition there');
  const candidates = [];
  for (const name of fs.readdirSync(dir)) {
    if (!/\.(ya?ml|json)$/i.test(name)) continue;
    const text = readText(path.join(dir, name));
    const isOas = /\.json$/i.test(name)
      ? /"(openapi|swagger)"\s*:/.test(text.slice(0, 4000))
      : /^(openapi|swagger)\s*:/m.test(text);
    if (isOas) candidates.push({ file: path.join(dir, name), hasPaths: /^paths\s*:|"paths"\s*:/m.test(text) });
  }
  const main = candidates.filter((c) => c.hasPaths);
  if (main.length === 0) {
    throw new Fail('found no OpenAPI 3 or Swagger 2 file with paths in src/spec/ (another format: convert a copy to OpenAPI first, for example with `apimatic api transform`)');
  }
  if (main.length > 1) throw new Fail(`more than one API definition in src/spec/: ${main.map((c) => path.basename(c.file)).join(', ')}`);
  return main[0].file;
}

const indentOf = (l) => l.match(/^ */)[0].length;
const blank = (l) => /^\s*(#.*)?$/.test(l);
const unquote = (s) => {
  s = s.replace(/\s+#.*$/, '').trim();
  const m = s.match(/^(['"])(.*)\1$/);
  return m ? m[2] : s;
};
const yamlKey = (l) => {
  const m = l.trim().match(/^(?:"([^"]+)"|'([^']+)'|([^'"\s][^#]*?))\s*:(?:\s+(.*))?$/);
  return m ? { key: m[1] ?? m[2] ?? m[3], value: m[4] === undefined ? '' : m[4].replace(/\s+#.*$/, '').trim() } : null;
};

// The direct children of the block that runs from line `from` (exclusive) to the first line indented `parent` or less.
function children(lines, from, parent) {
  let end = lines.length;
  for (let i = from + 1; i < lines.length; i++) {
    if (!blank(lines[i]) && indentOf(lines[i]) <= parent) { end = i; break; }
  }
  const first = lines.slice(from + 1, end).findIndex((l) => !blank(l));
  if (first < 0) return { items: [], end };
  const indent = indentOf(lines[from + 1 + first]);
  const items = [];
  for (let i = from + 1 + first; i < end; i++) {
    if (blank(lines[i]) || indentOf(lines[i]) !== indent) continue;
    const kv = yamlKey(lines[i]);
    if (kv) items.push({ ...kv, line: i, indent });
  }
  return { items, end };
}

function yamlTags(lines, item) {
  if (item.value.startsWith('[')) return item.value.replace(/^\[|\]$/g, '').split(',').map(unquote).filter(Boolean);
  const tags = [];
  for (let i = item.line + 1; i < lines.length; i++) {
    if (blank(lines[i])) continue;
    const m = lines[i].match(/^(\s*)-\s+(.*)$/);
    if (!m || m[1].length < item.indent) break;
    tags.push(unquote(m[2]));
  }
  return tags;
}

function yamlPathItem(lines, keyLine, parentIndent, file, p, ops, seen) {
  for (const child of children(lines, keyLine, parentIndent).items) {
    if (child.key === '$ref') {
      ops.push(...refPathItem(file, unquote(child.value), p, seen));
      continue;
    }
    if (!METHODS.includes(child.key)) continue;
    const op = { method: child.key.toUpperCase(), path: p, operationId: null, tags: [] };
    for (const f of children(lines, child.line, child.indent).items) {
      if (f.key === 'operationId') op.operationId = unquote(f.value);
      if (f.key === 'tags') op.tags = yamlTags(lines, f);
    }
    ops.push(op);
  }
}

function refPathItem(file, ref, p, seen) {
  if (ref.startsWith('#')) throw new Fail(`${path.basename(file)}: path ${p} is a local $ref (${ref}); not supported, inline it in a copy`);
  const target = path.resolve(path.dirname(file), ref.split('#')[0]);
  if (seen.has(target)) return [];
  seen.add(target);
  if (/\.json$/i.test(target)) return jsonPathItem(JSON.parse(readText(target)), p, target, seen);
  const lines = readText(target).split(/\r?\n/);
  const ops = [];
  yamlPathItem(['__root__:', ...lines.map((l) => '  ' + l)], 0, 0, target, p, ops, seen);
  return ops;
}

function jsonPathItem(item, p, file, seen) {
  if (item.$ref) return refPathItem(file, item.$ref, p, seen);
  return METHODS.filter((m) => item[m]).map((m) => ({
    method: m.toUpperCase(), path: p, operationId: item[m].operationId ?? null, tags: item[m].tags ?? [],
  }));
}

function loadSpec(src) {
  const file = findSpec(src);
  const text = readText(file);
  let title = 'API';
  let ops = [];
  const seen = new Set([file]);
  if (/\.json$/i.test(file)) {
    const doc = JSON.parse(text);
    title = doc.info?.title ?? title;
    for (const [p, item] of Object.entries(doc.paths ?? {})) ops.push(...jsonPathItem(item, p, file, seen));
  } else {
    const lines = text.split(/\r?\n/);
    const info = lines.findIndex((l) => /^info\s*:/.test(l));
    if (info >= 0) {
      const t = children(lines, info, 0).items.find((c) => c.key === 'title');
      if (t) title = unquote(t.value);
    }
    const paths = lines.findIndex((l) => /^paths\s*:\s*(#.*)?$/.test(l));
    for (const item of children(lines, paths, 0).items) {
      if (!item.key.startsWith('/')) continue;
      yamlPathItem(lines, item.line, item.indent, file, item.key, ops, seen);
    }
  }
  ops = ops.map((o) => {
    const tag = o.tags[0] ?? 'untagged';
    const key = o.operationId ?? `${o.method.toLowerCase()}-${slug(o.path)}`;
    return { ...o, tag, key, file: `operations/${slug(tag)}.md`, heading: `\`${o.method} ${o.path}\`` + (o.operationId ? ` (\`${o.operationId}\`)` : '') };
  });
  if (ops.length === 0) throw new Fail(`${rel(src, file)}: found no operations under paths`);
  return { file, title, ops };
}

// ---------- the rule files ----------

const RULE = /^- \*\*(loud|silent)\*\*, ([a-z-]+)\/([a-z-]+): (.+) → (.+?) \*\*Do:\*\* (.+) \*\((.+); `([^`]+)`\)\*$/;
const OP_HEADING = /^## (?:`([^`]+)` — )?`([A-Z]+) ([^`]+)`(?: \(`([^`]+)`\))?$/;
const SOURCE = /^([a-z]+) `([^`]+)`(?: \(([^)]*)\))?$/;
const OBSERVED_PROBE = /^observed by probe `([^`]+)` \(([^)]+)\)$/;

function parseRule(line) {
  const m = line.match(RULE);
  if (!m) return { error: 'not a rule line: "- **loud|silent**, <on>/<does>: <condition> → <outcome>. **Do:** <what the app must do> *(<sources>; `<id>`)*"' };
  const [, loudness, on, does, condition, outcome, doRest, sources, id] = m;
  const problems = [];
  if (!ON.includes(on)) problems.push(`"${on}" is not an <on> value (${ON.join(', ')})`);
  if (!DOES.includes(does)) problems.push(`"${does}" is not a <does> value (${DOES.join(', ')})`);
  if (on === '-' && does === '-') problems.push('<on> and <does> are both "-"');
  if (!outcome.endsWith('.')) problems.push('the outcome does not end with "."');
  const also = [...doRest.matchAll(/ Also: ((?:`[^`]+`(?:, )?)+)\./g)].flatMap((a) => [...a[1].matchAll(/`([^`]+)`/g)].map((x) => x[1]));
  const srcs = sources.split('; ').map((s) => {
    const o = s.match(OBSERVED_PROBE);
    if (o) return { kind: 'observed', probe: o[1] };
    const x = s.match(SOURCE);
    if (!x) { problems.push(`source "${s}" is not "<kind> \`<path>\`"`); return null; }
    if (!KINDS.includes(x[1])) problems.push(`source kind "${x[1]}" is not one of ${KINDS.join(', ')}`);
    return { kind: x[1], path: x[2] };
  }).filter(Boolean);
  return { loudness, on, does, condition, id, also, sources: srcs, problems };
}

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (!IGNORED.has(e.name)) out.push(p);
  }
  return out;
}

function readRuleFiles(prj, spec) {
  const errors = [];
  const warnings = [];
  const rules = []; // {id, loudness, condition, file, section, sources, also}
  const sections = []; // operation sections: {file, heading, op, count}
  const err = (f, i, msg) => errors.push(`${f}${i === null ? '' : `:${i + 1}`}: ${msg}`);
  const byKey = new Map(spec.ops.map((o) => [`${o.method} ${o.path}`, o]));
  const opIds = new Set(spec.ops.map((o) => o.operationId).filter(Boolean));

  const files = [];
  for (const name of ['every-request.md', 'background.md']) {
    const f = path.join(prj.rules, name);
    if (fs.existsSync(f)) files.push(f); else err(name, null, 'missing (write it with its heading even when it holds no rules)');
  }
  const opsDir = path.join(prj.rules, 'operations');
  if (fs.existsSync(opsDir)) {
    for (const e of fs.readdirSync(opsDir, { withFileTypes: true })) {
      if (IGNORED.has(e.name)) continue;
      if (e.isFile() && e.name.endsWith('.md')) files.push(path.join(opsDir, e.name));
      else err(`operations/${e.name}`, null, 'operations/ holds only <area>.md files');
    }
  }

  for (const f of files) {
    const name = rel(prj.rules, f);
    const kind = name === 'every-request.md' ? 'every' : name === 'background.md' ? 'background' : 'operation';
    const lines = readText(f).split(/\r?\n/);
    let section = null;
    let sawTitle = false;
    const headingsHere = new Set();
    lines.forEach((line, i) => {
      if (line.trim() === '') return;
      if (line.startsWith('# ')) {
        if (sawTitle) err(name, i, 'a second "# " title');
        if (kind === 'every' && line !== '# Rules for every request') err(name, i, 'the title is "# Rules for every request"');
        sawTitle = true;
        return;
      }
      if (!sawTitle) { err(name, i, 'the file starts with its "# " title'); sawTitle = true; }
      if (line.startsWith('## ')) {
        if (kind === 'every') { err(name, i, 'every-request.md has no "## " sections'); return; }
        if (kind === 'background') { section = { heading: line.slice(3).trim() }; return; }
        const m = line.match(OP_HEADING);
        if (!m) { err(name, i, 'an operation heading is "## `METHOD /path` (`operationId`)", as `rules.mjs ops` prints it'); section = null; return; }
        const op = byKey.get(`${m[2]} ${m[3]}`);
        if (!op) { err(name, i, `the spec has no operation ${m[2]} ${m[3]}`); section = null; return; }
        if ((m[4] ?? null) !== op.operationId) err(name, i, `${m[2]} ${m[3]} is \`${op.operationId}\` in the spec`);
        if (op.file !== name) err(name, i, `${op.method} ${op.path} belongs in ${op.file} (its tag is "${op.tag}")`);
        if (headingsHere.has(op.key)) err(name, i, `a second section for ${op.method} ${op.path}`);
        headingsHere.add(op.key);
        section = { heading: line.slice(3), op, count: 0, file: name };
        sections.push(section);
        return;
      }
      if (line.startsWith('- ')) {
        if (kind !== 'every' && !section) { err(name, i, 'a rule outside a "## " section'); return; }
        const r = parseRule(line);
        if (r.error) { err(name, i, r.error); return; }
        r.problems.forEach((p) => err(name, i, p));
        for (const a of r.also) {
          if (!opIds.has(a) && !/^background:[a-z0-9-]+$/.test(a)) err(name, i, `"Also:" names \`${a}\`, which is neither an operationId in the spec nor background:<job>`);
        }
        if (section?.op) section.count++;
        rules.push({ ...r, file: name, line: i + 1, section: section?.op?.key ?? section?.heading ?? null });
        return;
      }
      err(name, i, 'only "# " / "## " headings, rule lines and blank lines belong in a rule file');
    });
    if (kind === 'operation' && !sawTitle) err(name, null, 'empty file');
  }

  // Ids: one per section; the same id in several sections is the same rule.
  const byId = new Map();
  for (const r of rules) {
    const k = `${r.id}@${r.file}#${r.section}`;
    if (byId.has(k)) err(r.file, r.line - 1, `id \`${r.id}\` twice in one section`);
    byId.set(k, r);
    const first = rules.find((x) => x.id === r.id);
    if (first !== r && (first.condition !== r.condition || first.loudness !== r.loudness)) {
      err(r.file, r.line - 1, `id \`${r.id}\` is also ${first.file}:${first.line} with a different condition or loudness`);
    }
  }

  // Sources: every cited file exists; every original in sources/ is cited.
  const cited = new Set();
  for (const r of rules) {
    for (const s of r.sources) {
      if (!s.path) continue;
      if (/^https?:\/\//.test(s.path)) {
        warnings.push(`${r.file}:${r.line}: cites ${s.path} directly; save the page in sources/urls/ and cite the copy`);
        continue;
      }
      const p = s.path.replace(/:\d+(-\d+)?$/, '');
      if (!fs.existsSync(path.join(prj.src, p))) err(r.file, r.line - 1, `cites \`${s.path}\`, which is not a file under src/ (paths are relative to src/)`);
      cited.add(p);
    }
  }
  for (const f of walk(path.join(prj.rules, 'sources'))) {
    const p = rel(prj.src, f);
    if (!cited.has(p)) warnings.push(`no rule cites ${p}: fine if it states no rule, but say so to the user`);
  }
  return { rules, sections, errors, warnings };
}

// ---------- the index ----------

function renderIndex(prj, spec, parsed) {
  const unique = new Map();
  for (const r of parsed.rules) if (!unique.has(r.id)) unique.set(r.id, r);
  const all = [...unique.values()];
  const loud = all.filter((r) => r.loudness === 'loud').length;
  const nEvery = new Set(parsed.rules.filter((r) => r.file === 'every-request.md').map((r) => r.id)).size;
  const nBackground = new Set(parsed.rules.filter((r) => r.file === 'background.md').map((r) => r.id)).size;
  const order = new Map(spec.ops.map((o, i) => [o.key, i]));
  const tagOrder = [...new Set(spec.ops.map((o) => o.tag))];
  const rows = parsed.sections.filter((s) => s.count > 0).sort((a, b) =>
    tagOrder.indexOf(a.op.tag) - tagOrder.indexOf(b.op.tag) || order.get(a.op.key) - order.get(b.op.key));
  const n = (k, word) => `${k} ${word}${k === 1 ? '' : 's'}`;
  const lines = [
    `# ${spec.title}: business rules`, '',
    `${n(all.length, 'rule')} (${loud} loud, ${all.length - loud} silent). A loud rule makes the API refuse the request; a silent one gives a result with no error. Each line: when it applies → what the API does, then what the app must do, the source and the rule's id.`, '',
    `- Rules for every request: \`every-request.md\` (${n(nEvery, 'rule')}).`,
    `- Rules for jobs the API runs on its own (renewals, retries, webhooks it sends): \`background.md\` (${n(nBackground, 'rule')}).`,
    '- Rules by operation: the file below, one section per operation. A rule on several operations is listed under each.',
  ];
  if (fs.existsSync(path.join(prj.rules, 'sources'))) lines.push('- The material these rules were written from: `sources/`.');
  lines.push('');
  if (rows.length) {
    lines.push('| Operation | File | Rules |', '|---|---|---|');
    for (const s of rows) lines.push(`| ${s.heading} | \`${s.file}\` | ${s.count} |`);
  } else {
    lines.push('No operation has rules yet.');
  }
  return lines.join('\n') + '\n';
}

// ---------- commands ----------

function cmdOps(prj, opts) {
  const spec = loadSpec(prj.src);
  if (opts.json) { console.log(JSON.stringify(spec.ops, null, 1)); return 0; }
  const areas = new Map();
  for (const o of spec.ops) (areas.get(o.file) ?? areas.set(o.file, { tag: o.tag, ops: [] }).get(o.file)).ops.push(o);
  console.log(`${spec.title}: ${spec.ops.length} operations in ${areas.size} areas (${rel(prj.root, spec.file)})`);
  console.log('Each operation: the file its rules go in, then its section heading. Rule ids under it: <operationId>.<n>.');
  for (const [file, a] of areas) {
    console.log(`\n${file}  (tag "${a.tag}", title "# ${a.tag}")`);
    for (const o of a.ops) console.log(`  ## ${o.heading}${o.operationId ? '' : `   [no operationId: ids ${o.key}.<n>]`}`);
  }
  return 0;
}

function cmdIndex(prj) {
  if (!fs.existsSync(prj.rules)) throw new Fail('no src/rules/ folder');
  const spec = loadSpec(prj.src);
  const parsed = readRuleFiles(prj, spec);
  fs.writeFileSync(path.join(prj.rules, 'rules.md'), renderIndex(prj, spec, parsed));
  const n = new Set(parsed.rules.map((r) => r.id)).size;
  console.log(`wrote src/rules/rules.md: ${n} rules, ${parsed.sections.filter((s) => s.count).length} operations with rules`);
  if (parsed.errors.length) console.log(`${parsed.errors.length} problem(s) in the rule files; run check`);
  return 0;
}

function cmdCheck(prj) {
  if (!fs.existsSync(prj.rules)) throw new Fail('no src/rules/ folder');
  const spec = loadSpec(prj.src);
  const parsed = readRuleFiles(prj, spec);
  const errors = [...parsed.errors];
  for (const e of fs.readdirSync(prj.rules)) {
    if (!LAYOUT.includes(e) && !IGNORED.has(e)) errors.unshift(`${e}: not part of the layout. If it is material the user added, write its rules, then move it into sources/`);
  }
  const index = path.join(prj.rules, 'rules.md');
  if (!fs.existsSync(index)) errors.push('rules.md: missing; run `rules.mjs index`');
  else if (readText(index).replace(/\r\n/g, '\n') !== renderIndex(prj, spec, parsed)) errors.push('rules.md: out of date; run `rules.mjs index` (never edit it by hand)');
  for (const w of parsed.warnings) console.log(`warning: ${w}`);
  for (const e of errors) console.log(`error: ${e}`);
  const n = new Set(parsed.rules.map((r) => r.id)).size;
  console.log(`${n} rules in ${parsed.sections.filter((s) => s.count).length} operation sections; ${errors.length} error(s), ${parsed.warnings.length} warning(s)`);
  console.log(errors.length ? 'NOT OK' : 'OK');
  return errors.length ? 1 : 0;
}

try {
  const opts = parseArgs(process.argv.slice(2));
  const prj = project(opts.input);
  process.exitCode = { ops: cmdOps, index: cmdIndex, check: cmdCheck }[opts.cmd](prj, opts);
} catch (e) {
  if (!(e instanceof Fail)) throw e;
  console.error(`error: ${e.message}`);
  process.exitCode = 2;
}
