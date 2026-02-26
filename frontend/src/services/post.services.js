import api from "./api";

/* ======================
   GET POSTS WITH PAGINATION
====================== */
export const getPosts = async (page = 1, limit = 5, userId = "") => {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (userId) qs.set("userId", userId);
  const { data } = await api.get(`/posts?${qs.toString()}`);
  // backend returns: { data: [...], pagination: {...} }
  return data;
};

/* ======================
   CREATE POST (WITH MULTER)
====================== */
export const addPost = async ({ content, imageFile }) => {
  const formData = new FormData();
  formData.append("content", content);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const { data } = await api.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

/* ======================
   UPDATE POST
====================== */
export const updatePost = async (id, payload) => {
  const { data } = await api.patch(`/posts/${id}`, payload);
  return data.post;
};

/* ======================
   DELETE POST
====================== */
export const deletePost = async (id) => {
  await api.delete(`/posts/${id}`);
};

/* ======================
   TOGGLE LIKE
====================== */
export const toggleLike = async (id) => {
  const { data } = await api.post(`/posts/${id}/like`);
  return data;
};
