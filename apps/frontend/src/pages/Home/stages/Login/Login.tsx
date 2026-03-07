import type { JSX } from "react";

import { useIsAuthenticated } from "../../../../redux/selectors/userSelectors";

import { LoginAccountManagement } from "./LoginAccountManagement";
import { LoginOptions } from "./LoginOptions";

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
