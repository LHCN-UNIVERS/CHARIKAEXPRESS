// Team API, behind Cloudflare Access:
//   GET  /api/admin/me              -> the signed-in team member and the whole team
//   GET  /api/admin/requests        -> every request (the full file as saved by the team space)
//   PUT  /api/admin/requests/:ref   -> save one file; refused (409) if a colleague saved it in the meantime
import { json, now, readJson, fail, HttpError } from './http.js';
import { accessEmail } from './access.js';

const COLORS = ['linear-gradient(100deg,#ff7a59,#ff4f9a)', '#7a5cff', '#14a3a3', '#e0a100', '#e5533d', '#2f80ed', '#1d9a62', '#b04ad8'];
const pretty = email => email.split('@')[0].split(/[._-]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ') || email;

// The team is whoever Cloudflare Access lets in: a first visit adds the person (the very first one becomes admin).
async function member(env, email){
  let m = await env.DB.prepare('SELECT * FROM team WHERE email = ?').bind(email).first();
  if (m) return m;
  const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM team').first('n');
  let id = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'membre';
  if (await env.DB.prepare('SELECT 1 FROM team WHERE id = ?').bind(id).first()) id += '-' + (n + 1);
  m = { email, id, name: pretty(email), role: n === 0 ? 'admin' : 'juriste', color: COLORS[n % COLORS.length], created_at: now() };
  await env.DB.prepare('INSERT OR IGNORE INTO team (email, id, name, role, color, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(m.email, m.id, m.name, m.role, m.color, m.created_at).run();
  return (await env.DB.prepare('SELECT * FROM team WHERE email = ?').bind(email).first()) || m;
}
const pub = m => ({ id: m.id, name: m.name, email: m.email, role: m.role, c: m.color });

export async function adminApi(request, env, path){
  try {
    const me = await member(env, await accessEmail(request, env));
    const method = request.method;
    if (method === 'GET' && path === 'me') {
      const { results } = await env.DB.prepare('SELECT * FROM team ORDER BY created_at').all();
      return json({ me: pub(me), team: results.map(pub) });
    }
    if (method === 'GET' && path === 'requests') {
      const { results } = await env.DB.prepare('SELECT ref, updated_at, data FROM requests ORDER BY created_at DESC').all();
      return json({ requests: results.map(x => ({ ref: x.ref, updated_at: x.updated_at, data: JSON.parse(x.data) })) });
    }
    const m = path.match(/^requests\/(CE-\d{6})$/);
    if (method === 'PUT' && m) {
      const b = await readJson(request, 900e3), ref = m[1];
      if (!b || typeof b.data !== 'object' || b.data.ref !== ref) throw new HttpError(400, 'bad_body');
      const cur = await env.DB.prepare('SELECT updated_at, data FROM requests WHERE ref = ?').bind(ref).first();
      if (!cur) throw new HttpError(404, 'not_found');
      if (cur.updated_at !== b.base) return json({ error: 'conflict', updated_at: cur.updated_at, data: JSON.parse(cur.data) }, 409);
      const at = now();
      const res = await env.DB.prepare('UPDATE requests SET data = ?, updated_at = ? WHERE ref = ? AND updated_at = ?').bind(JSON.stringify(b.data), at, ref, b.base).run();
      if (!res.meta.changes) return json({ error: 'conflict' }, 409);
      return json({ ok: true, updated_at: at });
    }
    throw new HttpError(404, 'not_found');
  } catch (e) { return fail(e); }
}
