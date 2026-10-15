// Pages Functions entry (if the site is hosted as a Pages project); the logic lives in server/requests.js
import { postRequest } from '../../server/requests.js';
export const onRequestPost = ({ request, env, waitUntil }) => postRequest(request, env, { waitUntil });
