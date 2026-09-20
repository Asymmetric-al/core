"use client";

import * as React from "react";

/**
 * `useState` whose setter also notifies the parent with the next value from
 * the event that produced it, instead of an effect that pushes state back up
 * a render later. The latest value is mirrored in a ref so several updates in
 * one tick still chain, and the updater stays pure (no side effects inside).
 */
export function useNotifyingState<T>(
  initialValue: T,
  onChange?: (next: T) => void,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(initialValue);
  const valueRef = React.useRef(value);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const update = React.useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (action) => {
      const next =
        typeof action === "function"
          ? (action as (prev: T) => T)(valueRef.current)
          : action;
      valueRef.current = next;
      setValue(next);
      onChange?.(next);
    },
    [onChange],
  );

  return [value, update];
}
