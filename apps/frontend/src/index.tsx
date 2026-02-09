import "./axios-override";

import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { AppTrends } from "./pages/App/AppTrends";
import { store } from "./redux/store";

import "./index.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <Provider store={store}>
    <AppTrends />
  </Provider>,
);
