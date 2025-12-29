import axios from 'axios';

import { HOST } from '../constants';

const authenticate = async (code, privateAccess, userKey) => {
  try {
    const fullUrl = `https://${HOST}/api/authenticate?code=${code}&private_access=${privateAccess}&user_key=${userKey}`;
    const result = await axios.post(fullUrl);
    return result.data;
  } catch (error) {
    console.error(error);
    return '';
  }
};

const getUserMetadata = async (userKey) => {
  try {
    const fullUrl = `https://${HOST}/api/user-access?user_key=${userKey}`;
    const result = await axios.get(fullUrl);
    return result.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const deleteAccount = async (userId, userKey) => {
  try {
    const fullUrl = `https://${HOST}/api/delete-user?user_key=${userKey}`;
    const result = await axios.get(fullUrl);
    return result.data; // no decorator
  } catch (error) {
    console.error(error);
    return '';
  }
};

export { authenticate, getUserMetadata, deleteAccount };
