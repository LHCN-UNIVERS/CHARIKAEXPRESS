// The file vault of each company file (team space): the documents generated in « Rédaction », and any scan the team adds
// (legalised documents, RC, ICE, attestation…). Files live in D1 (table vault_files, created on first use), like the centre files.
//   GET    vault/:ref        -> the list of a file's documents (no content)
//   POST   vault/:ref        -> add documents { files:[{ name, mime, data (base64), kind:'gen'|'scan' }], replaceGen?:true }
//   GET    vault-file/:id    -> one document (download)
//   DELETE vault-file/:id    -> remove one document (admin, or the person who added it)
import { json, now, readJson, HttpError } from './http.js';
import { randomHex } from './auth.js';

const MAX_FILE = 1.2e6;                 // bytes: one D1 row stays under its 2 MB limit
const MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const SCHEMA = `CREATE TABLE IF NOT EXISTS vault_files (id TEXT PRIMARY KEY, ref TEXT NOT NULL, kind TEXT NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL,
  size INTEGER NOT NULL, data BLOB NOT NULL, by_id TEXT, created_at TEXT NOT NULL)`;
let ready = false;
const ensure = async env => { if (!ready) { await env.DB.batch([env.DB.prepare(SCHEMA), env.DB.prepare('CREATE INDEX IF NOT EXISTS vault_files_ref ON vault_files(ref)')]); ready = true; } };
const meta = f => ({ id: f.id, ref: f.ref, kind: f.kind, name: f.name, mime: f.mime, size: f.size, by: f.by_id || null, createdAt: f.created_at });

export async function vaultApi(request, env, path, me){
  await ensure(env);
  const method = request.method;
  const v = path.match(/^vault\/(CE-\d{6})$/);
  if (v && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT id, ref, kind, name, mime, size, by_id, created_at FROM vault_files WHERE ref = ? ORDER BY created_at DESC').bind(v[1]).all();
    return json({ files: results.map(meta) });
  }
  if (v && method === 'POST') {
    const ref = v[1], b = await readJson(request, 12e6);
    if (!await env.DB.prepare('SELECT 1 FROM requests WHERE ref = ?').bind(ref).first()) throw new HttpError(404, 'not_found');
    const list = Array.isArray(b.files) ? b.files.slice(0, 20) : [];
    if (!list.length) throw new HttpError(400, 'no_file');
    const st = [], at = now(), added = [];
    if (b.replaceGen) st.push(env.DB.prepare("DELETE FROM vault_files WHERE ref = ? AND kind = 'gen'").bind(ref));   // a new generation replaces the previous one
    for (const f of list) {
      const mime = String(f.mime || ''), name = String(f.name || 'document').slice(0, 140), kind = f.kind === 'gen' ? 'gen' : 'scan';
      if (!MIMES.includes(mime)) throw new HttpError(400, 'bad_file_type');
      let bin; try { bin = Uint8Array.from(atob(String(f.data || '')), c => c.charCodeAt(0)); } catch (e) { throw new HttpError(400, 'bad_file'); }
      if (!bin.length) throw new HttpError(400, 'bad_file');
      if (bin.length > MAX_FILE) throw new HttpError(413, 'file_too_large');
      const id = 'vf-' + randomHex(8);
      st.push(env.DB.prepare('INSERT INTO vault_files (id, ref, kind, name, mime, size, data, by_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, ref, kind, name, mime, bin.length, bin, me.id, at));
      added.push({ id, ref, kind, name, mime, size: bin.length, by: me.id, createdAt: at });
    }
    await env.DB.batch(st);
    return json({ ok: true, files: added });
  }
  const f = path.match(/^vault-file\/(vf-[a-f0-9]{16})$/);
  if (f && method === 'GET') {
    const row = await env.DB.prepare('SELECT * FROM vault_files WHERE id = ?').bind(f[1]).first();
    if (!row) throw new HttpError(404, 'not_found');
    const data = row.data instanceof ArrayBuffer ? row.data : new Uint8Array(row.data).buffer;
    const inline = /^(application\/pdf|image\/)/.test(row.mime);
    return new Response(data, { headers: { 'content-type': row.mime, 'cache-control': 'private, max-age=300', 'x-content-type-options': 'nosniff',
      'content-disposition': `${inline ? 'inline' : 'attachment'}; filename="${row.name.replace(/[^\w.\- ]+/g, '_')}"` } });
  }
  if (f && method === 'DELETE') {
    const row = await env.DB.prepare('SELECT by_id FROM vault_files WHERE id = ?').bind(f[1]).first();
    if (!row) throw new HttpError(404, 'not_found');
    if (me.role !== 'admin' && row.by_id !== me.id) throw new HttpError(403, 'not_allowed');
    await env.DB.prepare('DELETE FROM vault_files WHERE id = ?').bind(f[1]).run();
    return json({ ok: true });
  }
  throw new HttpError(404, 'not_found');
}
