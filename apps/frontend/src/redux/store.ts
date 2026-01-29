import { configureStore } from "@reduxjs/toolkit";

import { USE_LOGGER } from "../constants";

import { loggerMiddleware } from "./logger";
import user from "./slices/user";

const store = configureStore({
  reducer: {
    user,
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
