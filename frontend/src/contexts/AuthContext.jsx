import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3001/api";

const AuthContext = createContext(null);

/**
 * Provedor de autenticação. Gerencia o token JWT e os dados do usuário logado.
 * O token é armazenado em memória (state) para evitar vulnerabilidades de XSS
 * associadas ao localStorage.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  /**
   * Realiza o login do usuário via API e armazena o token em memória.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   */
  const login = useCallback(async (username, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
    setToken(res.data.token);
    setUser(res.data.user);
  }, []);

  /**
   * Realiza o logout do usuário, invalidando o token no servidor e limpando o estado.
   */
  const logout = useCallback(async () => {
    if (token) {
      try {
        await axios.post(
          `${API_BASE}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch {
        // Ignora erros no logout (token já pode ter expirado)
      }
    }
    setToken(null);
    setUser(null);
  }, [token]);

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
