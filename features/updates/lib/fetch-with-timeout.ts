export async function fetchWithTimeout(
  url: string,
  timeoutMs = 10_000,
  headers?: Record<string, string>
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal, headers })
    return res
  } finally {
    clearTimeout(timer)
  }
}
