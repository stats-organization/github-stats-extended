import type { JSX } from "react";
import { FaGithub as GithubIcon } from "react-icons/fa";

import appIcon from "../assets/appLogo64.png";

import { LinkExternal } from "./LinkExternal";
import { ThemePicker } from "./ThemePicker";

interface AppBarProps {
  /**
   * Link shown next to the GitHub button, used to move between the wizard and
   * the documentation.
   */
  crossLink: { href: string; label: string };
}

/**
 * Top bar shared by the wizard and the documentation, so both pages keep the
 * same branding, theme picker and navigation.
 */
export function AppBar({ crossLink }: AppBarProps): JSX.Element {
  return (
    <div
      className="text-neutral-content shadow-md z-50"
      style={{
        backgroundColor: "color-mix(in oklab, var(--color-primary), #000 50%)",
      }}
    >
      <div className="px-5 py-2 flex flex-wrap">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center title-font font-medium text-neutral-content mb-0 md:mr-8"
        >
          <img src={appIcon} alt="logo" className="w-6 h-6" />
          <span className="ml-2 text-xl">GitHub Stats Extended</span>
        </a>
        {/* Cross link + star on GitHub + theme toggle */}
        <div className="flex ml-auto items-center gap-2 text-base justify-center">
          <a
            href={crossLink.href}
            className="rounded-[0.25rem] px-3 py-1 flex items-center hover:underline text-neutral-content"
          >
            {crossLink.label}
          </a>
          <LinkExternal
            href="https://github.com/stats-organization/github-stats-extended"
            showIcon={false}
            className="rounded-[0.25rem] shadow bg-neutral-content hover:opacity-90 text-neutral px-3 py-1"
          >
            Star on
            <GithubIcon className="ml-0.5 w-5 h-5" />
          </LinkExternal>
          <ThemePicker />
        </div>
      </div>
    </div>
  );
}
