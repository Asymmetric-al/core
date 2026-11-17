"use client";

import { useLayoutEffect, useRef } from "react";

import type { RefObject } from "react";

// A disabled submit button drops focus, so focus waits on the busy form
// (tabIndex -1), then returns to Save or to the first invalid field. Only
// parked focus moves on: Safari also focuses a form on a button click.
export function useParkedSubmit({
  formRef,
  disabled,
  pending,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  disabled: boolean;
  pending: boolean;
}) {
  const saveRef = useRef<HTMLButtonElement>(null);
  const parked = useRef(false);
  useLayoutEffect(() => {
    const form = formRef.current;
    if (disabled) {
      if (document.activeElement === saveRef.current) {
        form?.focus({ preventScroll: true });
        parked.current = true;
      }
      if (pending || !parked.current) return;
      if (document.activeElement !== form) {
        parked.current = false;
        return;
      }
      const invalid = form?.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (invalid) {
        parked.current = false;
        invalid.focus();
      }
      return;
    }
    if (parked.current && document.activeElement === form) {
      saveRef.current?.focus();
    }
    parked.current = false;
  }, [disabled, pending, formRef]);
  return saveRef;
}
