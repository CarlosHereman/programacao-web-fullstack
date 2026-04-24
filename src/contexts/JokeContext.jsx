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

function jokeReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
        apiError: null,
        lastSearch: action.payload,
      };

    case ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        jokes: action.payload,
        error: null,
        apiError: null,
      };

    case ACTIONS.FETCH_ERROR:
      return {
        ...state,
        loading: false,
        jokes: [],
        error: action.payload,
      };

    case ACTIONS.API_ERROR:
      return {
        ...state,
        loading: false,
        jokes: [],
        apiError: action.payload,
      };

    case ACTIONS.CLEAR_RESULTS:
      return {
        ...initialState,
      };

    default:
      return state;
  }
}


