// POST /api/track : the client tracking page (suivi.html) asks for the state of one file.
// Public route: the client proves it is their file with the reference AND the phone number given in the request.
// Only what the client needs is returned (progress, payments, referrals), never the notes or the documents.
// Wrong guesses are counted per IP (table login_fails, key 't:<ip hash>') so references can't be tried one by one.
import { json, now, readJson, fail, HttpError } from './http.js';
import { sameOrigin } from './auth.js';
import { ipHash } from './requests.js';

const MAX_FAILS = 10;                       // per IP, per 15 minutes
const digits = s => String(s || '').replace(/\D/g, '');
const samePhone = (a, b) => { const x = digits(a).slice(-9), y = digits(b).slice(-9); return x.length === 9 && x === y; };
const firstName = s => String(s || '').trim().split(/\s+/)[0] || '';
const initial = s => { const f = firstName(s); return f ? f[0].toUpperCase() + f.slice(1).toLowerCase().slice(0, 1) + '.' : '—'; };

export async function track(request, env){
  try {
    sameOrigin(request);
    const b = await readJson(request, 2e3);
    const ref = String(b.ref || '').trim().toUpperCase(), tel = String(b.tel || '');
    if (!/^CE-\d{6}$/.test(ref) || digits(tel).length < 9) throw new HttpError(400, 'bad_input');

    const ik = 't:' + await ipHash(request), since = new Date(Date.now() - 15 * 60e3).toISOString();
    const fails = await env.DB.prepare('SELECT COUNT(*) AS n FROM login_fails WHERE k = ? AND at > ?').bind(ik, since).first('n');
    if (fails >= MAX_FAILS) throw new HttpError(429, 'too_many');

    const row = await env.DB.prepare('SELECT data FROM requests WHERE ref = ?').bind(ref).first();
    const r = row ? JSON.parse(row.data) : null;
    if (!r || r.kind === 'rappel' || !samePhone(r.client?.tel, tel)) {
      await env.DB.prepare('INSERT INTO login_fails (k, at) VALUES (?, ?)').bind(ik, now()).run();
      throw new HttpError(404, 'not_found');                       // same answer for "no such file" and "wrong phone"
    }

    let juriste = null;
    if (r.juriste) { const t = await env.DB.prepare('SELECT name FROM team WHERE id = ?').bind(r.juriste).first(); if (t) juriste = firstName(t.name); }

    // People this client referred: files whose referral code is this reference
    const { results } = await env.DB.prepare("SELECT data FROM requests WHERE json_extract(data, '$.parrain') = ? AND ref != ?").bind(ref, ref).all();
    const filleuls = results.map(x => JSON.parse(x.data)).filter(f => !f.archived && f.kind !== 'rappel')
      .map(f => ({ nom: initial(f.client?.nom), at: f.createdAt, created: f.step >= 10, rewardPaid: !!f.parrainPaid }));

    return json({
      ref, societe: (r.noms || [])[0] || '', forme: r.forme, plan: r.plan, createdAt: r.createdAt,
      step: r.step || 0, archived: !!r.archived, reject: !!r.reject, juriste,
      total: r.total ?? null, payAmount: r.payAmount, paid: r.paid || {}, parrain: r.parrain || null,
      filleuls
    });
  } catch (e) { return fail(e); }
}
