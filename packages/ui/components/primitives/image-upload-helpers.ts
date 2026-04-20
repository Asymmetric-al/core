type EventWithDefaultPrevention = {
  defaultPrevented?: boolean;
};

type ButtonTriggerType = "button" | "submit" | "reset";

export function resolveButtonTriggerType(
  type?: ButtonTriggerType,
): ButtonTriggerType {
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
