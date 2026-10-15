// Pages wrapper (kept for a Pages deployment): the real code is in server/affiliate.js
import { promoApi } from '../../server/affiliate.js';
export const onRequestGet = ({ request, env }) => promoApi(request, env);
