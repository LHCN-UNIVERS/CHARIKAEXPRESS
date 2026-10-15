// Cloudflare Worker entry: the API routes run here, everything else is the static site (dist/, see build.sh).
import { postRequest } from './requests.js';
import { adminApi } from './admin.js';
import { json, fail } from './http.js';
import { login, logout } from './auth.js';
import { track } from './track.js';
import { affApi, promoApi } from './affiliate.js';
import { centresPublic, centreApi } from './centres.js';

export default {
  async fetch(request, env, ctx){
    const { pathname } = new URL(request.url);
    if (pathname === '/api/requests') return request.method === 'POST' ? postRequest(request, env, ctx) : json({ error: 'method' }, 405);
    if (pathname === '/api/track') return request.method === 'POST' ? track(request, env) : json({ error: 'method' }, 405);
    if (pathname === '/api/promo') return request.method === 'GET' ? promoApi(request, env) : json({ error: 'method' }, 405);
    if (pathname.startsWith('/api/aff/')) return affApi(request, env, pathname.slice('/api/aff/'.length));
    if (pathname === '/api/centres' || pathname.startsWith('/api/centres/')) return centresPublic(request, env, pathname.slice('/api/centres'.length).replace(/^\//, ''));
    if (pathname.startsWith('/api/centre/')) return centreApi(request, env, pathname.slice('/api/centre/'.length));
    if (pathname === '/api/auth/login' && request.method === 'POST') return login(request, env).catch(fail);
    if (pathname === '/api/auth/logout' && request.method === 'POST') return logout(request, env).catch(fail);
    if (pathname.startsWith('/api/admin/')) return adminApi(request, env, pathname.slice('/api/admin/'.length));
    if (pathname.startsWith('/api/')) return json({ error: 'not_found' }, 404);
    return env.ASSETS.fetch(request);
  }
};
