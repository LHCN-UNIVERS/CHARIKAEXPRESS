// Pages wrapper (kept for a Pages deployment): the real code is in server/centres.js
import { centresPublic } from '../../../server/centres.js';
export const onRequest = ({ request, env, params }) => centresPublic(request, env, (params.path || []).join('/'));
