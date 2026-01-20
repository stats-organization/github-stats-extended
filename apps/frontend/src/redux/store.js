import { applyMiddleware, createStore, compose } from "redux";

import loggerMiddleware from "./logger";
import rootReducer from "./reducers";
import { USE_LOGGER } from "../constants";

/**
 * @param {unknown?} initialState store initial state
 * @returns {import('redux').Store} store
 */
export default function configureStore(initialState) {
  let middlewares = [];
  if (USE_LOGGER) {
    middlewares = [loggerMiddleware];
  }
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer];
  const composedEnhancers = compose(...enhancers);

  const store = createStore(rootReducer, initialState, composedEnhancers);

  return store;
}
