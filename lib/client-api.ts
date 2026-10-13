export async function postJson<T = { id: string }>(
  url: string,
  data: unknown,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Couldn’t save. Please try again.");
  return result as T;
}
