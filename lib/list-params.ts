export type ListParams = Record<string, string | string[] | undefined>;
export function param(params: ListParams, key: string, max = 100) {
  const value = params[key];
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
export function pageNumber(params: ListParams) {
  const page = Number(param(params, "page"));
  return Number.isInteger(page) && page > 0 ? Math.min(page, 100000) : 1;
}
export function listUrl(
  path: string,
  params: ListParams,
  changes: Record<string, string>,
) {
  const query = new URLSearchParams();
  for (const key of Object.keys(params)) {
    const value = param(params, key, 1000);
    if (value) query.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value) query.set(key, value);
    else query.delete(key);
  }
  return `${path}?${query}`;
}
