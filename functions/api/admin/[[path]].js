// Pages Functions entry (if the site is hosted as a Pages project); the logic lives in server/admin.js
import { adminApi } from '../../../server/admin.js';
export const onRequest = ({ request, env, params }) => adminApi(request, env, (params.path || []).join('/'));
