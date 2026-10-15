// Team API (signed in with the team login: session cookie set by /api/auth/login):
//   GET  /api/admin/me              -> the signed-in team member and the whole team
//   GET  /api/admin/requests        -> every request (the full file as saved by the team space)
//   PUT  /api/admin/requests/:ref   -> save one file; refused (409) if a colleague saved it in the meantime
//   GET  /api/admin/team, POST /api/admin/team, PUT /api/admin/team/:id  -> manage the team (admin only)
//   /api/admin/affiliates…, /api/admin/codes/:code  -> partner programme (admin only, see server/affiliate.js)
import { json, now, readJson, fail, HttpError } from './http.js';
import { accessEmail } from './access.js';
import { sessionEmail, sameOrigin, hashPassword, changePassword } from './auth.js';
import { adminAffiliates } from './affiliate.js';

const COLORS = ['linear-gradient(100deg,#ff7a59,#ff4f9a)', '#7a5cff', '#14a3a3', '#e0a100', '#e5533d', '#2f80ed', '#1d9a62', '#b04ad8'];
const pretty = email => email.split('@')[0].split(/[._-]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ') || email;

// Who is calling: the team login session; Cloudflare Access is still accepted if it is ever put in front again.
async function whoami(request, env){
  const s = await sessionEmail(request, env); if (s) return { email: s };
  const host = new URL(request.url).hostname;
  if (env.DEV_ACCESS_EMAIL && (host === 'localhost' || host === '127.0.0.1')) return { email: String(env.DEV_ACCESS_EMAIL).toLowerCase(), dev: true };
  if (request.headers.get('cf-access-jwt-assertion')) return { email: await accessEmail(request, env) };
  throw new HttpError(401, 'not_signed_in');
}
// Readable temporary password: 3 groups of 4 letters/digits (no 0/O, 1/l/I)
const ALPHA = 'abcdefghjkmnpqrstuvwxyz23456789';
export const tempPassword = () => [...crypto.getRandomValues(new Uint8Array(12))].map(x => ALPHA[x % ALPHA.length]).join('').replace(/(.{4})(?=.)/g, '$1-');
async function member(env, who){
  const m = await env.DB.prepare('SELECT * FROM team WHERE email = ? AND active = 1').bind(who.email).first();
  if (m) return m;
  if (!who.dev) throw new HttpError(403, 'not_in_team');
  // local testing: create the person on the fly (first one admin)
  const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM team').first('n');
  const id = who.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'membre';
  await env.DB.prepare('INSERT OR IGNORE INTO team (email, id, name, role, color, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(who.email, id, pretty(who.email), n ? 'juriste' : 'admin', COLORS[n % COLORS.length], now()).run();
  return env.DB.prepare('SELECT * FROM team WHERE email = ?').bind(who.email).first();
}
const pub = m => ({ id: m.id, name: m.name, email: m.email, role: m.role, c: m.color, active: !!m.active });

export async function adminApi(request, env, path){
  try {
    sameOrigin(request);
    const me = await member(env, await whoami(request, env));
    const method = request.method;
    if (method === 'GET' && path === 'me') {
      const { results } = await env.DB.prepare('SELECT * FROM team ORDER BY created_at').all();
      return json({ me: { ...pub(me), mustChange: !!me.must_change }, team: results.map(pub) });
    }
    if (method === 'POST' && path === 'password') return await changePassword(request, env, me.email);
    if (path === 'affiliates' || path.startsWith('affiliates/') || path.startsWith('codes/')) {   // partner programme (admin only)
      if (me.role !== 'admin') throw new HttpError(403, 'admin_only');
      return await adminAffiliates(request, env, path, tempPassword);   // await: its errors are answered by the catch below
    }
    if (path === 'team' || path.startsWith('team/')) {
      if (me.role !== 'admin') throw new HttpError(403, 'admin_only');
      if (method === 'GET' && path === 'team') {
        const { results } = await env.DB.prepare('SELECT * FROM team ORDER BY created_at').all();
        return json({ team: results.map(m => ({ ...pub(m), hasPassword: !!m.pass_hash, mustChange: !!m.must_change })) });
      }
      if (method === 'POST' && path === 'team') {
        const b = await readJson(request, 4e3);
        const email = String(b.email || '').trim().toLowerCase(), name = String(b.name || '').trim().slice(0, 60) || pretty(email);
        if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) throw new HttpError(400, 'bad_email');
        if (await env.DB.prepare('SELECT 1 FROM team WHERE email = ?').bind(email).first()) throw new HttpError(409, 'email_exists');
        const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM team').first('n');
        let id = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'membre';
        if (await env.DB.prepare('SELECT 1 FROM team WHERE id = ?').bind(id).first()) id += '-' + (n + 1);
        const pw = tempPassword(), h = await hashPassword(pw);
        await env.DB.prepare('INSERT INTO team (email, id, name, role, color, created_at, pass_hash, pass_salt, must_change, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)')
          .bind(email, id, name, b.role === 'admin' ? 'admin' : 'juriste', COLORS[n % COLORS.length], now(), h.hash, h.salt).run();
        return json({ ok: true, id, tempPassword: pw });
      }
      const t = path.match(/^team\/([a-z0-9-]+)$/);
      if (method === 'PUT' && t) {
        const b = await readJson(request, 4e3), m = await env.DB.prepare('SELECT * FROM team WHERE id = ?').bind(t[1]).first();
        if (!m) throw new HttpError(404, 'not_found');
        if (m.email === me.email && (b.role === 'juriste' || b.active === false)) throw new HttpError(400, 'not_yourself');   // never lock yourself out
        const name = b.name != null ? String(b.name).trim().slice(0, 60) || m.name : m.name;
        const role = b.role === 'admin' || b.role === 'juriste' ? b.role : m.role;
        const active = b.active === false ? 0 : b.active === true ? 1 : m.active;
        const st = [env.DB.prepare('UPDATE team SET name = ?, role = ?, active = ? WHERE id = ?').bind(name, role, active, m.id)];
        let pw = null;
        if (b.resetPassword) { pw = tempPassword(); const h = await hashPassword(pw); st.push(env.DB.prepare('UPDATE team SET pass_hash = ?, pass_salt = ?, must_change = 1 WHERE id = ?').bind(h.hash, h.salt, m.id)); }
        if (b.resetPassword || !active) st.push(env.DB.prepare('DELETE FROM sessions WHERE email = ?').bind(m.email));   // signs the person out everywhere
        await env.DB.batch(st);
        return json({ ok: true, tempPassword: pw });
      }
      throw new HttpError(404, 'not_found');
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
