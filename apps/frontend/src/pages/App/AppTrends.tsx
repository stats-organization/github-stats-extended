import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";

import { getUserMetadata } from "../../api/user";
import { clearAxiosCache } from "../../axios-override";
import type { StageIndex } from "../../models/Stage";
import {
  useIsAuthenticated,
  useUserKey,
  useUserToken,
} from "../../redux/selectors/userSelectors";
import {
  logout as _logout,
  setUserAccess as _setUserAccess,
} from "../../redux/slices/user";
import { HomeScreen } from "../Home/Home";

import { Header } from "./Header";

import "react-toastify/dist/ReactToastify.css";

const toMessage = (
  input: string | ErrorEvent | PromiseRejectionEvent,
): string => {
  if (typeof input === "string") {
    return input;
  }
  type MaybeErrorReason = { message: string } | null;
  const reason = ("reason" in input ? input.reason : null) as MaybeErrorReason;
  if (typeof reason?.message === "string" && !!reason.message.trim()) {
    return reason.message;
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

  {
    /**
     * This effect mus be executed only on page load,
     * otherwise logged in user are unable to go back on first step
     */
    const hasCheckedUserAuthStatusOnLoad = useRef(false);
    useEffect(() => {
      if (hasCheckedUserAuthStatusOnLoad.current) {
        return;
      }

      hasCheckedUserAuthStatusOnLoad.current = true;

      if (isAuthenticated && stage === 0) {
        setStage(1);
      }
    }, [isAuthenticated, stage]);
  }

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
    void getPrivateAccess();
  }, [dispatch, userKey]);

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
