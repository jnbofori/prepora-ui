import api from "@/api/axios";
import PropTypes from "prop-types";
import { useContext, useReducer, useMemo, createContext } from 'react';

export const AuthContext = createContext(null);
AuthContext.displayName = "AuthContext";

export function reducer(state, action) {
  switch (action.type) {
    case "LOGIN": {
      return { ...state, isLoggedIn: true, user: action.value, token: action.value.token };
    }
    case "LOGOUT": {
      return { ...state, isLoggedIn: false, user: null, token: null };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export function AuthContextProvider({ children }) {
  const initialState = {
    user: null,
    token: null,
    isLoggedIn: false
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async (credentials) => {
    const response = await api.post(`/account/login`, credentials)
    const user = response.data;
    localStorage.setItem("token", user.token);
    dispatch({ type: "LOGIN", value: user });
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  const getUser = async () => {
    const response = await api.get("/account");
    const user = response.data;
    if (user) {
      dispatch({ type: "LOGIN", value: user });
    }
  }

  const hasAccessToken = () => {
    return localStorage.getItem("token") !== null;
  }

  const value = useMemo(
    () => ({
      state,
      dispatch,
      login,
      logout,
      getUser,
      hasAccessToken
    }), [state, dispatch]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth should be used inside the AuthContextProvider."
    );
  }

  return context;
}

AuthContextProvider.displayName = "/src/context/AuthContext.js";

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const setUserLoggedIn = (dispatch, value) =>
  dispatch({ type: "LOGIN", value });
export const setUserLoggedOut = (dispatch, value) =>
  dispatch({ type: "LOGOUT", value });
