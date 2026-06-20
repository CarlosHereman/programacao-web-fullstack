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

const JokeContext = createContext(null);

export function JokeProvider({ children }) {
  const [state, dispatch] = useReducer(jokeReducer, initialState);

  return (
    <JokeContext.Provider value={{ state, dispatch }}>
      {children}
    </JokeContext.Provider>
  );
}

export function useJoke() {
  const context = useContext(JokeContext);
  if (!context) {
    throw new Error("useJoke deve ser usado dentro de um JokeProvider");
  }
  return context;
}
