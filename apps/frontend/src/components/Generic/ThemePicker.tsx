import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import { createPortal } from "react-dom";
import {
  FaCheck as CheckIcon,
  FaMoon as MoonIcon,
  FaSun as SunIcon,
} from "react-icons/fa";

import { useTheme } from "../../redux/selectors/themeSelectors";
import { THEMES } from "../../redux/slices/theme";

interface ThemeIconProps {
  isDark: boolean;
  className: string;
}

/** Sun for light themes, moon for dark ones. */
function ThemeIcon({ isDark, className }: ThemeIconProps): JSX.Element {
  return isDark ? (
    <MoonIcon className={className} />
  ) : (
    <SunIcon className={className} />
  );
}

export function ThemePicker(): JSX.Element {
  const { theme, isDark, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const handleToggle = useCallback(() => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((value) => !value);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const close = () => {
      setOpen(false);
    };
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", close);
    // Close on scroll so the fixed menu can't detach from its button.
    window.addEventListener("scroll", close, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-ghost btn-circle  not-[&:hover]:text-current"
        aria-label="Choose theme"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Choose theme"
        onClick={handleToggle}
      >
        <ThemeIcon isDark={isDark} className="w-4 h-4" />
      </button>

      {open &&
        createPortal(
          <ul
            ref={menuRef}
            role="menu"
            className="menu bg-base-200 text-base-content rounded-box fixed z-[9999] w-48 p-2 shadow-lg"
            style={{ top: position.top, right: position.right }}
          >
            {THEMES.map((option) => (
              <li key={option.name}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={option.name === theme}
                  data-theme-value={option.name}
                  className="flex items-center justify-between"
                  onClick={() => {
                    setTheme(option.name);
                    setOpen(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <ThemeIcon isDark={option.isDark} className="w-4 h-4" />
                    {option.label}
                  </span>
                  {option.name === theme && <CheckIcon className="w-3 h-3" />}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  );
}
