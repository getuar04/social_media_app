import api from "./api";

export const getPosts = async () => {
  const { data } = await api.get("/posts");
  return data;
};

export const addPost = async (payload) => {
  const { data } = await api.post("/posts", payload);
  return data;
};

export const updatePost = async (id, payload) => {
  const { data } = await api.patch(`/posts/${id}`, payload);
  return data.post;
};

export const deletePost = async (id) => {
  await api.delete(`/posts/${id}`);
};

export const toggleLike = async (id) => {
  const { data } = await api.post(`/posts/${id}/like`);
  return data;
};
