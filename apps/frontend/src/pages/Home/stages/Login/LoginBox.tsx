import clsx from "clsx";
import type { JSX, ReactNode } from "react";

import { LoginBoxDemoCards } from "./LoginBoxDemoCards";

interface LoginBoxProps {
  children: ReactNode;

  isOpaque?: boolean;
}

export function LoginBox(props: LoginBoxProps): JSX.Element {
  const { children, isOpaque = false } = props;

  return (
    <div className="h-full flex flex-wrap">
      <div className={clsx("md:flex", { "opacity-25": isOpaque })}>
        <div className="lg:block lg:w-3/5 lg:p-8">
          <div className="bg-gray-200 rounded-sm w-full h-full m-auto p-8 shadow lg:h-auto">
            {children}
          </div>
        </div>

        <LoginBoxDemoCards />
      </div>
    </div>
  );
}
