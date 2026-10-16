// The creation workflow has 9 steps (admin.html WORKFLOW); a file is delivered at step DONE.
// Files made with the former 10-step workflow carry no `wf` field: stepOf() maps their step to the 9-step one,
// the same way admin.html migrate() does (the team space saves the mapped step on the next change).
export const DONE = 9;
const OLD_STEP = [0, 1, 2, 3, 4, 5, 5, 6, 6, 7, 9];   // index: former step (10 = delivered)

export function stepOf(r){
  if (r.wf === 2) return r.step || 0;
  const old = Math.min(r.step || 0, 10), paid = r.paid || {};
  return old === 9 && (paid.full || paid.final) ? 8 : OLD_STEP[old];
}
