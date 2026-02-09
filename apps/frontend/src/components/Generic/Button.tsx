import { clsx } from "clsx";
import type { HTMLProps, JSX, ReactNode } from "react";

interface ButtonProps extends HTMLProps<HTMLButtonElement> {
  children: ReactNode;
}

export function Button(props: ButtonProps): JSX.Element {
  const { className, children, ...rest } = props;
  return (
    <button
      {...rest}
      type="button"
      className={clsx(
        "border-0 py-2 px-6 inline-flex focus:outline-none rounded-[0.25rem] text-lg",
        className,
      )}
    >
      {children}
    </button>
  );
}
