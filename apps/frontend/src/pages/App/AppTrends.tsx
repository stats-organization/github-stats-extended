import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  logout as _logout,
  setUserAccess as _setUserAccess,
} from "../../redux/slices/user";
import { clearAxiosCache } from "../../axios-override";
import { HomeScreen } from "../Home/Home";
import { getUserMetadata } from "../../api/user";
import {
  useIsAuthenticated,
  useUserKey,
  useUserToken,
} from "../../redux/selectors/userSelectors";
import type { StageIndex } from "../../models/Stage";

import { Header } from "./Header";

const toMessage = (
  input: string | ErrorEvent | PromiseRejectionEvent,
): string => {
  if (typeof input === "string") {
    return input;
  }
  if ("reason" in input && input.reason?.message) {
    return input.reason.message;
  }
  if ("message" in input && input.message) {
    return input.message;
  }
  try {
    return JSON.stringify(input);
  } catch {
    return "Unknown error";
  }
};

const showError = (event: ErrorEvent | PromiseRejectionEvent): void => {
  toast.error(toMessage(event), {
    position: "bottom-right",
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
  });
};

export function AppTrends() {
  const userKey = useUserKey();
  const userToken = useUserToken();
  const isAuthenticated = useIsAuthenticated();

  const [stage, setStage] = useState<StageIndex>(isAuthenticated ? 1 : 0);

  const dispatch = useDispatch();

  useEffect(() => {
    const handler = (event: ErrorEvent | PromiseRejectionEvent) => {
      showError(event);
    };

    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", handler);

    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", handler);
    };
  }, []);

  useEffect(() => {
    clearAxiosCache();
  }, [userToken]);

  useEffect(() => {
    if (isAuthenticated && stage === 0) {
      setStage(1);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    async function getPrivateAccess() {
      if (userKey && userKey.length > 0) {
        const userAccess = await getUserMetadata(userKey);
        if (userAccess === null) {
          dispatch(_logout({ userKey }));
        } else {
          dispatch(_setUserAccess(userAccess));
        }
      }
    }
    getPrivateAccess();
  }, [userKey]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currStageIndex={stage} onStageIndexChange={setStage} />
      <section className="bg-white text-gray-700 flex-grow">
        <HomeScreen stage={stage} setStage={setStage} />
        <ToastContainer />
      </section>
    </div>
  );
}
