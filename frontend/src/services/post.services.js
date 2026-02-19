import api from "./api";

export const getPosts = async () => {
  const { data } = await api.get("/posts");
  return data;
};

export const addPost = async (payload) => {
  const { data } = await api.post("/posts", payload);
  return data;
};
