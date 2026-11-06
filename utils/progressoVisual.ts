export function completedProgress(completed: number, total: number) {
  const max = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const count = Number.isFinite(completed)
    ? Math.min(max, Math.max(0, Math.floor(completed)))
    : 0;
  return {
    completed: count,
    total: max,
    percent: max ? (count / max) * 100 : 0,
  };
}
