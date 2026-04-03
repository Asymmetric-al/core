type EventWithDefaultPrevention = {
  defaultPrevented?: boolean;
};

export function resolveButtonTriggerType(type?: string) {
  return type ?? "button";
}

export function composeEventHandlers<TEvent extends EventWithDefaultPrevention>(
  consumerHandler: ((event: TEvent) => void) | undefined,
  internalHandler: ((event: TEvent) => void) | undefined,
) {
  return (event: TEvent) => {
    consumerHandler?.(event);

    if (event.defaultPrevented) {
      return;
    }

    internalHandler?.(event);
  };
}

export function isKeyboardClickKey(key: string) {
  return key === "Enter" || key === " ";
}
