import api from "./api";
export const register = async (payload) => {
  const { data } = await api.post("/auth", payload); // POST /auth
  return data;
};

export const login = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password }); // POST /auth/login
  return data; // { message, token, user }
};

export const me = async () => {
  const { data } = await api.get("/auth/me"); // GET /auth/me
  return data; // mongo user: _id, first_name, last_name, ...
};

export const logout = () => {
  localStorage.removeItem("token");
};
