export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 15000
): Promise<Response> {
  // Si un signal externe est déjà fourni, on prend le plus court des deux
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  // Fusionner le signal externe avec le signal interne de timeout
  const externalSignal = init?.signal as AbortSignal | undefined
  if (externalSignal) {
    // Si le signal externe est déjà aborté, on propage immédiatement
    if (externalSignal.aborted) {
      clearTimeout(timeoutId)
      controller.abort()
    } else {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true })
    }
  }

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error('Délai dépassé — le serveur met trop de temps à répondre.')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}
