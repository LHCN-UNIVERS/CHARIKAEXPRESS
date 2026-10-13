// Cloudflare Worker entry: the API routes run here, everything else is the static site (dist/, see build.sh).
import { postRequest } from './requests.js';
import { adminApi } from './admin.js';
import { json } from './http.js';

export default {
  async fetch(request, env){
    const { pathname } = new URL(request.url);
    if (pathname === '/api/requests') return request.method === 'POST' ? postRequest(request, env) : json({ error: 'method' }, 405);
    if (pathname.startsWith('/api/admin/')) return adminApi(request, env, pathname.slice('/api/admin/'.length));
    if (pathname.startsWith('/api/')) return json({ error: 'not_found' }, 404);
    return env.ASSETS.fetch(request);
  }
};
