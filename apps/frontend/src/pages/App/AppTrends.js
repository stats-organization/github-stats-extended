import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { BrowserRouter as Router } from "react-router-dom";
import {
  logout as _logout,
  setUserAccess as _setUserAccess,
} from "../../redux/actions/userActions";

import Header from "./Header";
import HomeScreen from "../Home/Home";
import { getUserMetadata } from "../../api/user";
import {
  useIsAuthenticated,
  useUserKey,
  useUserToken,
} from "../../redux/selectors/userSelectors";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clearAxiosCache } from "../../axios-override";

export function App() {
  const toMessage = (input) => {
    if (typeof input === "string") {
      return input;
    }
    if (input.reason?.message) {
      return input.reason.message;
    }
    if (input.message) {
      return input.message;
    }
    try {
      return JSON.stringify(input);
    } catch {
      return "Unknown error";
    }
  };

  const showError = (event) => {
    toast.error(toMessage(event), {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });
  };

  window.addEventListener("error", (event) => {
    showError(event);
  });
  window.addEventListener("unhandledrejection", (event) => {
    showError(event);
  });

  const userToken = useUserToken();
  useEffect(() => {
    clearAxiosCache();
  }, [userToken]);

  const userKey = useUserKey();
  const isAuthenticated = useIsAuthenticated();
  const [stage, setStage] = useState(isAuthenticated ? 1 : 0);

  const dispatch = useDispatch();
  const setUserAccess = (access) =>
    dispatch(_setUserAccess(access.token, access.privateAccess));

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
          dispatch(_logout(userKey));
        } else {
          setUserAccess(userAccess);
        }
      }
    }
    getPrivateAccess();
  }, [userKey]);

  return (
    <div className="min-h-screen flex flex-col">
      <Router basename="/frontend">
        <Header stage={stage} setStage={setStage} />
        <section className="bg-white text-gray-700 flex-grow">
          <HomeScreen stage={stage} setStage={setStage} />
          <ToastContainer />
        </section>
      </Router>
    </div>
  );
}
