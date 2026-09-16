import type { JSX, ReactNode } from "react";

import { LoginBoxDemoCards } from "./LoginBoxDemoCards";

interface LoginBoxProps {
  children: ReactNode;
}

export function LoginBox(props: LoginBoxProps): JSX.Element {
  const { children } = props;

  return (
    <div className="h-full flex flex-wrap">
      <div className="md:flex">
        <div className="lg:block lg:w-3/5 lg:p-8">
          <div className="bg-base-300 rounded-sm w-full h-full m-auto p-8 shadow lg:h-auto">
            {children}
          </div>
        </div>

        <LoginBoxDemoCards />
      </div>
    </div>
  );
}
