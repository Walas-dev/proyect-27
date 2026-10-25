// src/lib/admin/memo.ts
export function memoTtl<T>(fn: () => Promise<T>, ttlMs: number) {
  let value: { data: T; at: number } | null = null;
  let inflight: Promise<T> | null = null;

  return async (): Promise<T> => {
    if (value && Date.now() - value.at < ttlMs) return value.data;
    inflight ??= fn()
      .then((data) => {
        if (data !== null) value = { data, at: Date.now() }; // no se recuerda un "no existe"
        return data;
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  };
}