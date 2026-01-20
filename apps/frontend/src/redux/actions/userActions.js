export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const SET_USER_ACCESS = "SET_USER_ACCESS";

export function login(userId, userKey) {
  return { type: LOGIN, payload: { userId, userKey } };
}

export function logout(userKey = null) {
  return { type: LOGOUT, payload: { userKey: userKey } };
}

export function setUserAccess(token, privateAccess) {
  return {
    type: SET_USER_ACCESS,
    payload: { token: token, privateAccess: privateAccess },
  };
}
