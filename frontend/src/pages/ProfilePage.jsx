import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as Post from "../services/post.services";

export default function ProfilePage() {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [err, setErr] = useState("");

  // LIKE
  const [likingId, setLikingId] = useState(null);

  // ADD
  const [newContent, setNewContent] = useState("");
  const [newMedia, setNewMedia] = useState("");
  const [adding, setAdding] = useState(false);

  // EDIT
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editMedia, setEditMedia] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // DELETE
  const [deletingId, setDeletingId] = useState(null);

  const userId = user?._id ?? user?.id;
  const firstName = user?.first_name ?? user?.name ?? "";
  const lastName = user?.last_name ?? user?.surname ?? "";
  const username = user?.username ?? "";

  const loadPosts = async () => {
    setLoadingPosts(true);
    setErr("");
    try {
      const data = await Post.getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load posts");
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const myPosts = useMemo(() => {
    if (!userId) return [];

    return posts.filter((p) => {
      const postOwnerId =
        typeof p.userId === "object"
          ? (p.userId?._id ?? p.userId?.id)
          : p.userId;

      return String(postOwnerId) === String(userId);
    });
  }, [posts, userId]);

  // -------- ADD --------
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setAdding(true);
    setErr("");
    try {
      const created = await Post.addPost({
        content: newContent.trim(),
        media: newMedia.trim(),
      });

      setPosts((prev) => [created, ...prev]);
      setNewContent("");
      setNewMedia("");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to add post");
    } finally {
      setAdding(false);
    }
  };

  // -------- EDIT --------
  const startEdit = (p) => {
    setEditingId(p._id);
    setEditContent(p.content ?? "");
    setEditMedia(p.media ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditMedia("");
  };

  const handleUpdate = async (id) => {
    if (!editContent.trim()) return;

    setSavingEdit(true);
    setErr("");
    try {
      const updated = await Post.updatePost(id, {
        content: editContent.trim(),
        media: editMedia.trim(),
      });

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

  // -------- DELETE --------
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

  // -------- LIKE (toggle) --------
  const handleLike = async (postId) => {
    try {
      setErr("");
      setLikingId(postId);

      // duhet te ekzistoje Post.toggleLike ne services
      const res = await Post.toggleLike(postId); // { liked, likesCount }

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

  return (
    <div className="row g-4">
      {/* LEFT: PROFILE + CREATE */}
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
                  className="form-control"
                  placeholder="Media URL (optional)"
                  value={newMedia}
                  onChange={(e) => setNewMedia(e.target.value)}
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

      {/* RIGHT: MY POSTS */}
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
          <div className="d-grid gap-3">
            {myPosts.map((p) => {
              const isEditing = editingId === p._id;

              const authorName =
                typeof p.userId === "object"
                  ? `${p.userId?.first_name ?? p.userId?.name ?? ""} ${
                      p.userId?.last_name ?? p.userId?.surname ?? ""
                    }`.trim() || `${firstName} ${lastName}`.trim()
                  : `${firstName} ${lastName}`.trim();

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

                      {/* Right side actions */}
                      <div className="d-flex gap-2 align-items-start">
                        <button
                          className={`btn btn-sm ${
                            p.likedByMe ? "btn-primary" : "btn-outline-primary"
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
                              {deletingId === p._id ? "Deleting..." : "Delete"}
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {!isEditing ? (
                      <>
                        <div className="mt-2">{p.content}</div>

                        {p.media ? (
                          <div className="mt-2">
                            <img
                              src={p.media}
                              alt="post"
                              className="img-fluid rounded"
                              style={{ maxHeight: "400px", objectFit: "cover" }}
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

                        <input
                          className="form-control mt-2"
                          value={editMedia}
                          onChange={(e) => setEditMedia(e.target.value)}
                          placeholder="Media URL (optional)"
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
        )}
      </div>
    </div>
  );
}
