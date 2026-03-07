import type { JSX } from "react";
import { FaGithub as GithubIcon } from "react-icons/fa";

import { Button } from "../../../../components/Generic/Button";
import {
  GITHUB_PRIVATE_AUTH_URL,
  GITHUB_PUBLIC_AUTH_URL,
} from "../../../../constants";

import { LoginBox } from "./LoginBox";

interface LoginOptionsProps {
  onContinueAsGuest: () => void;
}

export function LoginOptions(props: LoginOptionsProps): JSX.Element {
  const { onContinueAsGuest } = props;

  return (
    <LoginBox>
      <div className="flex items-center gap-4 mb-4">
        <a href={GITHUB_PUBLIC_AUTH_URL}>
          <Button className="h-12 flex justify-center items-center w-[260px] text-white bg-blue-500 hover:bg-blue-600">
            <GithubIcon className="w-6 h-6" />
            <span className="ml-2 xl:text-lg">GitHub Public Access</span>
          </Button>
        </a>
        <p className="text-sm text-gray-600 flex-1">
          Generate stats based on your contributions in public repositories.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <a href={GITHUB_PRIVATE_AUTH_URL}>
          <Button className="h-12 flex justify-center items-center w-[260px] text-black border border-black bg-white hover:bg-gray-100">
            <GithubIcon className="w-6 h-6" />
            <span className="ml-2 xl:text-lg">GitHub Private Access</span>
          </Button>
        </a>
        <p className="text-sm text-gray-600 flex-1">
          Include contributions from private repositories for more complete and
          accurate stats.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          className="h-12 flex justify-center items-center w-[260px] text-black border border-black bg-white hover:bg-gray-100"
          onClick={onContinueAsGuest}
        >
          <span className="ml-2 xl:text-lg">Continue as Guest</span>
        </Button>
        <p className="text-sm text-gray-600 flex-1">
          Explore options using sample data. Insert your own username in the
          last step.
        </p>
      </div>
    </LoginBox>
  );
}
