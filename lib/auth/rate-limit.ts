import "server-only";

const failures = new Map<string, { count: number; expires: number }>();
const windowMs = 10 * 60 * 1000;

// Local, single-process protection. A distributed deployment needs a shared store.
export function canAttemptLogin(key: string) {
  const entry = failures.get(key);
  if (entry && entry.expires <= Date.now()) {
    failures.delete(key);
    return true;
  }
  return !entry || entry.count < 5;
}
export function recordLoginFailure(key: string) {
  if (failures.size >= 1000 && !failures.has(key))
    failures.delete(failures.keys().next().value!);
  const current = failures.get(key);
  failures.set(
    key,
    current && current.expires > Date.now()
      ? { ...current, count: current.count + 1 }
      : { count: 1, expires: Date.now() + windowMs },
  );
}
export function clearLoginFailures(key: string) {
  failures.delete(key);
}
