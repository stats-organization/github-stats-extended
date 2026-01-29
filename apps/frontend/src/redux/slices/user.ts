import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/**
 * @public
 * Used to snooze knip report.
 * This export is unused but is required to properly perform infer types on the store:
 * error TS4023: Exported variable 'store' has or is using name 'UserState' from external module "src/redux/slices/user" but cannot be named.
 */
export interface UserState {
  userId: string | null;
  userKey: string | null;
  token: string | null;
  privateAccess: string | null;
}

function getFromLocalStorage(key: string): string | null {
  const storageValue = localStorage.getItem(key);
  if (!storageValue) {
    return null;
  }
  return (JSON.parse(storageValue) as string) || null;
}

const initialState: UserState = {
  userId: getFromLocalStorage("userId"),
  userKey: getFromLocalStorage("userKey"),
  token: null,
  privateAccess: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ userId: string; userKey: string }>,
    ) => {
      const { userId, userKey } = action.payload;
      localStorage.setItem("userId", JSON.stringify(userId));
      localStorage.setItem("userKey", JSON.stringify(userKey));
      state.userId = userId;
      state.userKey = userKey;
    },
    logout: (state, action: PayloadAction<{ userKey: string | null }>) => {
      const { userKey } = action.payload;
      if (
        userKey !== null &&
        userKey !== JSON.parse(localStorage.getItem("userKey") as string)
      ) {
        return;
      }

      localStorage.clear();
      state.userId = null;
      state.userKey = null;
      state.token = null;
      state.privateAccess = null;
    },
    setUserAccess: (
      state,
      action: PayloadAction<{ token: string; privateAccess: string }>,
    ) => {
      const { token, privateAccess } = action.payload;
      state.token = token;
      state.privateAccess = privateAccess;
    },
  },
});

export const { login, logout, setUserAccess } = userSlice.actions;

export default userSlice.reducer;
