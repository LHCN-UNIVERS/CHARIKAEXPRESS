// Team login with e-mail + password.
// - Passwords: PBKDF2-SHA256 (100 000 iterations) with a random salt per person; only the hash is stored.
// - Session: random 32-byte token in an HttpOnly, Secure, SameSite=Strict cookie (7 days); the database keeps its SHA-256.
// - Brute force: 8 wrong passwords for one e-mail (or 30 from one connection) in 15 minutes block the login for 15 minutes.
import { json, now, readJson, HttpError } from './http.js';

const COOKIE = 'ce_session', DAYS = 7, ITER = 100000;
const hex = buf => [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
const unhex = h => new Uint8Array(h.match(/../g).map(x => parseInt(x, 16)));
const sha256 = async s => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
export const randomHex = n => hex(crypto.getRandomValues(new Uint8Array(n)));

export async function hashPassword(password, saltHex = randomHex(16)){
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(saltHex), iterations: ITER }, key, 256);
  return { hash: hex(bits), salt: saltHex };
}
// Constant-time comparison of two hex strings
const same = (a, b) => { if (!a || !b || a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };

export function checkPasswordRules(p){
  if (typeof p !== 'string' || p.length < 10) throw new HttpError(400, 'password_too_short');
  if (p.length > 200) throw new HttpError(400, 'password_too_long');
}

// Mutating calls must come from our own pages (JSON body, same origin): blocks cross-site form posts.
export function sameOrigin(request){
  if (request.method === 'GET' || request.method === 'HEAD') return;
  const origin = request.headers.get('origin'), host = new URL(request.url).host;
  if (origin && new URL(origin).host !== host) throw new HttpError(403, 'bad_origin');
  if (!(request.headers.get('content-type') || '').includes('application/json')) throw new HttpError(415, 'json_only');
}

const cookieOf = request => ((request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([a-f0-9]{64})')) || [])[1];
const setCookie = (request, value, maxAge) => {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
};

// The e-mail of the signed-in person, or null
export async function sessionEmail(request, env){
  const t = cookieOf(request); if (!t) return null;
  const s = await env.DB.prepare('SELECT email, expires_at FROM sessions WHERE token_hash = ?').bind(await sha256(t)).first();
  if (!s || s.expires_at < now()) return null;
  return s.email;
}

async function ipKey(request){ return 'i:' + (await sha256('ce:' + (request.headers.get('cf-connecting-ip') || ''))).slice(0, 24); }

export async function login(request, env){
  sameOrigin(request);
  const b = await readJson(request, 4e3);
  const email = String(b.email || '').trim().toLowerCase().slice(0, 160), password = String(b.password || '');
  const since = new Date(Date.now() - 15 * 60e3).toISOString(), ik = await ipKey(request), ek = 'e:' + email;
  const fails = async k => env.DB.prepare('SELECT COUNT(*) AS n FROM login_fails WHERE k = ? AND at > ?').bind(k, since).first('n');
  if ((await fails(ek)) >= 8 || (await fails(ik)) >= 30) throw new HttpError(429, 'too_many_attempts');
  const m = await env.DB.prepare('SELECT * FROM team WHERE email = ? AND active = 1').bind(email).first();
  const ok = m && m.pass_hash && same((await hashPassword(password, m.pass_salt)).hash, m.pass_hash);
  if (!ok) {
    if (!m || !m.pass_hash) await hashPassword(password);     // same time whether the e-mail exists or not
    await env.DB.batch([env.DB.prepare('INSERT INTO login_fails (k, at) VALUES (?, ?), (?, ?)').bind(ek, now(), ik, now()),
      env.DB.prepare('DELETE FROM login_fails WHERE at < ?').bind(new Date(Date.now() - 86400e3).toISOString())]);
    throw new HttpError(401, 'bad_credentials');
  }
  const token = randomHex(32), exp = new Date(Date.now() + DAYS * 86400e3).toISOString();
  await env.DB.batch([
    env.DB.prepare('INSERT INTO sessions (token_hash, email, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(await sha256(token), email, now(), exp),
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now()),
    env.DB.prepare('DELETE FROM login_fails WHERE k = ?').bind(ek)
  ]);
  const res = json({ ok: true, mustChange: !!m.must_change });
  res.headers.append('set-cookie', setCookie(request, token, DAYS * 86400));
  return res;
}

export async function logout(request, env){
  sameOrigin(request);
  const t = cookieOf(request);
  if (t) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(t)).run();
  const res = json({ ok: true });
  res.headers.append('set-cookie', setCookie(request, '', 0));
  return res;
}

// Change one's own password (also used after a temporary password); other sessions of that person are closed.
export async function changePassword(request, env, email){
  sameOrigin(request);
  const b = await readJson(request, 4e3);
  const m = await env.DB.prepare('SELECT * FROM team WHERE email = ?').bind(email).first();
  if (!m || !same((await hashPassword(String(b.current || ''), m.pass_salt)).hash, m.pass_hash)) throw new HttpError(401, 'bad_current_password');
  checkPasswordRules(b.password);
  const h = await hashPassword(b.password), keep = await sha256(cookieOf(request) || '');
  await env.DB.batch([
    env.DB.prepare('UPDATE team SET pass_hash = ?, pass_salt = ?, must_change = 0 WHERE email = ?').bind(h.hash, h.salt, email),
    env.DB.prepare('DELETE FROM sessions WHERE email = ? AND token_hash != ?').bind(email, keep)
  ]);
  return json({ ok: true });
}
