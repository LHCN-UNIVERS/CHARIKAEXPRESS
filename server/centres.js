// Domiciliation centres (marketplace).
// A centre signs up on domiciliation.html, the team checks it and activates it, then it signs in on centre.html.
// In the request form the client picks an active centre of their city: the domiciliation stays included in the pack
// (Charika Express pays the centre its agreed rate). The choice is kept in the « domi » table, one row per request,
// so that the centre and the team never overwrite each other's work on the request file itself.
//   status: new (waiting for the centre) → accepted → done (attestation sent) · refused (the team picks another centre)
//
//   GET  /api/centres                 public: active centres taking clients (for the request form)
//   GET  /api/centres/photo/:id       public: a centre photo
//   POST /api/centre/signup           public: create a pending centre account (with optional photos / documents)
//   POST /api/centre/login · logout · password
//   GET  /api/centre/me               the centre, its requests, its files
//   PUT  /api/centre/me               phone, services, availability
//   PUT  /api/centre/requests/:ref    { action: 'accept' | 'refuse' }
//   POST /api/centre/requests/:ref/attestation   { name, mime, data (base64) }
//   GET  /api/centre/files/:id        a file of this centre (its attestations, its documents)
// Team side (admin only, called from server/admin.js): see adminCentres below.
import { json, now, readJson, fail, HttpError } from './http.js';
import { sameOrigin, hashPassword, checkPasswordRules, randomHex, sha256, same, ipKey } from './auth.js';

const COOKIE = 'ce_ctr', DAYS = 30;
const str = (v, max = 120) => String(v ?? '').trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
export const SERVICES = ['courrier', 'scan', 'reunion', 'bureau', 'standard', 'parking'];
const MIMES = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_FILE = 1.2e6;                                    // bytes, one D1 row stays under its 2 MB limit
export const monthsOf = plan => plan === 'essentiel' ? 12 : 24;

const cookieOf = request => ((request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([a-f0-9]{64})')) || [])[1];
const setCookie = (request, value, maxAge) => `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
const services = v => (Array.isArray(v) ? v : []).filter(s => SERVICES.includes(s));
const parseList = s => { try { return JSON.parse(s || '[]'); } catch (e) { return []; } };
const rate = v => Math.max(0, Math.min(50000, Math.round(+v || 0)));
const pubCentre = c => ({ id: c.id, email: c.email, name: c.name, company: c.company || '', contact: c.contact || '', phone: c.phone || '',
  city: c.city || '', district: c.district || '', address: c.address || '', services: parseList(c.services), rate12: c.rate12 || 0, rate24: c.rate24 || 0,
  rc: c.rc || '', ice: c.ice || '', status: c.status, available: !!c.available, photo: c.photo || null, createdAt: c.created_at });
const fileMeta = f => ({ id: f.id, kind: f.kind, ref: f.ref || null, name: f.name, mime: f.mime, size: f.size, createdAt: f.created_at });

async function tooMany(env, k, max, minutes){
  const since = new Date(Date.now() - minutes * 60e3).toISOString();
  return (await env.DB.prepare('SELECT COUNT(*) AS n FROM login_fails WHERE k = ? AND at > ?').bind(k, since).first('n')) >= max;
}
const addFail = (env, ...ks) => env.DB.batch(ks.map(k => env.DB.prepare('INSERT INTO login_fails (k, at) VALUES (?, ?)').bind(k, now())));

// A file sent as base64 inside JSON (same-origin JSON only, like every other call)
function decodeFile(f, kinds = Object.keys(MIMES)){
  const mime = str(f?.mime, 40), name = str(f?.name, 120) || 'fichier';
  if (!kinds.includes(mime)) throw new HttpError(400, 'bad_file_type');
  let bin;
  try { bin = Uint8Array.from(atob(String(f.data || '')), c => c.charCodeAt(0)); } catch (e) { throw new HttpError(400, 'bad_file'); }
  if (!bin.length) throw new HttpError(400, 'bad_file');
  if (bin.length > MAX_FILE) throw new HttpError(413, 'file_too_large');
  return { mime, name, bin };
}
const insertFile = (env, centreId, kind, ref, f) => {
  const id = 'fl-' + randomHex(8);
  return [id, env.DB.prepare('INSERT INTO centre_files (id, centre_id, kind, ref, name, mime, size, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, centreId, kind, ref, f.name, f.mime, f.bin.length, f.bin, now())];
};
export async function fileResponse(env, id, where = '', ...args){
  const f = await env.DB.prepare('SELECT * FROM centre_files WHERE id = ?' + where).bind(id, ...args).first();
  if (!f) throw new HttpError(404, 'not_found');
  const data = f.data instanceof ArrayBuffer ? f.data : new Uint8Array(f.data).buffer;
  return new Response(data, { headers: { 'content-type': f.mime, 'cache-control': 'private, max-age=300',
    'content-disposition': `${f.mime === 'application/pdf' ? 'inline' : 'inline'}; filename="${f.name.replace(/[^\w.\- ]+/g, '_')}"`, 'x-content-type-options': 'nosniff' } });
}

// The centre chosen in the request form: active and taking clients
export async function centreForRequest(env, id){
  if (!/^ct-[a-f0-9]{10}$/.test(String(id || ''))) return null;
  return env.DB.prepare("SELECT id, name FROM centres WHERE id = ? AND status = 'active' AND available = 1").bind(id).first();
}

async function signedIn(request, env){
  const t = cookieOf(request); if (!t) throw new HttpError(401, 'not_signed_in');
  const s = await env.DB.prepare('SELECT centre_id, expires_at FROM centre_sessions WHERE token_hash = ?').bind(await sha256(t)).first();
  if (!s || s.expires_at < now()) throw new HttpError(401, 'not_signed_in');
  const c = await env.DB.prepare('SELECT * FROM centres WHERE id = ?').bind(s.centre_id).first();
  if (!c || c.status !== 'active') throw new HttpError(403, 'not_active');
  return c;
}

// Requests of a centre: what the centre needs to write the attestation (company name, form, manager), nothing more
async function centreRequests(env, centreId){
  const { results } = await env.DB.prepare(`SELECT d.*, json_extract(r.data, '$.noms') AS noms, json_extract(r.data, '$.forme') AS forme,
      json_extract(r.data, '$.gerant.name') AS gerant, json_extract(r.data, '$.archived') AS archived
    FROM domi d JOIN requests r ON r.ref = d.ref WHERE d.centre_id = ? ORDER BY d.created_at DESC`).bind(centreId).all();
  return results.filter(x => !x.archived).map(x => ({ ref: x.ref, company: parseList(x.noms)[0] || '', forme: x.forme || '', gerant: x.gerant || '',
    months: x.months, status: x.status, attFile: x.att_file || null, paidAt: x.paid_at || null, createdAt: x.created_at, updatedAt: x.updated_at }));
}

export async function centresPublic(request, env, path){
  try {
    if (request.method !== 'GET') throw new HttpError(405, 'method');
    if (path === '') {
      const { results } = await env.DB.prepare("SELECT * FROM centres WHERE status = 'active' AND available = 1 ORDER BY city, name").all();
      return json({ centres: results.map(c => ({ id: c.id, name: c.name, city: c.city, district: c.district, address: c.address, services: parseList(c.services),
        photo: c.photo ? '/api/centres/photo/' + c.photo : null })) });
    }
    const m = path.match(/^photo\/(fl-[a-f0-9]{16})$/);
    if (m) return await fileResponse(env, m[1], " AND kind = 'photo'");
    throw new HttpError(404, 'not_found');
  } catch (e) { return fail(e); }
}

export async function centreApi(request, env, path){
  try {
    const method = request.method;
    if (!(method === 'GET' && path.startsWith('files/'))) sameOrigin(request);

    if (method === 'POST' && path === 'signup') {
      const ik = 'c' + await ipKey(request);
      if (await tooMany(env, ik, 5, 60)) throw new HttpError(429, 'too_many');
      const b = await readJson(request, 6.5e6);
      if (b.website) return json({ ok: true });                                   // robot (hidden field filled)
      const email = str(b.email, 160).toLowerCase(), name = str(b.name, 80);
      if (!name || !EMAIL.test(email) || str(b.phone, 40).replace(/\D/g, '').length < 9 || !str(b.city, 60) || !str(b.address, 200)) throw new HttpError(400, 'missing_fields');
      if (!b.cgu) throw new HttpError(400, 'cgu');
      checkPasswordRules(b.password);
      if (await env.DB.prepare('SELECT 1 FROM centres WHERE email = ?').bind(email).first()) throw new HttpError(409, 'email_exists');
      const photos = (Array.isArray(b.photos) ? b.photos : []).slice(0, 1).map(f => decodeFile(f, ['image/jpeg', 'image/png', 'image/webp']));
      const docs = (Array.isArray(b.docs) ? b.docs : []).slice(0, 3).map(f => decodeFile(f));
      const h = await hashPassword(b.password), id = 'ct-' + randomHex(5);
      const files = [...photos.map(f => insertFile(env, id, 'photo', null, f)), ...docs.map(f => insertFile(env, id, 'doc', null, f))];
      await env.DB.batch([
        env.DB.prepare('INSERT INTO centres (id, email, name, company, contact, phone, city, district, address, services, rate12, rate24, rc, ice, status, available, photo, pass_hash, pass_salt, must_change, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 0, ?)')
          .bind(id, email, name, str(b.company, 80), str(b.contact, 80), str(b.phone, 40), str(b.city, 60), str(b.district, 60), str(b.address, 200),
            JSON.stringify(services(b.services)), rate(b.rate12), rate(b.rate24), str(b.rc, 40), str(b.ice, 40), 'pending', photos.length ? files[0][0] : null, h.hash, h.salt, now()),
        ...files.map(x => x[1])
      ]);
      await addFail(env, ik);                                                      // counts sign-ups per connection
      return json({ ok: true });
    }

    if (method === 'POST' && path === 'login') {
      const b = await readJson(request, 4e3);
      const email = str(b.email, 160).toLowerCase(), ek = 'ce:' + email, ik = await ipKey(request);
      if ((await tooMany(env, ek, 8, 15)) || (await tooMany(env, ik, 30, 15))) throw new HttpError(429, 'too_many_attempts');
      const c = await env.DB.prepare('SELECT * FROM centres WHERE email = ?').bind(email).first();
      const ok = c && c.pass_hash && same((await hashPassword(String(b.password || ''), c.pass_salt)).hash, c.pass_hash);
      if (!ok) { if (!c) await hashPassword(String(b.password || '')); await addFail(env, ek, ik); throw new HttpError(401, 'bad_credentials'); }
      if (c.status !== 'active') throw new HttpError(403, c.status);              // 'pending', 'refused' or 'suspended'
      const token = randomHex(32);
      await env.DB.batch([
        env.DB.prepare('INSERT INTO centre_sessions (token_hash, centre_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(await sha256(token), c.id, now(), new Date(Date.now() + DAYS * 86400e3).toISOString()),
        env.DB.prepare('DELETE FROM centre_sessions WHERE expires_at < ?').bind(now()),
        env.DB.prepare('DELETE FROM login_fails WHERE k = ?').bind(ek)
      ]);
      const res = json({ ok: true, mustChange: !!c.must_change });
      res.headers.append('set-cookie', setCookie(request, token, DAYS * 86400));
      return res;
    }

    if (method === 'POST' && path === 'logout') {
      const t = cookieOf(request);
      if (t) await env.DB.prepare('DELETE FROM centre_sessions WHERE token_hash = ?').bind(await sha256(t)).run();
      const res = json({ ok: true }); res.headers.append('set-cookie', setCookie(request, '', 0)); return res;
    }

    const c = await signedIn(request, env);

    if (method === 'GET' && path === 'me') {
      const { results: files } = await env.DB.prepare('SELECT id, kind, ref, name, mime, size, created_at FROM centre_files WHERE centre_id = ? ORDER BY created_at DESC').bind(c.id).all();
      return json({ me: { ...pubCentre(c), mustChange: !!c.must_change }, requests: await centreRequests(env, c.id), files: files.map(fileMeta) });
    }
    if (method === 'PUT' && path === 'me') {
      const b = await readJson(request, 4e3);
      await env.DB.prepare('UPDATE centres SET phone = ?, services = ?, available = ? WHERE id = ?')
        .bind(str(b.phone, 40) || c.phone, JSON.stringify(b.services ? services(b.services) : parseList(c.services)), b.available === false ? 0 : 1, c.id).run();
      return json({ ok: true });
    }
    if (method === 'POST' && path === 'password') {
      const b = await readJson(request, 4e3);
      if (!same((await hashPassword(String(b.current || ''), c.pass_salt)).hash, c.pass_hash)) throw new HttpError(401, 'bad_current_password');
      checkPasswordRules(b.password);
      const h = await hashPassword(b.password), keep = await sha256(cookieOf(request) || '');
      await env.DB.batch([
        env.DB.prepare('UPDATE centres SET pass_hash = ?, pass_salt = ?, must_change = 0 WHERE id = ?').bind(h.hash, h.salt, c.id),
        env.DB.prepare('DELETE FROM centre_sessions WHERE centre_id = ? AND token_hash != ?').bind(c.id, keep)
      ]);
      return json({ ok: true });
    }
    const r = path.match(/^requests\/(CE-\d{6})(\/attestation)?$/);
    if (r) {
      const d = await env.DB.prepare('SELECT * FROM domi WHERE ref = ? AND centre_id = ?').bind(r[1], c.id).first();
      if (!d) throw new HttpError(404, 'not_found');
      if (method === 'PUT' && !r[2]) {
        const b = await readJson(request, 2e3);
        if (d.status !== 'new' && !(b.action === 'refuse' && d.status === 'accepted')) throw new HttpError(409, 'already_answered');
        const status = b.action === 'accept' ? 'accepted' : b.action === 'refuse' ? 'refused' : null;
        if (!status) throw new HttpError(400, 'bad_action');
        await env.DB.prepare('UPDATE domi SET status = ?, updated_at = ? WHERE ref = ?').bind(status, now(), d.ref).run();
        return json({ ok: true, status });
      }
      if (method === 'POST' && r[2]) {
        if (!['accepted', 'done'].includes(d.status)) throw new HttpError(409, 'not_accepted');
        const f = decodeFile((await readJson(request, 1.7e6)), ['application/pdf', 'image/jpeg', 'image/png']);
        const [id, st] = insertFile(env, c.id, 'attest', d.ref, f);
        await env.DB.batch([st, env.DB.prepare("UPDATE domi SET status = 'done', att_file = ?, updated_at = ? WHERE ref = ?").bind(id, now(), d.ref)]);
        return json({ ok: true, file: id });
      }
    }
    const f = path.match(/^files\/(fl-[a-f0-9]{16})$/);
    if (f && method === 'GET') return await fileResponse(env, f[1], ' AND centre_id = ?', c.id);
    throw new HttpError(404, 'not_found');
  } catch (e) { return fail(e); }
}

// ---------- Team side (admin only for the centres; every team member for the domiciliation of a file) ----------
//   GET  centres                    every centre with its files (no data) and its contracts
//   POST centres                    add a centre directly (active, temporary password)
//   PUT  centres/:id                { status, resetPassword, available, fields… }
//   GET  domi                       domiciliation of every request (merged into the files by the team space)
//   PUT  domi/:ref                  { centre } assign / change the centre (back to « new ») · { paid: true|false }
//   GET  centre-files/:id           any centre file (attestation, document, photo)
export async function adminCentres(request, env, path, me, tempPassword){
  const method = request.method;
  if (method === 'GET' && path === 'domi') {
    const { results } = await env.DB.prepare('SELECT d.*, c.name AS centre_name, c.phone AS centre_phone, c.address AS centre_address, c.district AS centre_district, c.city AS centre_city, c.rate12, c.rate24 FROM domi d LEFT JOIN centres c ON c.id = d.centre_id').all();
    return json({ domi: results.map(d => ({ ref: d.ref, centre: d.centre_id, centreName: d.centre_name || '', centrePhone: d.centre_phone || '', centreAddress: [d.centre_address, d.centre_district, d.centre_city].filter(Boolean).join(', '), centreCity: d.centre_city || '', months: d.months,
      status: d.status, attFile: d.att_file || null, paidAt: d.paid_at || null, rate: d.months === 12 ? d.rate12 || 0 : d.rate24 || 0, updatedAt: d.updated_at })),
      centres: (await env.DB.prepare("SELECT id, name, city, district FROM centres WHERE status = 'active' ORDER BY city, name").all()).results });
  }
  const dm = path.match(/^domi\/(CE-\d{6})$/);
  if (dm && method === 'PUT') {
    const b = await readJson(request, 2e3);
    const req = await env.DB.prepare('SELECT data FROM requests WHERE ref = ?').bind(dm[1]).first();
    if (!req) throw new HttpError(404, 'not_found');
    const cur = await env.DB.prepare('SELECT * FROM domi WHERE ref = ?').bind(dm[1]).first();
    if (b.paid != null) {
      if (me.role !== 'admin') throw new HttpError(403, 'admin_only');
      if (!cur) throw new HttpError(404, 'not_found');
      await env.DB.prepare('UPDATE domi SET paid_at = ?, updated_at = ? WHERE ref = ?').bind(b.paid ? now() : null, now(), cur.ref).run();
      return json({ ok: true });
    }
    if (b.centre === null) { await env.DB.prepare('DELETE FROM domi WHERE ref = ?').bind(dm[1]).run(); return json({ ok: true }); }
    const c = await env.DB.prepare("SELECT id FROM centres WHERE id = ? AND status = 'active'").bind(str(b.centre, 20)).first();
    if (!c) throw new HttpError(400, 'bad_centre');
    const months = monthsOf(JSON.parse(req.data).plan);
    await env.DB.prepare(`INSERT INTO domi (ref, centre_id, months, status, att_file, created_at, updated_at, paid_at) VALUES (?, ?, ?, 'new', NULL, ?, ?, NULL)
      ON CONFLICT(ref) DO UPDATE SET centre_id = excluded.centre_id, months = excluded.months, status = 'new', att_file = NULL, updated_at = excluded.updated_at, paid_at = NULL`)
      .bind(dm[1], c.id, months, now(), now()).run();
    return json({ ok: true });
  }
  const fm = path.match(/^centre-files\/(fl-[a-f0-9]{16})$/);
  if (fm && method === 'GET') return await fileResponse(env, fm[1]);

  if (me.role !== 'admin') throw new HttpError(403, 'admin_only');
  if (method === 'GET' && path === 'centres') {
    const { results } = await env.DB.prepare('SELECT * FROM centres ORDER BY created_at DESC').all();
    const { results: files } = await env.DB.prepare("SELECT id, centre_id, kind, ref, name, mime, size, created_at FROM centre_files WHERE kind != 'attest' ORDER BY created_at").all();
    const { results: domi } = await env.DB.prepare(`SELECT d.*, json_extract(r.data, '$.noms') AS noms FROM domi d JOIN requests r ON r.ref = d.ref ORDER BY d.created_at DESC`).all();
    return json({ centres: results.map(c => ({ ...pubCentre(c),
      files: files.filter(f => f.centre_id === c.id).map(fileMeta),
      contracts: domi.filter(d => d.centre_id === c.id).map(d => ({ ref: d.ref, company: parseList(d.noms)[0] || '', months: d.months, status: d.status,
        attFile: d.att_file || null, paidAt: d.paid_at || null, rate: d.months === 12 ? c.rate12 || 0 : c.rate24 || 0, createdAt: d.created_at })) })) });
  }
  if (method === 'POST' && path === 'centres') {
    const b = await readJson(request, 6e3);
    const email = str(b.email, 160).toLowerCase(), name = str(b.name, 80);
    if (!name || !EMAIL.test(email)) throw new HttpError(400, 'missing_fields');
    if (await env.DB.prepare('SELECT 1 FROM centres WHERE email = ?').bind(email).first()) throw new HttpError(409, 'email_exists');
    const pw = tempPassword(), h = await hashPassword(pw), id = 'ct-' + randomHex(5);
    await env.DB.prepare('INSERT INTO centres (id, email, name, company, contact, phone, city, district, address, services, rate12, rate24, rc, ice, status, available, photo, pass_hash, pass_salt, must_change, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL, ?, ?, 1, ?)')
      .bind(id, email, name, '', '', str(b.phone, 40), str(b.city, 60), '', '', '[]', 0, 0, '', '', 'active', h.hash, h.salt, now()).run();
    return json({ ok: true, id, tempPassword: pw });
  }
  const m = path.match(/^centres\/(ct-[a-f0-9]{10})$/);
  if (m && method === 'PUT') {
    const b = await readJson(request, 6e3), c = await env.DB.prepare('SELECT * FROM centres WHERE id = ?').bind(m[1]).first();
    if (!c) throw new HttpError(404, 'not_found');
    const status = ['pending', 'active', 'refused', 'suspended'].includes(b.status) ? b.status : c.status;
    const v = (k, max) => b[k] != null ? str(b[k], max) : c[k];
    const st = [env.DB.prepare('UPDATE centres SET status = ?, name = ?, company = ?, contact = ?, phone = ?, city = ?, district = ?, address = ?, rc = ?, ice = ?, services = ?, rate12 = ?, rate24 = ?, available = ? WHERE id = ?')
      .bind(status, v('name', 80) || c.name, v('company', 80), v('contact', 80), v('phone', 40), v('city', 60), v('district', 60), v('address', 200), v('rc', 40), v('ice', 40),
        b.services ? JSON.stringify(services(b.services)) : c.services, b.rate12 != null ? rate(b.rate12) : c.rate12, b.rate24 != null ? rate(b.rate24) : c.rate24,
        b.available === false ? 0 : b.available === true ? 1 : c.available, c.id)];
    let pw = null;
    if (b.resetPassword) { pw = tempPassword(); const h = await hashPassword(pw); st.push(env.DB.prepare('UPDATE centres SET pass_hash = ?, pass_salt = ?, must_change = 1 WHERE id = ?').bind(h.hash, h.salt, c.id)); }
    if (status !== 'active' || b.resetPassword) st.push(env.DB.prepare('DELETE FROM centre_sessions WHERE centre_id = ?').bind(c.id));
    await env.DB.batch(st);
    return json({ ok: true, tempPassword: pw });
  }
  throw new HttpError(404, 'not_found');
}
