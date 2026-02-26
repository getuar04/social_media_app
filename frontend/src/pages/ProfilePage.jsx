import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as Post from "../services/post.services";
import Pagination from "../components/pagination";

const BACKEND_URL = process.env.REACT_APP_API_URL;  // ndrroje nese ke tjeter

export default function ProfilePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [err, setErr] = useState("");

  // Pagination from URL: /profile?page=3&limit=5
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "5", 10) || 5, 1),
    50,
  );

  // Like
  const [likingId, setLikingId] = useState(null);

  // Add post
  const [newContent, setNewContent] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [adding, setAdding] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState(null);

  // User normalize
  const userId = user?._id ?? user?.id;
  const firstName = user?.first_name ?? user?.name ?? "";
  const lastName = user?.last_name ?? user?.surname ?? "";
  const username = user?.username ?? "";

  const loadPosts = async () => {
    setLoadingPosts(true);
    setErr("");

    try {
      const res = await Post.getPosts(page, limit, userId || ""); // { data, pagination }
      setPosts(Array.isArray(res?.data) ? res.data : []);
      setPagination(res?.pagination || { totalPages: 1, page, limit });
    } catch (e) {
      setErr(e?.response?.data?.message || "Server error");
      setPosts([]);
      setPagination({ totalPages: 1, page, limit });
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, userId]);

  const myPosts = useMemo(() => posts, [posts]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setAdding(true);
    setErr("");

    try {
      const created = await Post.addPost({
        content: newContent.trim(),
        imageFile: newFile,
      });


      setPosts((prev) => [created, ...prev]);

      setNewContent("");
      setNewFile(null);

      const input = document.getElementById("postImageInput");
      if (input) input.value = "";
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to add post");
    } finally {
      setAdding(false);
    }
  };

  // Edit post
  const startEdit = (p) => {
    setEditingId(p._id);
    setEditContent(p.content ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleUpdate = async (id) => {
    if (!editContent.trim()) return;

    setSavingEdit(true);
    setErr("");

    try {
      const updated = await Post.updatePost(id, { content: editContent.trim() });

      setPosts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...updated } : p)),
      );

      cancelEdit();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update post");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete post
  const handleDelete = async (id) => {
    const ok = window.confirm("A je i sigurt qe don me fshi postimin?");
    if (!ok) return;

    setDeletingId(id);
    setErr("");

    try {
      await Post.deletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  // Like / Unlike
  const handleLike = async (postId) => {
    setErr("");
    setLikingId(postId);

    try {
      const res = await Post.toggleLike(postId); 

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likesCount: res.likesCount, likedByMe: res.liked }
            : p,
        ),
      );
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to like post");
    } finally {
      setLikingId(null);
    }
  };

  const onPage = (p) => {
    setSearchParams({ page: String(p), limit: String(limit) });
  };

  return (
    <div className="row g-4">
      {/* LEFT */}
      <div className="col-12 col-lg-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="mb-1">Profili</h4>

            <div className="mt-3 fs-4 fw-semibold">
              {firstName} {lastName}
            </div>
            {username ? <div className="text-muted">@{username}</div> : null}

            <hr className="my-4" />

            <h5 className="mb-2">Create Post</h5>

            {!userId ? (
              <div className="alert alert-warning mb-0">
                User is not ready (id missing). Fix /auth/me + token.
              </div>
            ) : (
              <form onSubmit={handleAdd} className="d-grid gap-2">
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Write something..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  maxLength={1000}
                />

                <input
                  id="postImageInput"
                  className="form-control"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                />

                <button
                  className="btn btn-primary"
                  disabled={adding || !newContent.trim()}
                >
                  {adding ? "Posting..." : "Post"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="col-12 col-lg-8">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0">My Posts</h4>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={loadPosts}
            disabled={loadingPosts}
          >
            {loadingPosts ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loadingPosts ? (
          <div className="alert alert-info">Loading...</div>
        ) : err ? (
          <div className="alert alert-danger">{err}</div>
        ) : !userId ? (
          <div className="alert alert-warning">
            User is not ready (id not defined). Check /auth/me and token.
          </div>
        ) : myPosts.length === 0 ? (
          <div className="alert alert-secondary">No posts yet.</div>
        ) : (
          <>
            <div className="d-grid gap-3">
              {myPosts.map((p) => {
                const isEditing = editingId === p._id;

                const owner = p.user ?? p.userId;
                const authorName =
                  typeof owner === "object"
                    ? (
                        `${owner?.first_name ?? owner?.name ?? ""} ${
                          owner?.last_name ?? owner?.surname ?? ""
                        }`.trim() || `${firstName} ${lastName}`.trim()
                      )
                    : `${firstName} ${lastName}`.trim();

                const imageSrc = p.imageUrl ? `${BACKEND_URL}${p.imageUrl}` : "";

                return (
                  <div key={p._id} className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <div className="text-muted small mb-1">
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleString()
                              : ""}
                          </div>
                          <div className="fw-semibold">{authorName}</div>
                        </div>

                        <div className="d-flex gap-2 align-items-start">
                          <button
                            className={`btn btn-sm ${
                              p.likedByMe
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
                            onClick={() => handleLike(p._id)}
                            disabled={likingId === p._id}
                          >
                            {likingId === p._id
                              ? "..."
                              : `${p.likedByMe ? "Liked" : "Like"} • ${
                                  p.likesCount ?? 0
                                }`}
                          </button>

                          {!isEditing ? (
                            <>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => startEdit(p)}
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(p._id)}
                                disabled={deletingId === p._id}
                              >
                                {deletingId === p._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {!isEditing ? (
                        <>
                          <div className="mt-2">{p.content}</div>

                          {p.imageUrl ? (
                            <div className="mt-2">
                              <img
                                src={imageSrc}
                                alt="post"
                                className="img-fluid rounded"
                                style={{
                                  maxHeight: "400px",
                                  objectFit: "cover",
                                }}
                                onError={(e) =>
                                  (e.currentTarget.style.display = "none")
                                }
                              />
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <textarea
                            className="form-control mt-3"
                            rows={3}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            maxLength={1000}
                          />

                          <div className="d-flex gap-2 mt-3">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdate(p._id)}
                              disabled={savingEdit || !editContent.trim()}
                            >
                              {savingEdit ? "Saving..." : "Save"}
                            </button>

                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={cancelEdit}
                              disabled={savingEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* numeric pagination in bottom + URL */}
            <Pagination
              page={pagination?.page || page}
              totalPages={pagination?.totalPages || 1}
              onPage={onPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
