import { clsx } from "clsx";
import type { JSX, ReactNode } from "react";
import { FaExternalLinkAlt as ExternalIcon } from "react-icons/fa";

interface LinkExternalProps {
  href: string;
  children: ReactNode;
  className?: string;
  /**
   * Set to `false` for links that already carry their own mark, such as the
   * branded GitHub button, where a second icon would only add noise.
   */
  showIcon?: boolean;
}

/**
 * A link that opens in a new tab, with the `rel` that `target="_blank"`
 * requires, and a trailing icon so the new tab is announced before the click.
 */
export function LinkExternal({
  href,
  children,
  className,
  showIcon = true,
}: LinkExternalProps): JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx("inline-flex items-center gap-1", className)}
    >
      {children}
      {showIcon && <ExternalIcon className="w-3 h-3 shrink-0" aria-hidden />}
    </a>
  );
}
