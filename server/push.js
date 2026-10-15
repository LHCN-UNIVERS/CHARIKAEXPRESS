// Web Push for the team space: a phone (iPhone: added to the home screen) subscribes, and every new request
// sends it a notification, even when the phone is locked.
// - The VAPID key pair (identifies our server to Apple/Google push services) is created on first use and kept in D1.
// - Pushes carry no data (no encryption needed); the service worker (sw.js) then asks /api/admin/push-latest
//   what arrived and shows it. Dead subscriptions (404/410) are removed.
import { json, now } from './http.js';

const SUBJECT = 'mailto:charikaexpress@gmail.com';
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uStr = s => b64u(new TextEncoder().encode(s));

async function keys(env){
  let k = await env.DB.prepare('SELECT pub, priv FROM push_keys WHERE id = 1').first();
  if (k) return k;
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const pub = b64u(await crypto.subtle.exportKey('raw', pair.publicKey));
  const priv = JSON.stringify(await crypto.subtle.exportKey('jwk', pair.privateKey));
  await env.DB.prepare('INSERT OR IGNORE INTO push_keys (id, pub, priv) VALUES (1, ?, ?)').bind(pub, priv).run();
  return env.DB.prepare('SELECT pub, priv FROM push_keys WHERE id = 1').first();       // whoever won the race
}
export const publicKey = async env => (await keys(env)).pub;

async function vapidHeader(env, endpoint){
  const k = await keys(env);
  const key = await crypto.subtle.importKey('jwk', JSON.parse(k.priv), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const unsigned = b64uStr(JSON.stringify({ typ: 'JWT', alg: 'ES256' })) + '.' +
    b64uStr(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: SUBJECT }));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned));
  return `vapid t=${unsigned}.${b64u(sig)}, k=${k.pub}`;
}

async function sendOne(env, endpoint){
  const res = await fetch(endpoint, { method: 'POST', headers: { TTL: '86400', Urgency: 'high', Authorization: await vapidHeader(env, endpoint), 'Content-Length': '0' } });
  if (res.status === 404 || res.status === 410) await env.DB.prepare('DELETE FROM push_subs WHERE endpoint = ?').bind(endpoint).run();
  return res.status;
}

// Every active team member's phones (or only one person's, for the test button)
export async function notifyTeam(env, email = null){
  const q = email
    ? env.DB.prepare('SELECT endpoint FROM push_subs WHERE email = ?').bind(email)
    : env.DB.prepare('SELECT s.endpoint FROM push_subs s JOIN team t ON t.email = s.email WHERE t.active = 1');
  const { results } = await q.all();
  const out = await Promise.allSettled(results.map(r => sendOne(env, r.endpoint)));
  return out.map(o => o.status === 'fulfilled' ? o.value : 'error');
}

// Team API routes (called from server/admin.js for a signed-in member)
export async function pushApi(request, env, path, me, readJson){
  if (path === 'push-key' && request.method === 'GET') return json({ key: await publicKey(env) });
  if (path === 'push-subscribe' && request.method === 'POST') {
    const b = await readJson(request, 4e3), ep = String(b.endpoint || '');
    if (!/^https:\/\/[^\s]{10,900}$/.test(ep)) return json({ error: 'bad_endpoint' }, 400);
    await env.DB.prepare('INSERT INTO push_subs (endpoint, email, created_at) VALUES (?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET email = excluded.email').bind(ep, me.email, now()).run();
    return json({ ok: true });
  }
  if (path === 'push-unsubscribe' && request.method === 'POST') {
    const b = await readJson(request, 4e3);
    await env.DB.prepare('DELETE FROM push_subs WHERE endpoint = ? AND email = ?').bind(String(b.endpoint || ''), me.email).run();
    return json({ ok: true });
  }
  if (path === 'push-test' && request.method === 'POST') {
    const sent = await notifyTeam(env, me.email);
    return json({ ok: true, sent: sent.length, results: sent });
  }
  if (path === 'push-latest' && request.method === 'GET') {
    const since = new Date(Date.now() - 15 * 60e3).toISOString();
    const row = await env.DB.prepare('SELECT data FROM requests WHERE created_at > ? ORDER BY created_at DESC LIMIT 1').bind(since).first();
    if (!row) return json({ title: 'Charika Express', body: 'Test de notification : tout fonctionne ✓', url: '/admin.html' });
    const r = JSON.parse(row.data), F = { sarlau: 'SARL AU', sarl: 'SARL', sas: 'SAS', ae: 'Auto-entrepreneur', sa: 'SA' };
    const who = (r.noms || [])[0] || r.client?.nom || '';
    return json({
      title: (r.kind === 'rappel' ? 'Demande de rappel · ' : 'Nouvelle demande · ') + r.ref,
      body: [who, r.kind === 'rappel' ? r.client?.tel : F[r.forme], r.plan && r.kind !== 'rappel' ? 'Pack ' + r.plan[0].toUpperCase() + r.plan.slice(1) : ''].filter(Boolean).join(' · '),
      url: '/admin.html#' + r.ref
    });
  }
  return null;
}
