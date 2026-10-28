import { useCallback, useRef, type SetStateAction } from 'react';

/** Synchronous simulation cell: fixed substeps never wait for a React commit. */
export function createFrameCell<T>(initial: T) {
  const ref = { current: initial };
  const set = (next: SetStateAction<T>) => {
    const value = typeof next === 'function'
      ? (next as (previous: T) => T)(ref.current) : next;
    if (Object.is(ref.current, value)) return false;
    ref.current = value;
    return true;
  };
  return { ref, set };
}

/** Canvas data is live every frame; the parent publishes UI snapshots separately. */
export function useFrameState<T>(initial: T, markDirty?: () => void) {
  const holder = useRef<ReturnType<typeof createFrameCell<T>> | null>(null);
  if (!holder.current) holder.current = createFrameCell(initial);
  const cell = holder.current;
  const set = useCallback((next: SetStateAction<T>) => {
    if (cell.set(next)) markDirty?.();
  }, [cell, markDirty]);
  return [cell.ref.current, set, cell.ref] as const;
}
