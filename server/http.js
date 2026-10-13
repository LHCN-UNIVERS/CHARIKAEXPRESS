// Small helpers shared by the API routes
export const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
export const now = () => new Date().toISOString();

export async function readJson(request, max){
  const text = await request.text();
  if (text.length > max) throw new HttpError(413, 'too_large');
  try { return JSON.parse(text); } catch (e) { throw new HttpError(400, 'bad_json'); }
}
export class HttpError extends Error { constructor(status, code){ super(code); this.status = status; this.code = code; } }
export const fail = e => e instanceof HttpError ? json({ error: e.code }, e.status) : (console.error(e), json({ error: 'server' }, 500));
