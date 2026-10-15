// Pages wrapper (kept for a Pages deployment): the real code is in server/track.js
import { track } from '../../server/track.js';
export const onRequestPost = ({ request, env }) => track(request, env);
