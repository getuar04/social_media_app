import { createContext, useContext, useEffect, useState } from "react";
import * as Auth from "../services/auth.services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      const res = await Auth.me();
      const u = res?.user ?? res;
      setUser(u);
    } catch (err) {
      setUser(null);
      Auth.logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) loadMe();
    else setLoading(false);
  }, []);

  const doLogin = async (email, password) => {
    const res = await Auth.login({ email, password });

    if (res?.twoFactorRequired) {
      return res;
    }

    localStorage.setItem("token", res.token);
    await loadMe();
    return res;
  };

  const doVerify2FA = async (email, code) => {
    const res = await Auth.verify2FA({ email, code });
    localStorage.setItem("token", res.token);
    await loadMe();
    return res;
  };

  const doRegister = async (payload) => {
    return await Auth.register(payload);
  };

  const doLogout = () => {
    Auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        doLogin,
        doVerify2FA,
        doRegister,
        doLogout,
        loadMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
