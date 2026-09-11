export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { readonly attempts?: number; readonly delayMs?: number } = {},
): Promise<T> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const delayMs = Math.max(0, options.delayMs ?? 250);
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts - 1) break;
      await new Promise((resolve) =>
        setTimeout(resolve, delayMs * 2 ** attempt),
      );
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Operasi gagal");
}
