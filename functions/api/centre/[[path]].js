// Pages wrapper (kept for a Pages deployment): the real code is in server/centres.js
import { centreApi } from '../../../server/centres.js';
export const onRequest = ({ request, env, params }) => centreApi(request, env, (params.path || []).join('/'));
