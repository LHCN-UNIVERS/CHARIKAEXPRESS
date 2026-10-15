// POST /api/requests : the request form (demande.html) sends a new client request here.
// Public route: only whitelisted fields are kept, sizes are capped, and one sender can't flood the list.
import { json, now, readJson, fail, HttpError } from './http.js';
import { promoInfo } from './affiliate.js';
import { notifyTeam } from './push.js';
import { centreForRequest, monthsOf } from './centres.js';

const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const num = v => (v === null || v === '' || v === undefined || isNaN(+v)) ? null : +v;
const pick = (v, list, d) => list.includes(v) ? v : d;

function clean(b){
  const partners = (Array.isArray(b.partners) ? b.partners : []).slice(0, 20).map(p => ({ name: str(p?.name), cin: str(p?.cin, 30), pct: num(p?.pct) ?? 0 }));
  return {
    kind: pick(b.kind, ['demande', 'rappel'], 'demande'), service: str(b.service, 80),   // 'rappel' = call-back form of the homepage
    lang: pick(b.lang, ['fr', 'en'], 'fr'),
    forme: pick(b.forme, ['sarlau', 'sarl', 'sas', 'ae', 'sa'], 'sarl'),
    plan: pick(b.plan, ['essentiel', 'pro', 'premium', 'ae'], 'essentiel'),
    options: (Array.isArray(b.options) ? b.options : []).filter(o => ['o_prio', 'o_logo', 'o_pacte'].includes(o)),
    total: num(b.total), payMethod: pick(b.payMethod, ['virement', 'cashplus'], 'virement'), payAmount: pick(b.payAmount, ['avance', 'full'], 'avance'),
    noms: (Array.isArray(b.noms) ? b.noms : []).slice(0, 3).map(n => str(n, 120)).filter(Boolean),
    activite: str(b.activite, 500), ville: str(b.ville, 80), capital: num(b.capital) ?? 0, siege: pick(b.siege, ['dom', 'local'], 'dom'),
    partners, gerant: { name: str(b.gerant?.name), cin: str(b.gerant?.cin, 30) },
    client: { nom: str(b.client?.nom, 120), tel: str(b.client?.tel, 40), email: str(b.client?.email, 160) },
    message: str(b.message, 2000), cgu: !!b.cgu, secs: num(b.secs)
  };
}

export async function ipHash(request){
  const ip = request.headers.get('cf-connecting-ip') || '';
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ce:' + ip));
  return [...new Uint8Array(d)].slice(0, 12).map(x => x.toString(16).padStart(2, '0')).join('');
}

export async function postRequest(request, env, ctx){
  try {
    const b = await readJson(request, 64e3);
    if (b.website) return json({ ok: true, ref: str(b.ref, 12) });          // robot (hidden field filled): pretend, keep nothing
    const r = clean(b);
    if (!r.client.nom || !r.client.tel) throw new HttpError(400, 'missing_contact');
    const ip = await ipHash(request), since = new Date(Date.now() - 10 * 60e3).toISOString();
    const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM requests WHERE ip_hash = ? AND created_at > ?').bind(ip, since).first('n');
    if (recent >= 5) throw new HttpError(429, 'too_many');
    // Keep the reference shown to the client when it is free; otherwise draw a new one
    let ref = /^CE-\d{6}$/.test(b.ref) ? b.ref : null;
    for (let i = 0; i < 8; i++) {
      if (ref && !(await env.DB.prepare('SELECT 1 FROM requests WHERE ref = ?').bind(ref).first())) break;
      ref = 'CE-' + String(100000 + Math.floor(Math.random() * 900000));
    }
    // Promo code of a partner: the file is credited to that partner; the discount was already taken off the total by the form
    const promo = b.promo ? await promoInfo(env, b.promo) : null;
    if (promo) Object.assign(r, { promo: promo.code, affiliate: promo.affiliate_id, remise: promo.discount });
    else if (b.promo) r.promoInvalid = str(b.promo, 20).toUpperCase();    // shown to the team: discount not to be granted
    // Domiciliation centre picked by the client (included in the pack): the centre sees the request in its space
    const centre = r.kind === 'demande' && r.siege === 'dom' && r.forme !== 'ae' ? await centreForRequest(env, b.centre) : null;
    if (centre) r.centre = { id: centre.id, name: centre.name };
    const at = now();
    const data = { ...r, ref, createdAt: at, updatedAt: at, step: 0, docs: {}, livrables: {}, checks: {}, paid: {}, reject: null,
      seen: false, juriste: null, notes: [{ t: 'sys', at, text: 'Demande reçue depuis le site.' }] };
    const st = [env.DB.prepare('INSERT INTO requests (ref, created_at, updated_at, ip_hash, data) VALUES (?, ?, ?, ?, ?)').bind(ref, at, at, ip, JSON.stringify(data))];
    if (centre) st.push(env.DB.prepare("INSERT INTO domi (ref, centre_id, months, status, att_file, created_at, updated_at, paid_at) VALUES (?, ?, ?, 'new', NULL, ?, ?, NULL)").bind(ref, centre.id, monthsOf(r.plan), at, at));
    await env.DB.batch(st);
    ctx?.waitUntil(notifyTeam(env).catch(e => console.error('push', e)));   // team phones: « Nouvelle demande »
    return json({ ok: true, ref });
  } catch (e) { return fail(e); }
}
