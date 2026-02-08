import type { JSX } from "react";

import { useIsAuthenticated } from "../../../../redux/selectors/userSelectors";

import { LoginOptions } from "./LoginOptions";
import { LoginAccountManagement } from "./LoginAccountManagement";

interface LoginStageProps {
  onContinueAsGuest: () => void;
}

export function LoginStage({
  onContinueAsGuest,
}: LoginStageProps): JSX.Element {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <LoginAccountManagement />;
  }

  return <LoginOptions onContinueAsGuest={onContinueAsGuest} />;
}
