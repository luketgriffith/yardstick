import * as constants from './constants';

const initialState = {
  user: {},
  userExp: [],
  userListings: [],
  location: {
    latitude: null,
    longitude: null
  }
};

export default function authReducer(state=initialState, action={}) {
  switch(action.type) {
    case constants.SET_USER:
      return { ...state, user: action.user };
    case constants.SET_LOCATION:
      return { ...state, location: action.payload };
    case constants.LOGOUT:
      return initialState;
    case constants.SET_USER_EXP:
      return { ...state, userExp: action.payload };
    case constants.SET_USER_LISTINGS:
      return { ...state, userListings: action.payload };
    default:
      return state;
  }
}
