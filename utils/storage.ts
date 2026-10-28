type StorageBackend = Pick<Storage, 'getItem' | 'setItem'>;

/** Failed writes stay recoverable for export, without being mistaken for durable saves. */
export function createSafeStorage(backend: () => StorageBackend | null) {
  const session = new Map<string, string>();
  return {
    get(key: string): string | null {
      if (session.has(key)) return session.get(key)!;
      try { return backend()?.getItem(key) ?? null; } catch { return null; }
    },
    set(key: string, value: string): boolean {
      try {
        const storage = backend();
        if (storage) {
          storage.setItem(key, value);
          session.delete(key);
          return true;
        }
      } catch {}
      session.set(key, value);
      return false;
    },
  };
}
