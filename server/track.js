// POST /api/track : the client tracking page (suivi.html) asks for the state of one file.
// Public route: the reference alone opens the file (owner's choice, Oct 2026). Rate limiting below keeps guessing slow.
// Only what the client needs is returned (progress, payments, the vault files the team shared, as 2-hour signed links), never the notes.
// Wrong guesses are counted per IP (table login_fails, key 't:<ip hash>') so references can't be tried one by one.
import { json, now, readJson, fail, HttpError } from './http.js';
import { sameOrigin } from './auth.js';
import { ipHash } from './requests.js';
import { stepOf } from './workflow.js';
import { clientDocs } from './vault.js';

const MAX_FAILS = 10;                       // per IP, per 15 minutes
const firstName = s => String(s || '').trim().split(/\s+/)[0] || '';

export async function track(request, env){
  try {
    sameOrigin(request);
    const b = await readJson(request, 2e3);
    const ref = String(b.ref || '').trim().toUpperCase();
    if (!/^CE-\d{6}$/.test(ref)) throw new HttpError(400, 'bad_input');

    const ik = 't:' + await ipHash(request), since = new Date(Date.now() - 15 * 60e3).toISOString();
    const fails = await env.DB.prepare('SELECT COUNT(*) AS n FROM login_fails WHERE k = ? AND at > ?').bind(ik, since).first('n');
    if (fails >= MAX_FAILS) throw new HttpError(429, 'too_many');

    const row = await env.DB.prepare('SELECT data FROM requests WHERE ref = ?').bind(ref).first();
    const r = row ? JSON.parse(row.data) : null;
    if (!r || r.kind === 'rappel') {
      await env.DB.prepare('INSERT INTO login_fails (k, at) VALUES (?, ?)').bind(ik, now()).run();
      throw new HttpError(404, 'not_found');
    }

    let juriste = null;
    if (r.juriste) { const t = await env.DB.prepare('SELECT name FROM team WHERE id = ?').bind(r.juriste).first(); if (t) juriste = firstName(t.name); }

    return json({
      ref, societe: r.cn?.nom || (r.noms || [])[0] || '', forme: r.forme, plan: r.plan, createdAt: r.createdAt,
      step: stepOf(r), archived: !!r.archived, reject: !!r.reject, juriste,
      total: r.total ?? null, payAmount: r.payAmount, paid: r.paid || {}, remise: r.remise || 0,
      docs: await clientDocs(env, ref).catch(() => [])
    });
  } catch (e) { return fail(e); }
}
