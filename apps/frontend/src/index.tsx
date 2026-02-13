import "./axios-override";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { AppTrends } from "./pages/App/AppTrends";
import { store } from "./redux/store";

import "./index.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <AppTrends />
    </Provider>
  </StrictMode>,
);
