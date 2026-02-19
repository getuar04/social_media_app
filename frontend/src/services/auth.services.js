import api from "./api";

export const register = async (payload) => {
  const { data } = await api.post("/auth", payload);
  return data;
};

export const login = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const me = async () => {
  const { data } = await api.get("/auth/me");
  return data; 
};

export const logout = () => {
  localStorage.removeItem("token");
};
