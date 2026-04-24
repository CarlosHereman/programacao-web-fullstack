import { createContext, useContext, useReducer } from "react";

const initialState = {
  jokes: [],
  loading: false,
  error: null,
  apiError: null,
  lastSearch: null,
};

export const ACTIONS = {
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  API_ERROR: "API_ERROR",
  CLEAR_RESULTS: "CLEAR_RESULTS",
};

