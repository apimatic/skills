#!/usr/bin/env node
// Business rules for an APIMatic project, taken from its own API definition (src/spec/) and docs (src/content/).
//
//   node rules.mjs ops    [--json]                 every operation: the area file its rules go in, its heading
//   node rules.mjs spec   <area|operationId|info>...   what the API definition says, to read and quote from
//   node rules.mjs quotes                          check that every record's quote is in its source file
//   node rules.mjs write                           give new records their ids, then write src/rules/ from the records
//   node rules.mjs merge  [<keep-id> <drop-id>...] list likely duplicates; or merge records into the first one
//   node rules.mjs sample [--percent <n>] [--seed <n>]   pick records at random for the second pass
//   node rules.mjs review                          apply the second pass's verdicts to the records
//   node rules.mjs check                           check src/rules/: format, definition, records, quotes, codegen
//
// Every command takes --input <project root>, the directory that contains src/ (default: the current directory).
// The records are JSON Lines files in <project root>/rules-work/records/, outside src/, so the CLI never uploads
// them. No dependencies: Node.js only.

import fs from 'node:fs';
import path from 'node:path';

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace'];
const LOUDNESS = ['loud', 'silent'];
const ON = ['auth', 'state', 'order', 'account-config', 'idempotency', 'resilience', 'limits', 'other', '-'];
const DOES = ['side-effects', 'webhooks', 'lists', 'values', 'errors', 'other', '-'];
const KINDS = ['spec', 'docs', 'announcement'];
const FIELDS = new Set(['id', 'operations', 'scope', 'on', 'does', 'loudness', 'condition', 'provider_outcome', 'app_must', 'sources', 'conflict', 'removed']);
const EVERY = ['every-request', '*'];
const QUOTE_MAX = 300;
const WORK = 'rules-work';
// What codegen copies into the Context Plugin as business-rules/. It turns the planning step on only when
// rules.md, every-request.md and at least one operations/<area>.md are there; background.md is optional.
const LAYOUT = ['rules.md', 'every-request.md', 'background.md', 'operations'];
const IGNORED = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini']);
const USAGE = 'usage: node rules.mjs ops|spec|quotes|write|merge|sample|review|check [--input <project root>]';

class Fail extends Error {}

// ---------- arguments and project ----------

function parseArgs(argv) {
  const [cmd, ...rest] = argv;
  const opts = { cmd, input: process.cwd(), json: false, percent: 10, seed: null, targets: [] };
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--input') opts.input = rest[++i];
    else if (a.startsWith('--input=')) opts.input = a.slice(8);
    else if (a === '--json') opts.json = true;
    else if (a === '--percent') opts.percent = Number(rest[++i]);
    else if (a === '--seed') opts.seed = Number(rest[++i]);
    else if (a.startsWith('--')) throw new Fail(`unknown option: ${a}`);
    else opts.targets.push(a);
  }
  if (!Object.hasOwn(COMMANDS, cmd ?? '')) throw new Fail(USAGE);
  if (!['spec', 'merge'].includes(cmd) && opts.targets.length) throw new Fail(`unexpected argument: ${opts.targets[0]}`);
  if (cmd === 'spec' && !opts.targets.length) throw new Fail('usage: node rules.mjs spec <area|operationId|info>... (areas and operationIds as `rules.mjs ops` prints them)');
  if (cmd === 'merge' && opts.targets.length === 1) throw new Fail('usage: node rules.mjs merge <keep-id> <drop-id>...');
  if (!(opts.percent > 0 && opts.percent <= 100)) throw new Fail('--percent takes a number from 1 to 100');
  if (opts.seed !== null && !(Number.isInteger(opts.seed) && opts.seed > 0)) throw new Fail('--seed takes a positive whole number');
  return opts;
}

function project(input) {
  const root = path.resolve(input ?? '.');
  const src = path.join(root, 'src');
  if (!isDir(src)) {
    const hint = path.basename(root) === 'src' ? ' (run from the directory that contains src/, not from inside it)' : '';
    throw new Fail(`no src/ folder in ${root}${hint}`);
  }
  return { root, src, rules: path.join(src, 'rules'), work: path.join(root, WORK), records: path.join(root, WORK, 'records') };
}

const isFile = (f) => { try { return fs.statSync(f).isFile(); } catch { return false; } };
const isDir = (f) => { try { return fs.statSync(f).isDirectory(); } catch { return false; } };
const rel = (from, p) => path.relative(from, p).split(path.sep).join('/');
const readText = (f) => fs.readFileSync(f, 'utf8').replace(/^﻿/, '');
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untagged';
const plural = (k, word) => `${k} ${word}${k === 1 ? '' : 's'}`;
const natural = (a, b) => a.localeCompare(b, 'en', { numeric: true });
const clip = (s, n = 90) => (s.length > n ? `${s.slice(0, n)}…` : s);

// ---------- the API definition ----------

function findSpec(src) {
  const dir = path.join(src, 'spec');
  if (!isDir(dir)) throw new Fail('no src/spec/ folder: the rules are filed by the operations of the API definition there');
  const candidates = [];
  for (const name of fs.readdirSync(dir)) {
    if (!/\.(ya?ml|json)$/i.test(name)) continue;
    const text = readText(path.join(dir, name));
    let doc = null;
    if (/\.json$/i.test(name)) try { doc = JSON.parse(text); } catch { /* not JSON, so not a definition */ }
    const isOas = doc ? Boolean(doc.openapi || doc.swagger) : /^(openapi|swagger)\s*:/m.test(text);
    if (isOas) candidates.push({ file: path.join(dir, name), hasPaths: /^paths\s*:|"paths"\s*:/m.test(text) });
  }
  const main = candidates.filter((c) => c.hasPaths);
  if (main.length === 0) {
    throw new Fail('found no OpenAPI 3 or Swagger 2 file with paths in src/spec/ (another format: convert a copy to OpenAPI first, for example with `apimatic api transform`)');
  }
  if (main.length > 1) throw new Fail(`more than one API definition in src/spec/: ${main.map((c) => path.basename(c.file)).join(', ')}`);
  return main[0].file;
}

const jsonCache = new Map();
function jsonDoc(file) {
  if (!jsonCache.has(file)) jsonCache.set(file, JSON.parse(readText(file)));
  return jsonCache.get(file);
}

// A $ref, from the file it appears in. Only JSON targets are followed.
function deref(file, ref) {
  const [f, ptr = ''] = ref.split('#');
  const target = f ? path.resolve(path.dirname(file), f) : file;
  if (!/\.json$/i.test(target) || !isFile(target)) return { file: target, ptr, node: null };
  let node = jsonDoc(target);
  for (const part of ptr.split('/').slice(1)) node = node?.[decodeURIComponent(part).replace(/~1/g, '/').replace(/~0/g, '~')];
  return { file: target, ptr, node: node ?? null };
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

// `lineBase` turns an index into `lines` into a line number of `file`.
function yamlPathItem(lines, keyLine, parentIndent, file, p, ops, seen, lineBase) {
  for (const child of children(lines, keyLine, parentIndent).items) {
    if (child.key === '$ref') {
      ops.push(...refPathItem(file, unquote(child.value), p, seen));
      continue;
    }
    if (!METHODS.includes(child.key)) continue;
    const op = { method: child.key.toUpperCase(), path: p, operationId: null, tags: [], loc: { file, line: child.line + lineBase } };
    for (const f of children(lines, child.line, child.indent).items) {
      if (f.key === 'operationId') op.operationId = unquote(f.value);
      if (f.key === 'tags') op.tags = yamlTags(lines, f);
    }
    ops.push(op);
  }
}

function refPathItem(file, ref, p, seen) {
  if (ref.startsWith('#') && !/\.json$/i.test(file)) {
    throw new Fail(`${path.basename(file)}: path ${p} is a local $ref (${ref}); not supported, inline it in a copy`);
  }
  const target = ref.startsWith('#') ? file : path.resolve(path.dirname(file), ref.split('#')[0]);
  if (seen.has(`${target}#${p}`)) return [];
  seen.add(`${target}#${p}`);
  if (/\.json$/i.test(target)) {
    const { node } = deref(file, ref);
    return node ? jsonPathItem(node, p, target, seen) : [];
  }
  const lines = readText(target).split(/\r?\n/);
  const ops = [];
  yamlPathItem(['__root__:', ...lines.map((l) => '  ' + l)], 0, 0, target, p, ops, seen, 0);
  return ops;
}

function jsonPathItem(item, p, file, seen) {
  if (item.$ref) return refPathItem(file, item.$ref, p, seen);
  return METHODS.filter((m) => item[m]).map((m) => ({
    method: m.toUpperCase(), path: p, operationId: item[m].operationId ?? null, tags: item[m].tags ?? [],
    raw: item[m], pathItem: item, defFile: file,
  }));
}

function loadSpec(src) {
  const file = findSpec(src);
  let title = 'API';
  let ops = [];
  const seen = new Set();
  if (/\.json$/i.test(file)) {
    const doc = jsonDoc(file);
    title = doc.info?.title ?? title;
    for (const [p, item] of Object.entries(doc.paths ?? {})) ops.push(...jsonPathItem(item, p, file, seen));
  } else {
    const lines = readText(file).split(/\r?\n/);
    const info = lines.findIndex((l) => /^info\s*:/.test(l));
    if (info >= 0) {
      const t = children(lines, info, 0).items.find((c) => c.key === 'title');
      if (t) title = unquote(t.value);
    }
    const paths = lines.findIndex((l) => /^paths\s*:\s*(#.*)?$/.test(l));
    for (const item of children(lines, paths, 0).items) {
      if (!item.key.startsWith('/')) continue;
      yamlPathItem(lines, item.line, item.indent, file, item.key, ops, seen, 1);
    }
  }
  ops = ops.map((o) => {
    const tag = o.tags[0] ?? 'untagged';
    const area = slug(tag);
    const key = o.operationId ?? `${o.method.toLowerCase()}-${slug(o.path)}`;
    return { ...o, tag, area, key, file: `operations/${area}.md`, heading: `\`${o.method} ${o.path}\`` + (o.operationId ? ` (\`${o.operationId}\`)` : '') };
  });
  if (ops.length === 0) throw new Fail(`${rel(src, file)}: found no operations under paths`);
  const odd = ops.filter((o) => o.operationId !== null && !/^[A-Za-z0-9_.-]+$/.test(o.operationId));
  if (odd.length) throw new Fail(`${rel(src, file)}: rule ids are made from operationIds, which may hold only letters, digits, _, . and -; rename ${odd.map((o) => `\`${o.operationId}\` (${o.method} ${o.path})`).join(', ')} in the API definition first (\`apimatic api validate\` warns about them too)`);
  const byRef = new Map();
  for (const o of ops) {
    byRef.set(o.key, o);
    if (o.operationId) byRef.set(o.operationId, o);
  }
  return { file, title, ops, byRef };
}

// ---------- reading the definition: `spec` ----------

const clean = (s) => String(s).replace(/\r\n?/g, '\n').trim();

// `head` then `body`, the body's later lines indented under it. With no body, `head` without its trailing ": ".
function block(indent, head, body) {
  if (body === undefined || body === null || String(body).trim() === '') return head ? [indent + head.replace(/:\s*$/, '')] : [];
  const lines = clean(body).split('\n');
  return [indent + head + lines[0], ...lines.slice(1).map((l) => `${indent}    ${l}`.trimEnd())];
}

class Printer {
  constructor(prj) {
    this.prj = prj;
    this.known = new Map(); // ref key -> {name, file, ptr, node}
    this.queue = [];
  }

  cite(file) {
    return `src/${rel(this.prj.src, file)}`;
  }

  ref(file, ref) {
    const d = deref(file, ref);
    if (!d.node) return `\`${ref}\``;
    const key = `${d.file}#${d.ptr}`;
    if (!this.known.has(key)) {
      const last = d.ptr ? decodeURIComponent(d.ptr.split('/').pop()) : path.basename(d.file).replace(/\.json$/i, '');
      let name = last.split('.').pop() || last;
      if ([...this.known.values()].some((k) => k.name === name)) name = last;
      this.known.set(key, { name, file: d.file, ptr: d.ptr, node: d.node });
      this.queue.push(key);
    }
    return this.known.get(key).name;
  }

  typeOf(s, file) {
    if (!s || typeof s !== 'object') return 'any';
    if (s.$ref) return this.ref(file, s.$ref);
    for (const k of ['allOf', 'oneOf', 'anyOf']) {
      if (Array.isArray(s[k])) return `${k}(${s[k].map((x) => this.typeOf(x, file)).join(', ')})`;
    }
    if (s.type === 'array' || s.items) return `array of ${this.typeOf(s.items, file)}`;
    let t = Array.isArray(s.type) ? s.type.join('|') : s.type ?? (s.properties ? 'object' : 'any');
    if (s.format) t += ` ${s.format}`;
    return t;
  }

  facts(s, required) {
    const bits = [];
    if (required) bits.push('required');
    if (s.readOnly) bits.push('read-only');
    if (s.nullable) bits.push('nullable');
    if (s.default !== undefined) bits.push(`default ${JSON.stringify(s.default)}`);
    if (Array.isArray(s.enum)) bits.push(`values ${s.enum.map(String).join(' | ')}`);
    return bits;
  }

  schemaLines(s, file, indent, depth) {
    const L = [];
    if (!s || typeof s !== 'object') return L;
    if (s.$ref) return [`${indent}see ${this.ref(file, s.$ref)}`];
    L.push(...block(indent, 'description: ', s.description));
    if (Array.isArray(s.enum)) L.push(`${indent}values: ${s.enum.map(String).join(' | ')}`);
    for (const k of ['allOf', 'oneOf', 'anyOf']) {
      for (const part of Array.isArray(s[k]) ? s[k] : []) {
        if (part?.$ref) L.push(`${indent}${k}: ${this.ref(file, part.$ref)}`);
        else L.push(...this.schemaLines(part, file, indent, depth + 1));
      }
    }
    const required = new Set(Array.isArray(s.required) ? s.required : []);
    for (const [name, p] of Object.entries(s.properties ?? {})) {
      const bits = [this.typeOf(p, file), ...this.facts(p ?? {}, required.has(name))];
      L.push(...block(indent, `- ${name} (${bits.join(', ')}): `, p?.description));
      const inner = p?.type === 'array' ? p.items : p;
      if (inner && !inner.$ref && (inner.properties || inner.allOf || inner.oneOf || inner.anyOf) && depth < 4) {
        L.push(...this.schemaLines({ ...inner, description: inner === p ? undefined : inner.description }, file, indent + '    ', depth + 1));
      }
    }
    if (s.items && !s.properties) L.push(`${indent}items: ${this.typeOf(s.items, file)}`);
    if (s.additionalProperties && typeof s.additionalProperties === 'object') {
      L.push(`${indent}additional properties: ${this.typeOf(s.additionalProperties, file)}`);
    }
    return L;
  }

  operation(o) {
    const op = o.raw;
    const file = o.defFile;
    const L = [`## ${o.heading}   (${this.cite(file)})`];
    L.push(...block('', 'summary: ', op.summary));
    L.push(...block('', 'description: ', op.description));
    const params = new Map();
    for (const p0 of [...(o.pathItem.parameters ?? []), ...(op.parameters ?? [])]) {
      const p = p0?.$ref ? deref(file, p0.$ref).node : p0;
      if (p) params.set(`${p.in}:${p.name}`, p);
    }
    if (params.size) L.push('parameters:');
    for (const p of params.values()) {
      const type = p.schema ? this.typeOf(p.schema, file) : p.type ? (p.type === 'array' ? `array of ${p.items?.type ?? 'any'}` : p.type) : null;
      const bits = [p.in, ...(type ? [type] : []), ...this.facts({ ...(p.schema ?? {}), ...p }, p.required)];
      L.push(...block('  ', `- ${p.name} (${bits.join(', ')}): `, p.description));
      if (p.schema && !p.schema.$ref && p.schema.properties) L.push(...this.schemaLines(p.schema, file, '      ', 1));
    }
    if (op.requestBody) {
      const rb = op.requestBody.$ref ? deref(file, op.requestBody.$ref).node : op.requestBody;
      L.push(...block('', `request body${rb?.required ? ' (required)' : ''}: `, rb?.description));
      const shown = new Set();
      for (const c of Object.values(rb?.content ?? {})) {
        const t = this.typeOf(c?.schema, file);
        if (shown.has(t)) continue;
        shown.add(t);
        L.push(`  schema: ${t}`);
        if (c?.schema && !c.schema.$ref && c.schema.properties) L.push(...this.schemaLines(c.schema, file, '    ', 1));
      }
    }
    if (op.responses) L.push('responses:');
    for (const [code, r0] of Object.entries(op.responses ?? {})) {
      const r = r0?.$ref ? deref(file, r0.$ref).node : r0;
      if (!r) continue;
      const schemas = r.schema ? [r.schema] : Object.values(r.content ?? {}).map((c) => c?.schema).filter(Boolean);
      const types = [...new Set(schemas.map((s) => this.typeOf(s, file)))];
      L.push(...block('  ', `- ${code}${types.length ? ` → ${types.join(' / ')}` : ''}: `, r.description));
    }
    return L;
  }

  // What the definition says about the API as a whole: info, servers, security, tags.
  general(file, doc) {
    const L = [`## The API as a whole   (${this.cite(file)})`];
    L.push(...block('', 'title: ', doc.info?.title));
    L.push(...block('', 'description: ', doc.info?.description));
    for (const s of doc.servers ?? []) L.push(...block('', `server ${s.url}: `, s.description));
    if (doc.host) L.push(`host: ${doc.host}${doc.basePath ?? ''}`);
    const schemes = doc.securityDefinitions ?? doc.components?.securitySchemes ?? {};
    for (const [name, s] of Object.entries(schemes)) {
      L.push(...block('', `security ${name} (${[s.type, s.scheme, s.in, s.name].filter(Boolean).join(', ')}): `, s.description));
    }
    for (const t of doc.tags ?? []) L.push(...block('', `tag ${t.name}: `, t.description));
    return L;
  }
}

function pickOps(spec, targets) {
  const picked = [];
  for (const t of targets) {
    if (t === 'info') continue;
    const area = t.replace(/^operations\//, '').replace(/\.md$/, '');
    let found = spec.ops.filter((o) => o.area === area || o.tag === t);
    if (!found.length) found = spec.ops.filter((o) => o.operationId === t || o.key === t);
    if (!found.length) throw new Fail(`"${t}" is neither an area, an operationId nor "info" (see rules.mjs ops)`);
    for (const o of found) if (!picked.includes(o)) picked.push(o);
  }
  return picked;
}

// ---------- the records ----------

function loadRecords(prj) {
  if (!isDir(prj.records)) return null;
  const set = { files: [], records: [], errors: [] };
  for (const name of fs.readdirSync(prj.records).filter((n) => /\.jsonl$/i.test(n)).sort(natural)) {
    const file = path.join(prj.records, name);
    const entry = { file, name, lines: readText(file).split(/\r?\n/), changed: false };
    set.files.push(entry);
    entry.lines.forEach((line, i) => {
      if (!line.trim()) return;
      const at = `${WORK}/records/${name}:${i + 1}`;
      let r;
      try { r = JSON.parse(line); } catch (e) { set.errors.push(`${at}: not one JSON object on one line (${e.message})`); return; }
      if (!r || typeof r !== 'object' || Array.isArray(r)) { set.errors.push(`${at}: not a JSON object`); return; }
      set.records.push({ r, at, entry, index: i });
    });
  }
  return set;
}

function requireRecords(prj) {
  const set = loadRecords(prj);
  if (!set) throw new Fail(`no ${WORK}/records/ folder in ${prj.root}: write the records there first, one .jsonl file per group`);
  return set;
}

function saveRecord(x, r) {
  x.r = r;
  x.entry.lines[x.index] = JSON.stringify(r);
  x.entry.changed = true;
}

function saveRecordFiles(set) {
  for (const e of set.files) if (e.changed) fs.writeFileSync(e.file, e.lines.join('\n'));
}

const live = (set) => set.records.filter((x) => x.r.removed === undefined);
const label = (x) => (x.r.id ? `${x.at} (${x.r.id})` : x.at);
const isEvery = (u) => EVERY.includes(u);
const isJob = (u) => typeof u === 'string' && /^background:[a-z0-9]+(-[a-z0-9]+)*$/.test(u);
const LINE_MARKS = /→|\*\*Do:\*\*|\*\*Conflict:\*\*|\*\(|\)\*/;

function checkText(p, name, v, { optional = false } = {}) {
  if (v === undefined || v === null) {
    if (!optional) p.push(`"${name}" is missing`);
    return;
  }
  if (typeof v !== 'string' || !v.trim()) { p.push(`"${name}" is ${optional ? 'null or ' : ''}a line of text`); return; }
  if (/[\r\n]/.test(v)) p.push(`"${name}" is one line`);
  if (LINE_MARKS.test(v)) p.push(`"${name}" holds "→", "**Do:**", "**Conflict:**", "*(" or ")*", which the rule line uses`);
}

function checkRecord(r, spec, prj) {
  const p = [];
  for (const k of Object.keys(r)) if (!FIELDS.has(k)) p.push(`unknown field "${k}"`);
  if (r.id !== undefined && !(typeof r.id === 'string' && /^[A-Za-z0-9_.:-]+\.\d+$/.test(r.id))) p.push(`"id" ${JSON.stringify(r.id)} is not <prefix>.<n>`);
  if (r.removed !== undefined) {
    if (typeof r.removed !== 'string' || !r.removed.trim()) p.push('"removed" holds the reason the rule was removed, as text');
    return p;
  }
  if (!Array.isArray(r.operations) || r.operations.length === 0) {
    p.push('"operations" lists where the rule is filed: operationIds, or ["every-request"], or "background:<job>"');
  } else {
    for (const u of r.operations) {
      if (isEvery(u) || isJob(u) || spec.byRef.has(u)) continue;
      p.push(typeof u === 'string' && u.startsWith('background:')
        ? `"operations": "${u}" is not background:<job>, the job in lower case with dashes`
        : `"operations": ${JSON.stringify(u)} is not an operationId of the API definition (see rules.mjs ops)`);
    }
    if (r.operations.some(isEvery) && r.operations.length > 1) p.push('"operations": a rule for every request is filed nowhere else');
    if (new Set(r.operations).size !== r.operations.length) p.push('"operations" names one place twice');
  }
  if (!LOUDNESS.includes(r.loudness)) p.push('"loudness" is "loud" or "silent"');
  if (!ON.includes(r.on)) p.push(`"on" is one of ${ON.join(', ')}`);
  if (!DOES.includes(r.does)) p.push(`"does" is one of ${DOES.join(', ')}`);
  if (r.on === '-' && r.does === '-') p.push('"on" and "does" are not both "-"');
  checkText(p, 'condition', r.condition);
  checkText(p, 'app_must', r.app_must);
  checkText(p, 'conflict', r.conflict, { optional: true });
  const po = r.provider_outcome;
  if (!po || typeof po !== 'object' || Array.isArray(po)) {
    p.push('"provider_outcome" is {"status", "error", "effect"}, each null where the source says nothing');
  } else {
    for (const k of Object.keys(po)) if (!['status', 'error', 'effect'].includes(k)) p.push(`"provider_outcome" has no "${k}"`);
    if (!(po.status === null || po.status === undefined || (Number.isInteger(po.status) && po.status >= 100 && po.status <= 599))) {
      p.push('"provider_outcome.status" is an HTTP status code or null');
    }
    checkText(p, 'provider_outcome.error', po.error, { optional: true });
    checkText(p, 'provider_outcome.effect', po.effect, { optional: true });
  }
  if (!Array.isArray(r.sources) || r.sources.length === 0) {
    p.push('"sources" lists at least one {"kind", "path", "line", "quote"}');
  } else {
    r.sources.forEach((s, i) => {
      const at = `sources[${i}]`;
      if (!s || typeof s !== 'object' || Array.isArray(s)) { p.push(`${at} is {"kind", "path", "line", "quote"}`); return; }
      for (const k of Object.keys(s)) if (!['kind', 'path', 'line', 'quote'].includes(k)) p.push(`${at} has no "${k}"`);
      if (!KINDS.includes(s.kind)) p.push(`${at}.kind is ${KINDS.join(', ')}`);
      if (typeof s.path !== 'string' || !/^(spec|content)\/./.test(s.path)) {
        p.push(`${at}.path is a file under spec/ or content/, written relative to src/`);
      } else {
        if (!isFile(path.join(prj.src, s.path))) p.push(`${at}.path: src/${s.path} is not a file`);
        if (KINDS.includes(s.kind) && (s.kind === 'spec') !== s.path.startsWith('spec/')) p.push(`${at}: kind "spec" is for files under spec/, and only for them`);
      }
      if (!(s.line === undefined || s.line === null || (Number.isInteger(s.line) && s.line > 0))) p.push(`${at}.line is a line number or null`);
      if (typeof s.quote !== 'string' || !s.quote.trim()) p.push(`${at}.quote is the exact text the rule comes from`);
      else if (s.quote.length > QUOTE_MAX) p.push(`${at}.quote is ${s.quote.length} characters; quote at most ${QUOTE_MAX}, the words that state the rule`);
    });
  }
  return p;
}

function checkRecords(set, spec, prj) {
  const errors = [...set.errors];
  for (const x of set.records) for (const q of checkRecord(x.r, spec, prj)) errors.push(`${label(x)}: ${q}`);
  const seen = new Map();
  for (const x of set.records) {
    if (x.r.id === undefined) continue;
    if (seen.has(x.r.id)) errors.push(`${x.at}: id \`${x.r.id}\` is also ${seen.get(x.r.id)}`);
    else seen.set(x.r.id, x.at);
  }
  return errors;
}

function idPrefix(r, spec) {
  const u = r.operations[0];
  if (isEvery(u)) return 'every-request';
  if (isJob(u)) return 'background';
  return spec.byRef.get(u).key;
}

// New records take the next free number for their prefix. Ids are never changed or reused.
function assignIds(set, spec) {
  const max = new Map();
  const namespaces = new Set();
  for (const { r } of set.records) {
    const m = typeof r.id === 'string' && r.id.match(/^(?:([^:]+):)?(.+)\.(\d+)$/);
    if (!m) continue;
    namespaces.add(m[1] ?? '');
    max.set(m[2], Math.max(max.get(m[2]) ?? 0, Number(m[3])));
  }
  const ns = namespaces.size === 1 ? [...namespaces][0] : '';
  let assigned = 0;
  for (const x of set.records) {
    if (x.r.id !== undefined) continue;
    const prefix = idPrefix(x.r, spec);
    const n = (max.get(prefix) ?? 0) + 1;
    max.set(prefix, n);
    saveRecord(x, { id: `${ns ? `${ns}:` : ''}${prefix}.${n}`, ...x.r });
    assigned++;
  }
  return assigned;
}

function findById(set, id) {
  const x = set.records.find((y) => y.r.id === id);
  if (!x) throw new Fail(`no record has the id \`${id}\``);
  return x;
}

// ---------- quotes ----------

// A quote and its source are compared after this: markup, entities, typographic marks, spacing and case removed.
function norm(s) {
  return s
    .normalize('NFKC')
    .replace(/<\/?[A-Za-z][^<>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\\([\\`*_{}[\]()#+\-.!|<>])/g, '$1')
    .replace(/[‘’‚‛′]/g, "'").replace(/[“”„‟″]/g, '"').replace(/[–—]/g, '-')
    .replace(/[*_`~[\]]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function sourceText(prj, p, cache) {
  if (!cache.has(p)) {
    const file = path.join(prj.src, p);
    let t;
    if (/\.json$/i.test(file)) {
      // The text of a JSON file is its string values, decoded; a quote never spans two of them.
      const strings = [];
      (function walkJson(v) {
        if (typeof v === 'string') strings.push(v);
        else if (v && typeof v === 'object') for (const x of Object.values(v)) walkJson(x);
      })(jsonDoc(file));
      t = strings.join('\n\u0000\n');
    } else {
      t = readText(file);
      if (/\.ya?ml$/i.test(file)) t = t.replace(/''/g, "'").replace(/\\"/g, '"').replace(/\\n/g, ' ');
    }
    cache.set(p, norm(t));
  }
  return cache.get(p);
}

// "..." or "…" in a quote skips text; the parts must appear in order.
function quoteFound(prj, s, cache) {
  const text = sourceText(prj, s.path, cache);
  const parts = s.quote.split(/\.\.\.|…/).map(norm).filter(Boolean);
  if (!parts.length) return false;
  let from = 0;
  for (const part of parts) {
    const i = text.indexOf(part, from);
    if (i < 0) return false;
    from = i + part.length;
  }
  return true;
}

function quoteProblems(set, spec, prj) {
  const errors = checkRecords(set, spec, prj);
  const warnings = [];
  const cache = new Map();
  const ok = live(set).filter((x) => checkRecord(x.r, spec, prj).length === 0);
  for (const x of ok) {
    x.r.sources.forEach((s, i) => {
      if (!quoteFound(prj, s, cache)) errors.push(`${label(x)}: sources[${i}].quote is not in src/${s.path}: "${clip(s.quote)}"`);
    });
  }
  const cited = new Set(ok.flatMap((x) => x.r.sources.map((s) => s.path)));
  for (const f of walk(path.join(prj.src, 'content'))) {
    if (!/\.mdx?$/i.test(f)) continue;
    const p = rel(prj.src, f);
    if (!cited.has(p)) warnings.push(`no record cites ${p}: fine if it states no business rule; say so in the report`);
  }
  return { errors, warnings, checked: ok.length };
}

function walk(dir) {
  const out = [];
  if (!isDir(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (!IGNORED.has(e.name)) out.push(p);
  }
  return out.sort(natural);
}

// ---------- duplicates ----------

const outcomeText = (r) => {
  const po = r.provider_outcome ?? {};
  const parts = [];
  if (po.status) parts.push(String(po.status));
  if (po.error) parts.push(`"${po.error.trim()}"`);
  if (po.effect) parts.push(po.effect.trim());
  return parts.length ? parts.join(' ') : 'outcome not stated';
};

function bigrams(s) {
  const t = s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const m = new Map();
  for (let i = 0; i < t.length - 1; i++) {
    const g = t.slice(i, i + 2);
    m.set(g, (m.get(g) ?? 0) + 1);
  }
  return { m, n: Math.max(0, t.length - 1) };
}

// Sørensen–Dice similarity of two texts' letter pairs: 1 for the same text.
function similarity(a, b) {
  if (!a.n || !b.n) return 0;
  let both = 0;
  for (const [g, k] of a.m) both += Math.min(k, b.m.get(g) ?? 0);
  return (2 * both) / (a.n + b.n);
}

// Pairs of records from different files that look like one rule: the same quote, or the same kind of rule with
// nearly the same condition and outcome.
function likelyDuplicates(set, spec, prj) {
  const recs = live(set).filter((x) => x.r.id !== undefined && checkRecord(x.r, spec, prj).length === 0);
  const pairs = new Map();
  const add = (a, b, why) => {
    if (a.entry === b.entry) return;
    const [x, y] = natural(a.r.id, b.r.id) <= 0 ? [a, b] : [b, a];
    const k = `${x.r.id} ${y.r.id}`;
    if (!pairs.has(k)) pairs.set(k, { a: x, b: y, why });
  };
  const byQuote = new Map();
  for (const x of recs) {
    for (const s of x.r.sources) {
      const k = `${s.path}\u0000${norm(s.quote)}`;
      for (const y of byQuote.get(k) ?? []) add(y, x, 'the same quote');
      byQuote.set(k, [...(byQuote.get(k) ?? []), x]);
    }
  }
  const buckets = new Map();
  for (const x of recs) {
    const k = `${x.r.on}/${x.r.does}/${x.r.loudness}`;
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push({ x, g: bigrams(`${x.r.condition} ${outcomeText(x.r)}`) });
  }
  for (const list of buckets.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (list[i].x.entry === list[j].x.entry) continue;
        const s = similarity(list[i].g, list[j].g);
        if (s >= 0.9) add(list[i].x, list[j].x, `similarity ${s.toFixed(2)}`);
      }
    }
  }
  return [...pairs.values()].sort((p, q) => natural(p.a.r.id, q.a.r.id));
}

// ---------- the rule files ----------

const RULE = /^- \*\*(loud|silent)\*\*, ([a-z-]+)\/([a-z-]+): (.+) → (.+?) \*\*Do:\*\* (.+) \*\((.+); `([^`]+)`\)\*$/;
const OP_HEADING = /^## `([A-Z]+) ([^`]+)`(?: \(`([^`]+)`\))?$/;
const SOURCE = /^([a-z]+) `([^`]+)`$/;

const placeKey = (u, spec) => (isEvery(u) ? 'every-request' : isJob(u) ? u : spec.byRef.get(u).key);
const sentence = (s) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);

function ruleLine(r, here, spec) {
  const others = r.operations.filter((u) => placeKey(u, spec) !== here).map((u) => `\`${placeKey(u, spec)}\``);
  const sources = [...new Set(r.sources.map((s) => `${s.kind} \`${s.path}\``))];
  return `- **${r.loudness}**, ${r.on}/${r.does}: ${r.condition.trim().replace(/\.$/, '')} → ${outcomeText(r).replace(/\.$/, '')}. **Do:** ${sentence(r.app_must)}`
    + (others.length ? ` Also: ${others.join(', ')}.` : '')
    + (r.conflict ? ` **Conflict:** ${r.conflict.trim()}` : '')
    + ` *(${sources.join('; ')}; \`${r.id}\`)*`;
}

const ruleOrder = (a, b) => (a.loudness === b.loudness ? 0 : a.loudness === 'loud' ? -1 : 1) || natural(a.id, b.id);

// The rule files the records make, {name under src/rules/: text}, without rules.md.
function renderRuleFiles(spec, records) {
  const places = new Map();
  for (const r of records) {
    for (const u of r.operations) {
      const k = placeKey(u, spec);
      if (!places.has(k)) places.set(k, []);
      places.get(k).push(r);
    }
  }
  const lines = (k) => (places.get(k) ?? []).sort(ruleOrder).map((r) => ruleLine(r, k, spec));
  const files = new Map();
  const every = lines('every-request');
  files.set('every-request.md', ['# Rules for every request', ...(every.length ? ['', ...every] : [])].join('\n') + '\n');
  const jobs = [...places.keys()].filter(isJob).sort(natural);
  if (jobs.length) {
    const out = [`# Rules for jobs ${spec.title} runs on its own`];
    for (const j of jobs) out.push('', `## ${j.slice('background:'.length)}`, '', ...lines(j));
    files.set('background.md', out.join('\n') + '\n');
  }
  const areas = new Map();
  for (const o of spec.ops) {
    if (!places.has(o.key)) continue;
    if (!areas.has(o.file)) areas.set(o.file, [`# ${o.tag}`]);
    areas.get(o.file).push('', `## ${o.heading}`, '', ...lines(o.key));
  }
  for (const [file, out] of areas) files.set(file, out.join('\n') + '\n');
  return files;
}

function ruleFilesOnDisk(prj) {
  const files = new Map();
  for (const name of ['every-request.md', 'background.md']) {
    const f = path.join(prj.rules, name);
    if (isFile(f)) files.set(name, readText(f));
  }
  const opsDir = path.join(prj.rules, 'operations');
  if (isDir(opsDir)) {
    for (const e of fs.readdirSync(opsDir, { withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith('.md')) files.set(`operations/${e.name}`, readText(path.join(opsDir, e.name)));
    }
  }
  return files;
}

// Anything in src/rules/ outside the layout: codegen would publish it in the Context Plugin.
function strayEntries(prj) {
  const errors = [];
  if (!isDir(prj.rules)) return errors;
  const say = (p) => `src/rules/${p}: not part of the layout, and everything in src/rules/ is published in the Context Plugin; move it out of src/ (into ${WORK}/, say)`;
  for (const e of fs.readdirSync(prj.rules, { withFileTypes: true })) {
    if (IGNORED.has(e.name)) continue;
    if (!LAYOUT.includes(e.name) || (e.name === 'operations') !== e.isDirectory()) { errors.push(say(e.name)); continue; }
    if (e.name !== 'operations') continue;
    for (const f of fs.readdirSync(path.join(prj.rules, 'operations'), { withFileTypes: true })) {
      if (IGNORED.has(f.name)) continue;
      if (!f.isFile() || !f.name.endsWith('.md')) errors.push(say(`operations/${f.name}`));
    }
  }
  return errors;
}

// What codegen needs before it adds business-rules/ to the plugin. Names are case-sensitive.
function codegenMissing(prj) {
  const names = isDir(prj.rules) ? fs.readdirSync(prj.rules) : [];
  const missing = ['rules.md', 'every-request.md'].filter((n) => !names.includes(n) || !isFile(path.join(prj.rules, n)));
  const opsDir = path.join(prj.rules, 'operations');
  const opsFiles = names.includes('operations') && isDir(opsDir)
    ? fs.readdirSync(opsDir).filter((n) => n.length > 3 && n.endsWith('.md') && isFile(path.join(opsDir, n)))
    : [];
  if (!opsFiles.length) missing.push('operations/<area>.md');
  return missing;
}

function readRuleFiles(prj, spec, files) {
  const errors = [];
  const rules = []; // {id, loudness, condition, file, section, sources, also}
  const sections = []; // operation sections: {file, heading, op, count}
  const err = (f, i, msg) => errors.push(`src/rules/${f}${i === null ? '' : `:${i + 1}`}: ${msg}`);
  const byKey = new Map(spec.ops.map((o) => [`${o.method} ${o.path}`, o]));
  if (!files.has('every-request.md')) err('every-request.md', null, 'missing (codegen needs it, even when it holds no rules)');
  const names = ['every-request.md', 'background.md', ...[...files.keys()].filter((n) => n.startsWith('operations/')).sort(natural)];

  for (const name of names.filter((n) => files.has(n))) {
    const kind = name === 'every-request.md' ? 'every' : name === 'background.md' ? 'background' : 'operation';
    const lines = files.get(name).split(/\r?\n/);
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
        const op = byKey.get(`${m[1]} ${m[2]}`);
        if (!op) { err(name, i, `the API definition has no operation ${m[1]} ${m[2]}`); section = null; return; }
        if ((m[3] ?? null) !== op.operationId) err(name, i, `${m[1]} ${m[2]} is \`${op.operationId}\` in the API definition`);
        if (op.file !== name) err(name, i, `${op.method} ${op.path} belongs in ${op.file} (its tag is "${op.tag}")`);
        if (headingsHere.has(`${m[1]} ${m[2]}`)) err(name, i, `a second section for ${op.method} ${op.path}`);
        headingsHere.add(`${m[1]} ${m[2]}`);
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
          if (!spec.byRef.has(a) && !isJob(a)) err(name, i, `"Also:" names \`${a}\`, which is neither an operationId of the API definition nor background:<job>`);
        }
        for (const s of r.sources) {
          if (!/^(spec|content)\//.test(s.path)) err(name, i, `cites \`${s.path}\`; a rule's sources are files under spec/ or content/`);
          else if (!isFile(path.join(prj.src, s.path))) err(name, i, `cites \`${s.path}\`, which is not a file under src/`);
        }
        if (section?.op) section.count++;
        rules.push({ ...r, file: name, line: i + 1, section: section?.heading ?? null });
        return;
      }
      err(name, i, 'only "# " / "## " headings, rule lines and blank lines belong in a rule file');
    });
    if (!sawTitle) err(name, null, 'empty file');
  }

  // One id per section; the same id in several sections is the same rule.
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
  return { rules, sections, errors };
}

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
    const x = s.match(SOURCE);
    if (!x) { problems.push(`source "${s}" is not "<kind> \`<path>\`"`); return null; }
    if (!KINDS.includes(x[1])) problems.push(`source kind "${x[1]}" is not one of ${KINDS.join(', ')}`);
    return { kind: x[1], path: x[2] };
  }).filter(Boolean);
  return { loudness, on, does, condition, id, also, sources: srcs, problems };
}

function renderIndex(spec, parsed, files) {
  const unique = new Map();
  for (const r of parsed.rules) if (!unique.has(r.id)) unique.set(r.id, r);
  const all = [...unique.values()];
  const loud = all.filter((r) => r.loudness === 'loud').length;
  const count = (file) => new Set(parsed.rules.filter((r) => r.file === file).map((r) => r.id)).size;
  const order = new Map(spec.ops.map((o, i) => [o.key, i]));
  const tagOrder = [...new Set(spec.ops.map((o) => o.tag))];
  const rows = parsed.sections.filter((s) => s.count > 0).sort((a, b) =>
    tagOrder.indexOf(a.op.tag) - tagOrder.indexOf(b.op.tag) || order.get(a.op.key) - order.get(b.op.key));
  const lines = [
    `# ${spec.title}: business rules`, '',
    `${plural(all.length, 'rule')} (${loud} loud, ${all.length - loud} silent), each taken from the API definition or the docs. A loud rule makes the API refuse the request; a silent one gives a result with no error. Each line: when it applies → what the API does, then what the app must do, the source and the rule's id.`, '',
    `- Rules for every request: \`every-request.md\` (${plural(count('every-request.md'), 'rule')}).`,
  ];
  if (files.has('background.md')) {
    lines.push(`- Rules for jobs the API runs on its own (renewals, retries, webhooks it sends): \`background.md\` (${plural(count('background.md'), 'rule')}).`);
  }
  lines.push('- Rules by operation: the file below, one section per operation, headed with its route. A rule on several operations is listed under each.', '');
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
  if (opts.json) {
    console.log(JSON.stringify(spec.ops.map(({ raw, pathItem, defFile, loc, ...o }) => o), null, 1));
    return 0;
  }
  const areas = new Map();
  for (const o of spec.ops) (areas.get(o.file) ?? areas.set(o.file, { tag: o.tag, area: o.area, ops: [] }).get(o.file)).ops.push(o);
  console.log(`${spec.title}: ${spec.ops.length} operations in ${areas.size} areas (${rel(prj.root, spec.file)})`);
  console.log('Each area: the file its rules go in; under it, the section heading of each operation. Records name an operation by its operationId.');
  for (const [file, a] of areas) {
    console.log(`\n${file}  (area "${a.area}", tag "${a.tag}", ${plural(a.ops.length, 'operation')})`);
    for (const o of a.ops) console.log(`  ## ${o.heading}${o.operationId ? '' : `   [no operationId: name it ${o.key}]`}`);
  }
  const ids = new Map();
  for (const o of spec.ops) if (o.operationId) ids.set(o.operationId, [...(ids.get(o.operationId) ?? []), o]);
  for (const [id, os] of ids) {
    if (os.length > 1) console.log(`\nwarning: ${os.map((o) => `${o.method} ${o.path}`).join(' and ')} share the operationId ${id}; a rule filed under it is listed under each. Say so in the report.`);
  }
  return 0;
}

function cmdSpec(prj, opts) {
  const spec = loadSpec(prj.src);
  const picked = pickOps(spec, opts.targets);
  const out = [];
  const P = new Printer(prj);
  if (opts.targets.includes('info')) {
    if (/\.json$/i.test(spec.file)) out.push(...P.general(spec.file, jsonDoc(spec.file)), '');
    else out.push(`The API as a whole: read info, servers, the security schemes and the tags at the top of ${P.cite(spec.file)}.`, '');
  }
  const yaml = picked.filter((o) => !o.raw);
  if (yaml.length) {
    out.push('These operations are in YAML files: read each one where it starts, and every schema it refers to. Cite the file you quote from.', '');
    for (const o of yaml) out.push(`## ${o.heading}   (src/${rel(prj.src, o.loc.file)}:${o.loc.line})`);
    out.push('');
  }
  const json = picked.filter((o) => o.raw);
  if (json.length) {
    out.push(`What the API definition says about ${plural(json.length, 'operation')}, then every schema they use. Quote this text exactly, and cite the file named after the heading.`, '');
    for (const o of json) out.push(...P.operation(o), '');
    if (P.queue.length) out.push('# Schemas', '');
    for (let i = 0; i < P.queue.length; i++) {
      const k = P.known.get(P.queue[i]);
      out.push(`### ${k.name}   (${P.cite(k.file)}${k.ptr ? `#${k.ptr}` : ''})`, ...P.schemaLines(k.node, k.file, '', 0), '');
    }
  }
  process.stdout.write(out.join('\n'));
  return 0;
}

function cmdQuotes(prj) {
  const spec = loadSpec(prj.src);
  const set = requireRecords(prj);
  const { errors, warnings, checked } = quoteProblems(set, spec, prj);
  for (const w of warnings) console.log(`warning: ${w}`);
  for (const e of errors) console.log(`error: ${e}`);
  console.log(`${plural(checked, 'record')} checked; ${errors.length} error(s), ${warnings.length} warning(s)`);
  console.log(errors.length ? 'NOT OK' : 'OK');
  return errors.length ? 1 : 0;
}

function cmdWrite(prj) {
  const spec = loadSpec(prj.src);
  const set = requireRecords(prj);
  const errors = [...checkRecords(set, spec, prj), ...strayEntries(prj)];
  if (errors.length) {
    for (const e of errors) console.log(`error: ${e}`);
    console.log(`${errors.length} error(s); nothing written`);
    return 1;
  }
  const assigned = assignIds(set, spec);
  saveRecordFiles(set);
  const records = live(set).map((x) => x.r);
  const files = renderRuleFiles(spec, records);
  fs.mkdirSync(path.join(prj.rules, 'operations'), { recursive: true });
  for (const name of ruleFilesOnDisk(prj).keys()) fs.rmSync(path.join(prj.rules, name));
  for (const [name, text] of files) fs.writeFileSync(path.join(prj.rules, name), text);
  const parsed = readRuleFiles(prj, spec, files);
  fs.writeFileSync(path.join(prj.rules, 'rules.md'), renderIndex(spec, parsed, files));
  const loud = records.filter((r) => r.loudness === 'loud').length;
  const opFiles = [...files.keys()].filter((n) => n.startsWith('operations/')).length;
  console.log(`gave ${plural(assigned, 'new record')} an id`);
  console.log(`wrote src/rules/: ${plural(records.length, 'rule')} (${loud} loud, ${records.length - loud} silent) in rules.md, every-request.md${files.has('background.md') ? ', background.md' : ''} and ${plural(opFiles, 'operations file')}`);
  if (!opFiles) console.log('warning: no rule is filed under an operation, so codegen will not add business-rules/ to the Context Plugin');
  if (parsed.errors.length) console.log(`${parsed.errors.length} problem(s) in the rule files; run check`);
  return 0;
}

function cmdMerge(prj, opts) {
  const spec = loadSpec(prj.src);
  const set = requireRecords(prj);
  const errors = checkRecords(set, spec, prj);
  if (errors.length) throw new Fail(`fix the records first (rules.mjs quotes lists the problems): ${errors[0]}`);
  if (live(set).some((x) => x.r.id === undefined)) throw new Fail('some records have no id yet: run `rules.mjs write` first');
  if (!opts.targets.length) {
    const pairs = likelyDuplicates(set, spec, prj);
    for (const { a, b, why } of pairs) {
      console.log(`${a.r.id} ~ ${b.r.id} (${why})\n  ${a.r.id}: ${clip(`${a.r.condition} → ${outcomeText(a.r)}`, 160)}\n  ${b.r.id}: ${clip(`${b.r.condition} → ${outcomeText(b.r)}`, 160)}`);
    }
    console.log(`${plural(pairs.length, 'likely duplicate')}. For each pair that is one rule: rules.mjs merge <keep-id> <drop-id>`);
    return 0;
  }
  const [keepId, ...dropIds] = opts.targets;
  const keep = findById(set, keepId);
  if (keep.r.removed !== undefined) throw new Fail(`\`${keepId}\` is removed (${keep.r.removed})`);
  const merged = { ...keep.r, operations: [...keep.r.operations], sources: [...keep.r.sources] };
  const drops = dropIds.map((id) => {
    const x = findById(set, id);
    if (x === keep) throw new Fail(`\`${id}\` is the record to keep`);
    if (x.r.removed !== undefined) throw new Fail(`\`${id}\` is already removed (${x.r.removed})`);
    return x;
  });
  // A rule for every request already covers each operation: it absorbs the others and stays filed alone.
  const everyKept = keep.r.operations.some(isEvery);
  const everyDropped = drops.find((x) => x.r.operations.some(isEvery));
  if (everyDropped && !everyKept) throw new Fail(`\`${everyDropped.r.id}\` is a rule for every request, which covers every operation: keep it, and drop the others`);
  for (const x of drops) {
    if (!everyKept) for (const u of x.r.operations) if (!merged.operations.some((v) => placeKey(v, spec) === placeKey(u, spec))) merged.operations.push(u);
    for (const s of x.r.sources) if (!merged.sources.some((t) => t.path === s.path && norm(t.quote) === norm(s.quote))) merged.sources.push(s);
    if (!merged.conflict && x.r.conflict) merged.conflict = x.r.conflict;
  }
  const problems = checkRecord(merged, spec, prj);
  if (problems.length) throw new Fail(`the merged record would not be valid: ${problems.join('; ')}`);
  saveRecord(keep, merged);
  for (const x of drops) saveRecord(x, { id: x.r.id, removed: `merged into ${keepId}` });
  saveRecordFiles(set);
  console.log(`merged ${dropIds.join(', ')} into ${keepId}; run rules.mjs write`);
  return 0;
}

function cmdSample(prj, opts) {
  const set = requireRecords(prj);
  const pool = live(set);
  if (!pool.length) throw new Fail('no records to sample');
  if (pool.some((x) => x.r.id === undefined)) throw new Fail('some records have no id yet: run `rules.mjs write` first');
  let seed = opts.seed ?? (Date.now() % 2147483646) + 1;
  const first = seed;
  const rand = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const chosen = [];
  // The same share of each group's file, at least one record from each.
  for (const e of set.files) {
    const mine = pool.filter((x) => x.entry === e);
    for (let i = mine.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [mine[i], mine[j]] = [mine[j], mine[i]];
    }
    chosen.push(...mine.slice(0, Math.ceil((mine.length * opts.percent) / 100)));
  }
  chosen.sort((a, b) => natural(a.r.id, b.r.id));
  fs.writeFileSync(path.join(prj.work, 'sample.jsonl'), chosen.map((x) => JSON.stringify(x.r)).join('\n') + '\n');
  console.log(`picked ${chosen.length} of ${pool.length} records (${opts.percent}% of each records file, seed ${first}) into ${WORK}/sample.jsonl`);
  console.log(`The second pass writes one verdict per record to ${WORK}/review.jsonl; then run rules.mjs review.`);
  return 0;
}

function cmdReview(prj) {
  const spec = loadSpec(prj.src);
  const set = requireRecords(prj);
  const file = path.join(prj.work, 'review.jsonl');
  if (!isFile(file)) throw new Fail(`no ${WORK}/review.jsonl: the second pass writes its verdicts there`);
  const errors = [];
  const verdicts = [];
  readText(file).split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const at = `${WORK}/review.jsonl:${i + 1}`;
    let v;
    try { v = JSON.parse(line); } catch (e) { errors.push(`${at}: not one JSON object on one line (${e.message})`); return; }
    const x = set.records.find((y) => y.r.id === v?.id);
    if (!x || x.r.removed !== undefined) { errors.push(`${at}: no record has the id ${JSON.stringify(v?.id)}`); return; }
    if (!['confirmed', 'corrected', 'rejected'].includes(v.verdict)) { errors.push(`${at}: "verdict" is confirmed, corrected or rejected`); return; }
    if (typeof v.reason !== 'string' || !v.reason.trim()) errors.push(`${at}: "reason" says why, in one line`);
    let after = x.r;
    if (v.verdict === 'corrected') {
      const c = v.corrected;
      if (!c || typeof c !== 'object' || Array.isArray(c) || !Object.keys(c).length) { errors.push(`${at}: "corrected" holds the fields the check changes`); return; }
      if ('id' in c || 'removed' in c) { errors.push(`${at}: "corrected" never changes "id" or "removed"`); return; }
      after = { ...x.r, ...c };
      for (const q of checkRecord(after, spec, prj)) errors.push(`${at}: after the correction, ${q}`);
    }
    if (v.verdict === 'rejected') after = { id: x.r.id, removed: `rejected in review: ${String(v.reason).trim()}` };
    verdicts.push({ x, v, after });
  });
  if (errors.length) {
    for (const e of errors) console.log(`error: ${e}`);
    console.log(`${errors.length} error(s); no verdict applied`);
    return 1;
  }
  for (const { x, after } of verdicts) if (after !== x.r) saveRecord(x, after);
  saveRecordFiles(set);
  let n = 1;
  while (isFile(path.join(prj.work, `review-${n}.jsonl`))) n++;
  fs.renameSync(file, path.join(prj.work, `review-${n}.jsonl`));
  const count = (k) => verdicts.filter((d) => d.v.verdict === k).length;
  console.log(`applied ${plural(verdicts.length, 'verdict')}: ${count('confirmed')} confirmed, ${count('corrected')} corrected, ${count('rejected')} rejected; kept as ${WORK}/review-${n}.jsonl. Run rules.mjs quotes, then write.`);
  return 0;
}

function cmdCheck(prj) {
  if (!isDir(prj.rules)) throw new Fail('no src/rules/ folder; run `rules.mjs write`');
  const spec = loadSpec(prj.src);
  const files = ruleFilesOnDisk(prj);
  const parsed = readRuleFiles(prj, spec, files);
  const errors = [...strayEntries(prj), ...parsed.errors];
  const warnings = [];
  const missing = codegenMissing(prj);
  if (missing.length) errors.push(`codegen adds business-rules/ to the Context Plugin only with rules.md, every-request.md and at least one operations/<area>.md; missing: ${missing.join(', ')}`);
  const index = path.join(prj.rules, 'rules.md');
  if (isFile(index) && readText(index).replace(/\r\n/g, '\n') !== renderIndex(spec, parsed, files)) {
    errors.push('src/rules/rules.md: not what `rules.mjs write` makes from the rule files (never edit src/rules/ by hand)');
  }
  const set = loadRecords(prj);
  if (set) {
    const q = quoteProblems(set, spec, prj);
    errors.push(...q.errors);
    warnings.push(...q.warnings);
    if (live(set).some((x) => x.r.id === undefined)) errors.push(`${WORK}/records/: some records have no id yet; run \`rules.mjs write\``);
    else if (!q.errors.length) {
      const want = renderRuleFiles(spec, live(set).map((x) => x.r));
      for (const name of new Set([...want.keys(), ...files.keys()])) {
        if ((files.get(name) ?? '').replace(/\r\n/g, '\n') !== (want.get(name) ?? '')) {
          errors.push(`src/rules/${name}: not what the records make; run \`rules.mjs write\` (never edit src/rules/ by hand)`);
        }
      }
    }
  } else {
    warnings.push(`no ${WORK}/records/: checked src/rules/ alone, without the records or their quotes`);
  }
  for (const w of warnings) console.log(`warning: ${w}`);
  for (const e of errors) console.log(`error: ${e}`);
  const n = new Set(parsed.rules.map((r) => r.id)).size;
  console.log(`${plural(n, 'rule')} in ${plural(parsed.sections.filter((s) => s.count).length, 'operation section')}; ${errors.length} error(s), ${warnings.length} warning(s)`);
  if (!missing.length) console.log('codegen: business-rules/ will be added to the Context Plugin');
  console.log(errors.length ? 'NOT OK' : 'OK');
  return errors.length ? 1 : 0;
}

const COMMANDS = { ops: cmdOps, spec: cmdSpec, quotes: cmdQuotes, write: cmdWrite, merge: cmdMerge, sample: cmdSample, review: cmdReview, check: cmdCheck };

try {
  const opts = parseArgs(process.argv.slice(2));
  process.exitCode = COMMANDS[opts.cmd](project(opts.input), opts);
} catch (e) {
  if (!(e instanceof Fail)) throw e;
  console.error(`error: ${e.message}`);
  process.exitCode = 2;
}
