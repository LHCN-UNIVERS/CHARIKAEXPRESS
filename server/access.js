// Cloudflare Access: every request to /api/admin/* must carry a valid Access token (JWT signed by Cloudflare).
// We check the signature, the audience and the expiry, then return the person's e-mail.
import { HttpError } from './http.js';

let certs = null, certsAt = 0;
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));
const parse = s => JSON.parse(new TextDecoder().decode(b64u(s)));

async function keys(team){
  if (!certs || Date.now() - certsAt > 3600e3) {
    const r = await fetch(`https://${team}/cdn-cgi/access/certs`);
    if (!r.ok) throw new HttpError(503, 'access_certs');
    certs = (await r.json()).keys; certsAt = Date.now();
  }
  return certs;
}

export async function accessEmail(request, env){
  // Local testing only (wrangler pages dev on localhost): DEV_ACCESS_EMAIL stands in for the Access login.
  const host = new URL(request.url).hostname;
  if (env.DEV_ACCESS_EMAIL && (host === 'localhost' || host === '127.0.0.1')) return String(env.DEV_ACCESS_EMAIL).toLowerCase();
  const team = (env.ACCESS_TEAM_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, ''), aud = env.ACCESS_AUD;
  if (!team || !aud) throw new HttpError(503, 'access_not_configured');   // fail closed
  const cookie = (request.headers.get('cookie') || '').match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
  const token = request.headers.get('cf-access-jwt-assertion') || (cookie && cookie[1]);
  if (!token) throw new HttpError(401, 'not_signed_in');
  const [h, p, sig] = token.split('.');
  if (!h || !p || !sig) throw new HttpError(401, 'bad_token');
  const head = parse(h), body = parse(p);
  const jwk = (await keys(team)).find(k => k.kid === head.kid);
  if (!jwk || head.alg !== 'RS256') throw new HttpError(401, 'bad_token');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(sig), new TextEncoder().encode(`${h}.${p}`));
  const auds = Array.isArray(body.aud) ? body.aud : [body.aud];
  if (!ok || !auds.includes(aud) || body.iss !== `https://${team}` || !body.exp || body.exp * 1000 < Date.now() || !body.email) throw new HttpError(401, 'bad_token');
  return String(body.email).toLowerCase();
}
