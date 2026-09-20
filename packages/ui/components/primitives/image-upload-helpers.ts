type EventWithDefaultPrevention = {
  defaultPrevented?: boolean;
};

type ButtonTriggerType = "button" | "submit" | "reset";

type KeyboardClickEvent = EventWithDefaultPrevention & {
  key: string;
  preventDefault: () => void;
};

export type ImageUploadTriggerProps = {
  className?: string;
  onClick?: (event: EventWithDefaultPrevention) => void;
  onKeyDown?: (event: KeyboardClickEvent) => void;
  role?: string;
  tabIndex?: number;
  type?: ButtonTriggerType;
  disabled?: boolean;
  "aria-disabled"?: boolean;
  "aria-label"?: string;
};

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

export function isImageUploadButtonLike(
  elementType: unknown,
  buttonComponent: unknown,
): boolean {
  return (
    (typeof elementType === "string" && elementType === "button") ||
    elementType === buttonComponent
  );
}

export function imageUploadClonedTriggerProps({
  elementProps,
  isInteractive,
  isButtonLike,
  openFilePicker,
  triggerAriaLabel,
  className,
}: {
  elementProps: ImageUploadTriggerProps;
  isInteractive: boolean;
  isButtonLike: boolean;
  openFilePicker: () => void;
  triggerAriaLabel?: string;
  className: string;
}): ImageUploadTriggerProps {
  return {
    onClick: composeEventHandlers(
      elementProps.onClick,
      isInteractive
        ? () => {
            openFilePicker();
          }
        : undefined,
    ),
    onKeyDown: isButtonLike
      ? elementProps.onKeyDown
      : composeEventHandlers(elementProps.onKeyDown, (event) => {
          if (!isInteractive || !isKeyboardClickKey(event.key)) {
            return;
          }

          event.preventDefault();
          openFilePicker();
        }),
    role: isButtonLike ? elementProps.role : (elementProps.role ?? "button"),
    tabIndex: isButtonLike
      ? elementProps.tabIndex
      : (elementProps.tabIndex ?? (isInteractive ? 0 : -1)),
    "aria-disabled": isInteractive ? undefined : true,
    "aria-label": isButtonLike ? undefined : triggerAriaLabel,
    type: isButtonLike
      ? resolveButtonTriggerType(elementProps.type)
      : undefined,
    disabled: isButtonLike ? !isInteractive : undefined,
    className,
  };
}
