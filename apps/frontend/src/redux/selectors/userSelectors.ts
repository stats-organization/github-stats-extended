import { useSelector } from "react-redux";

import type { StoreState } from "../store";

export const useUserId = <TUserName extends string | undefined>(
  fallbackUsername?: TUserName,
): TUserName => {
  const storeValue = useSelector((state: StoreState) => state.user.userId);
  return (storeValue || fallbackUsername || null) as TUserName;
};

export const useIsAuthenticated = (): boolean => {
  return useSelector((state: StoreState) => {
    const userId = state.user.userId;
    return !!(userId && userId.length > 0);
  });
};

export const usePrivateAccess = (): string | null => {
  return useSelector((state: StoreState) => state.user.privateAccess);
};

export const useUserKey = (): string | null => {
  return useSelector((state: StoreState) => state.user.userKey);
};

export const useUserToken = (): string | null => {
  return useSelector((state: StoreState) => state.user.token);
};
