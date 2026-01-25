import axios from "axios";

import { HOST } from "../constants";

const authenticate = async (
  code: string,
  privateAccess: boolean,
  userKey: string,
) => {
  try {
    const fullUrl = `https://${HOST}/api/authenticate?code=${code}&private_access=${privateAccess}&user_key=${userKey}`;
    const result = await axios.post(fullUrl);
    const { userId, needDowngrade } = result.data;
    if (needDowngrade) {
      console.info(
        `User ${userId} needs downgrade from private to public access.`,
      );
      window.location.href = `https://${HOST}/api/downgrade?user_key=${userKey}`;
    }
    return userId;
  } catch (error) {
    console.error(error);
    return "";
  }
};

const getUserMetadata = async (
  userKey: string,
): Promise<null | { token: string; privateAccess: string }> => {
  try {
    const fullUrl = `https://${HOST}/api/user-access?user_key=${userKey}`;
    const result = await axios.get(fullUrl);
    return result.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const deleteAccount = async (
  _userId: string,
  userKey: string,
): Promise<unknown> => {
  try {
    const fullUrl = `https://${HOST}/api/delete-user?user_key=${userKey}`;
    const result = await axios.get(fullUrl);
    return result.data; // no decorator
  } catch (error) {
    console.error(error);
    return "";
  }
};

export { authenticate, getUserMetadata, deleteAccount };
