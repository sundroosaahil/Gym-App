import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setCheckingAuth(false));
  }, []);

  async function login(email, password, deviceModel) {
    await api.post("/auth/login", { email, password, deviceModel });
    setIsLoggedIn(true);
  }

  async function loginWithGoogle(credential, deviceModel) {
    await api.post("/auth/google", { credential, deviceModel });
    setIsLoggedIn(true);
  }

  async function logout(deviceModel) {
    await api.post("/auth/logout", { deviceModel });
    setIsLoggedIn(false);
  }
  async function logoutAll(deviceModel) {
    await api.post("/auth/logout-all", { deviceModel });
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, checkingAuth, login, loginWithGoogle, logout, logoutAll }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}