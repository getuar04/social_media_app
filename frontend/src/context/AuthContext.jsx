import { createContext, useContext, useEffect, useState } from "react";
import * as Auth from "../services/auth.services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      const u = await Auth.me();
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
    localStorage.setItem("token", res.token);
    setUser(res.user);
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
      value={{ user, setUser, loading, doLogin, doRegister, doLogout, loadMe }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
