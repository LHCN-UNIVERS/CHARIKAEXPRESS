// Partner (affiliate) programme.
// A partner signs up on partenaires.html, the team validates the account, then the partner signs in on partenaire.html.
// Clients use one of the partner's promo codes in the request form; the file then records { promo, affiliate, remise }.
// The partner earns COMMISSION MAD per file that reaches "Documents livrés" and is fully paid; the team marks it paid
// (data.affPaid) from the team space. Partners only ever see the reference and the progress of their files.
//
//   POST /api/aff/signup    public: create a pending partner account
//   POST /api/aff/login     POST /api/aff/logout
//   GET  /api/aff/me        the partner, their codes and their files (reference + progress + commission state)
//   PUT  /api/aff/me        update phone / payment details
//   POST /api/aff/password  change password
//   GET  /api/promo?code=X  public: is this promo code valid, and what discount does it give
// Team side (admin only, called from server/admin.js): list / create / validate partners, manage their promo codes.
import { json, now, readJson, fail, HttpError } from './http.js';
import { sameOrigin, hashPassword, checkPasswordRules, randomHex, sha256, same, ipKey } from './auth.js';

export const COMMISSION = 350;
const DONE = 10;                                  // index of "Documents livrés" (admin.html WORKFLOW length)
const COOKIE = 'ce_aff', DAYS = 30;
const str = (v, max = 120) => String(v ?? '').trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
export const CODE = /^[A-Z0-9-]{3,20}$/;
const fullyPaid = r => !!(r.paid?.full || (r.paid?.avance && r.paid?.second && r.paid?.final));

const cookieOf = request => ((request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([a-f0-9]{64})')) || [])[1];
const setCookie = (request, value, maxAge) => `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
const pubAff = a => ({ id: a.id, name: a.name, company: a.company || '', email: a.email, phone: a.phone || '', city: a.city || '', profile: a.profile || '',
  payMethod: a.pay_method || 'virement', payInfo: a.pay_info || '', status: a.status, createdAt: a.created_at });

async function tooMany(env, k, max, minutes){
  const since = new Date(Date.now() - minutes * 60e3).toISOString();
  return (await env.DB.prepare('SELECT COUNT(*) AS n FROM login_fails WHERE k = ? AND at > ?').bind(k, since).first('n')) >= max;
}
const addFail = (env, ...ks) => env.DB.batch(ks.map(k => env.DB.prepare('INSERT INTO login_fails (k, at) VALUES (?, ?)').bind(k, now())));

// First free code built from the name: "Amal Bennani" -> AMAL, AMAL2, …
export async function defaultCode(env, name){
  const base = (str(name).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().match(/[A-Z0-9]+/g) || ['PARTENAIRE'])[0].slice(0, 12).padEnd(3, 'X');
  for (let i = 1; i < 50; i++) {
    const c = i === 1 ? base : base + i;
    if (!(await env.DB.prepare('SELECT 1 FROM promo_codes WHERE code = ?').bind(c).first())) return c;
  }
  return base + randomHex(2).toUpperCase();
}

// The promo code as the request form may use it: active code of an active partner
export async function promoInfo(env, code){
  code = str(code, 20).toUpperCase();
  if (!CODE.test(code)) return null;
  return env.DB.prepare("SELECT p.code, p.discount, p.affiliate_id FROM promo_codes p JOIN affiliates a ON a.id = p.affiliate_id WHERE p.code = ? AND p.active = 1 AND a.status = 'active'").bind(code).first();
}

async function signedIn(request, env){
  const t = cookieOf(request); if (!t) throw new HttpError(401, 'not_signed_in');
  const s = await env.DB.prepare('SELECT affiliate_id, expires_at FROM aff_sessions WHERE token_hash = ?').bind(await sha256(t)).first();
  if (!s || s.expires_at < now()) throw new HttpError(401, 'not_signed_in');
  const a = await env.DB.prepare('SELECT * FROM affiliates WHERE id = ?').bind(s.affiliate_id).first();
  if (!a || a.status !== 'active') throw new HttpError(403, 'not_active');
  return a;
}

export async function promoApi(request, env){
  try {
    const p = await promoInfo(env, new URL(request.url).searchParams.get('code'));
    if (!p) return json({ error: 'not_found' }, 404);
    return json({ ok: true, code: p.code, discount: p.discount });
  } catch (e) { return fail(e); }
}

export async function affApi(request, env, path){
  try {
    sameOrigin(request);
    const method = request.method;

    if (method === 'POST' && path === 'signup') {
      const ik = 's' + await ipKey(request);
      if (await tooMany(env, ik, 5, 60)) throw new HttpError(429, 'too_many');
      const b = await readJson(request, 6e3);
      if (b.website) return json({ ok: true });                                   // robot (hidden field filled)
      const email = str(b.email, 160).toLowerCase(), name = str(b.name, 80);
      if (!name || !EMAIL.test(email) || str(b.phone, 40).replace(/\D/g, '').length < 9) throw new HttpError(400, 'missing_fields');
      if (!b.cgu) throw new HttpError(400, 'cgu');
      checkPasswordRules(b.password);
      if (await env.DB.prepare('SELECT 1 FROM affiliates WHERE email = ?').bind(email).first()) throw new HttpError(409, 'email_exists');
      const h = await hashPassword(b.password), id = 'af-' + randomHex(5);
      await env.DB.prepare('INSERT INTO affiliates (id, email, name, company, phone, city, profile, pay_method, pay_info, status, pass_hash, pass_salt, must_change, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)')
        .bind(id, email, name, str(b.company, 80), str(b.phone, 40), str(b.city, 60), str(b.profile, 60), b.payMethod === 'cashplus' ? 'cashplus' : 'virement', str(b.payInfo, 60), 'pending', h.hash, h.salt, now()).run();
      await addFail(env, ik);                                                      // counts sign-ups per connection
      return json({ ok: true });
    }

    if (method === 'POST' && path === 'login') {
      const b = await readJson(request, 4e3);
      const email = str(b.email, 160).toLowerCase(), ek = 'ae:' + email, ik = await ipKey(request);
      if ((await tooMany(env, ek, 8, 15)) || (await tooMany(env, ik, 30, 15))) throw new HttpError(429, 'too_many_attempts');
      const a = await env.DB.prepare('SELECT * FROM affiliates WHERE email = ?').bind(email).first();
      const ok = a && a.pass_hash && same((await hashPassword(String(b.password || ''), a.pass_salt)).hash, a.pass_hash);
      if (!ok) { if (!a) await hashPassword(String(b.password || '')); await addFail(env, ek, ik); throw new HttpError(401, 'bad_credentials'); }
      if (a.status !== 'active') throw new HttpError(403, a.status);              // 'pending', 'refused' or 'suspended'
      const token = randomHex(32);
      await env.DB.batch([
        env.DB.prepare('INSERT INTO aff_sessions (token_hash, affiliate_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(await sha256(token), a.id, now(), new Date(Date.now() + DAYS * 86400e3).toISOString()),
        env.DB.prepare('DELETE FROM aff_sessions WHERE expires_at < ?').bind(now()),
        env.DB.prepare('DELETE FROM login_fails WHERE k = ?').bind(ek)
      ]);
      const res = json({ ok: true, mustChange: !!a.must_change });
      res.headers.append('set-cookie', setCookie(request, token, DAYS * 86400));
      return res;
    }

    if (method === 'POST' && path === 'logout') {
      const t = cookieOf(request);
      if (t) await env.DB.prepare('DELETE FROM aff_sessions WHERE token_hash = ?').bind(await sha256(t)).run();
      const res = json({ ok: true }); res.headers.append('set-cookie', setCookie(request, '', 0)); return res;
    }

    const a = await signedIn(request, env);

    if (method === 'GET' && path === 'me') {
      const { results: codes } = await env.DB.prepare('SELECT code, discount, active FROM promo_codes WHERE affiliate_id = ? ORDER BY created_at').bind(a.id).all();
      const { results } = await env.DB.prepare("SELECT data FROM requests WHERE json_extract(data, '$.affiliate') = ? ORDER BY created_at DESC").bind(a.id).all();
      const files = results.map(x => JSON.parse(x.data)).filter(r => !r.archived && r.kind !== 'rappel').map(r => ({
        ref: r.ref, createdAt: r.createdAt, step: r.step || 0, delivered: (r.step || 0) >= DONE, paid: fullyPaid(r), affPaid: r.affPaid || null, code: r.promo || ''
      }));
      return json({ me: { ...pubAff(a), mustChange: !!a.must_change }, codes: codes.map(c => ({ ...c, active: !!c.active })), files, commission: COMMISSION });
    }
    if (method === 'PUT' && path === 'me') {
      const b = await readJson(request, 4e3);
      await env.DB.prepare('UPDATE affiliates SET phone = ?, pay_method = ?, pay_info = ? WHERE id = ?')
        .bind(str(b.phone, 40) || a.phone, b.payMethod === 'cashplus' ? 'cashplus' : 'virement', str(b.payInfo, 60), a.id).run();
      return json({ ok: true });
    }
    if (method === 'POST' && path === 'password') {
      const b = await readJson(request, 4e3);
      if (!same((await hashPassword(String(b.current || ''), a.pass_salt)).hash, a.pass_hash)) throw new HttpError(401, 'bad_current_password');
      checkPasswordRules(b.password);
      const h = await hashPassword(b.password), keep = await sha256(cookieOf(request) || '');
      await env.DB.batch([
        env.DB.prepare('UPDATE affiliates SET pass_hash = ?, pass_salt = ?, must_change = 0 WHERE id = ?').bind(h.hash, h.salt, a.id),
        env.DB.prepare('DELETE FROM aff_sessions WHERE affiliate_id = ? AND token_hash != ?').bind(a.id, keep)
      ]);
      return json({ ok: true });
    }
    throw new HttpError(404, 'not_found');
  } catch (e) { return fail(e); }
}

// ---------- Team side (admin only) ----------
//   GET  affiliates                 every partner with their codes
//   POST affiliates                 add a partner directly (active, temporary password, default code)
//   PUT  affiliates/:id             { status, resetPassword }  (validating a partner gives them a default code)
//   POST affiliates/:id/codes       { code, discount }
//   PUT  codes/:code                { discount, active }
export async function adminAffiliates(request, env, path, tempPassword){
  const method = request.method;
  if (method === 'GET' && path === 'affiliates') {
    const { results } = await env.DB.prepare('SELECT * FROM affiliates ORDER BY created_at DESC').all();
    const { results: codes } = await env.DB.prepare('SELECT * FROM promo_codes ORDER BY created_at').all();
    return json({ commission: COMMISSION, affiliates: results.map(a => ({ ...pubAff(a), codes: codes.filter(c => c.affiliate_id === a.id).map(c => ({ code: c.code, discount: c.discount, active: !!c.active })) })) });
  }
  if (method === 'POST' && path === 'affiliates') {
    const b = await readJson(request, 4e3);
    const email = str(b.email, 160).toLowerCase(), name = str(b.name, 80);
    if (!name || !EMAIL.test(email)) throw new HttpError(400, 'missing_fields');
    if (await env.DB.prepare('SELECT 1 FROM affiliates WHERE email = ?').bind(email).first()) throw new HttpError(409, 'email_exists');
    const pw = tempPassword(), h = await hashPassword(pw), id = 'af-' + randomHex(5), code = await defaultCode(env, name);
    await env.DB.batch([
      env.DB.prepare('INSERT INTO affiliates (id, email, name, company, phone, city, profile, pay_method, pay_info, status, pass_hash, pass_salt, must_change, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)')
        .bind(id, email, name, str(b.company, 80), str(b.phone, 40), str(b.city, 60), str(b.profile, 60), 'virement', '', 'active', h.hash, h.salt, now()),
      env.DB.prepare('INSERT INTO promo_codes (code, affiliate_id, discount, active, created_at) VALUES (?, ?, 0, 1, ?)').bind(code, id, now())
    ]);
    return json({ ok: true, id, code, tempPassword: pw });
  }
  const m = path.match(/^affiliates\/(af-[a-f0-9]+)(\/codes)?$/);
  if (m && method === 'PUT' && !m[2]) {
    const b = await readJson(request, 4e3), a = await env.DB.prepare('SELECT * FROM affiliates WHERE id = ?').bind(m[1]).first();
    if (!a) throw new HttpError(404, 'not_found');
    const status = ['pending', 'active', 'refused', 'suspended'].includes(b.status) ? b.status : a.status;
    const st = [env.DB.prepare('UPDATE affiliates SET status = ? WHERE id = ?').bind(status, a.id)];
    let code = null, pw = null;
    if (status === 'active' && !(await env.DB.prepare('SELECT 1 FROM promo_codes WHERE affiliate_id = ?').bind(a.id).first())) {
      code = await defaultCode(env, a.name);
      st.push(env.DB.prepare('INSERT INTO promo_codes (code, affiliate_id, discount, active, created_at) VALUES (?, ?, 0, 1, ?)').bind(code, a.id, now()));
    }
    if (b.resetPassword) { pw = tempPassword(); const h = await hashPassword(pw); st.push(env.DB.prepare('UPDATE affiliates SET pass_hash = ?, pass_salt = ?, must_change = 1 WHERE id = ?').bind(h.hash, h.salt, a.id)); }
    if (status !== 'active' || b.resetPassword) st.push(env.DB.prepare('DELETE FROM aff_sessions WHERE affiliate_id = ?').bind(a.id));
    await env.DB.batch(st);
    return json({ ok: true, code, tempPassword: pw });
  }
  if (m && m[2] && method === 'POST') {
    const b = await readJson(request, 2e3), code = str(b.code, 20).toUpperCase(), discount = Math.max(0, Math.min(5000, Math.round(+b.discount || 0)));
    if (!CODE.test(code)) throw new HttpError(400, 'bad_code');
    if (!(await env.DB.prepare('SELECT 1 FROM affiliates WHERE id = ?').bind(m[1]).first())) throw new HttpError(404, 'not_found');
    if (await env.DB.prepare('SELECT 1 FROM promo_codes WHERE code = ?').bind(code).first()) throw new HttpError(409, 'code_exists');
    await env.DB.prepare('INSERT INTO promo_codes (code, affiliate_id, discount, active, created_at) VALUES (?, ?, ?, 1, ?)').bind(code, m[1], discount, now()).run();
    return json({ ok: true, code });
  }
  const c = path.match(/^codes\/([A-Z0-9-]{3,20})$/);
  if (c && method === 'PUT') {
    const b = await readJson(request, 2e3), cur = await env.DB.prepare('SELECT * FROM promo_codes WHERE code = ?').bind(c[1]).first();
    if (!cur) throw new HttpError(404, 'not_found');
    const discount = b.discount != null ? Math.max(0, Math.min(5000, Math.round(+b.discount || 0))) : cur.discount;
    const active = b.active === false ? 0 : b.active === true ? 1 : cur.active;
    await env.DB.prepare('UPDATE promo_codes SET discount = ?, active = ? WHERE code = ?').bind(discount, active, cur.code).run();
    return json({ ok: true });
  }
  throw new HttpError(404, 'not_found');
}
