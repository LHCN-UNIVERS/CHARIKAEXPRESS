// Pages wrapper (kept for a Pages deployment): the real code is in server/affiliate.js
import { affApi } from '../../../server/affiliate.js';
export const onRequest = ({ request, env, params }) => affApi(request, env, (params.path || []).join('/'));
