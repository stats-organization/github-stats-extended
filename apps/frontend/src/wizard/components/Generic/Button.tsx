import { clsx } from "clsx";
import type { HTMLProps, JSX, ReactNode } from "react";

type ButtonVariant = "primary" | "soft" | "error";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLProps<HTMLButtonElement>, "size"> {
  children: ReactNode;
  /** DaisyUI color variant. Omit for the default neutral button. */
  variant?: ButtonVariant | undefined;
  size?: ButtonSize;
}

export function Button(props: ButtonProps): JSX.Element {
  const { className, children, variant, size = "md", ...rest } = props;

  return (
    <button
      {...rest}
      type="button"
      className={clsx(
        "btn text-lg",
        {
          "btn-primary": variant === "primary",
          "btn-soft": variant === "soft",
          "btn-error": variant === "error",
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
