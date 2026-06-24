import { configureStore } from "@reduxjs/toolkit";

import { USE_LOGGER } from "../constants";

import { loggerMiddleware } from "./logger";
import theme from "./slices/theme";
import user from "./slices/user";

const store = configureStore({
  reducer: {
    user,
    theme,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware();
    if (USE_LOGGER) {
      return middleware.concat(loggerMiddleware);
    }
    return middleware;
  },
});

export { store };

export type StoreState = ReturnType<(typeof store)["getState"]>;
