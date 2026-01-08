import * as types from '../actions/userActions';

const initialState = {
  userId: JSON.parse(localStorage.getItem('userId')) || null,
  userKey: JSON.parse(localStorage.getItem('userKey')) || null,
  token: null,
  privateAccess: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN:
      localStorage.setItem('userId', JSON.stringify(action.payload.userId));
      localStorage.setItem('userKey', JSON.stringify(action.payload.userKey));
      return {
        ...state,
        userId: action.payload.userId,
        userKey: action.payload.userKey,
      };
    case types.LOGOUT:
      if (
        action.payload.userKey !== null &&
        action.payload.userKey !== JSON.parse(localStorage.getItem('userKey'))
      ) {
        return state;
      }
      localStorage.clear();
      return {
        userId: null,
        userKey: null,
        token: null,
        privateAccess: null,
      };
    case types.SET_USER_ACCESS:
      return {
        ...state,
        token: action.payload.token,
        privateAccess: action.payload.privateAccess,
      };
    default:
      return state;
  }
};
