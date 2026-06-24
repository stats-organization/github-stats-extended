import { clsx } from "clsx";
import type { HTMLProps, JSX, ReactNode } from "react";

type ButtonVariant = "primary" | "neutral" | "error";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLProps<HTMLButtonElement>, "size"> {
  children: ReactNode;
  /** DaisyUI color variant. Omit for the default neutral button. */
  variant?: ButtonVariant | undefined;
  size?: ButtonSize;
  /** Render the outlined style (`btn-outline`). */
  outline?: boolean;
}

export function Button(props: ButtonProps): JSX.Element {
  const {
    className,
    children,
    variant,
    size = "md",
    outline = false,
    ...rest
  } = props;

  return (
    <button
      {...rest}
      type="button"
      className={clsx(
        "btn text-lg",
        {
          "btn-primary": variant === "primary",
          "btn-neutral": variant === "neutral",
          "btn-error": variant === "error",
          "btn-outline": outline,
          "btn-sm": size === "sm",
          "btn-lg": size === "lg",
        },
        className,
      )}
    >
      {children}
    </button>
  );
}
