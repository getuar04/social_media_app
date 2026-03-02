import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as Post from "../services/post.services";
import Pagination from "../components/pagination";

const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function ProfilePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [err, setErr] = useState("");

  // URL pagination
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "7", 10) || 7, 1),
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
  const myUsername = user?.username ?? "user";
  const myInitial = (myUsername?.[0] || "U").toUpperCase();

  const formatDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  }, []);

  const loadPosts = async () => {
    if (!userId) return;

    setLoadingPosts(true);
    setErr("");

    try {
      const res = await Post.getPosts(page, limit, userId || "");
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

  const onPage = (p) => {
    setSearchParams({ page: String(p), limit: String(limit) });
  };

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

  // Edit
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
      const updated = await Post.updatePost(id, {
        content: editContent.trim(),
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

  // Delete
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

  // Like
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

  return (
    <div className="container py-3" style={{ maxWidth: 980 }}>
      <div className="row g-3">
        {/* LEFT SIDEBAR */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-semibold text-white"
                  style={{ width: 44, height: 44, background: "#6c757d" }}
                >
                  {myInitial}
                </div>
                <div className="lh-sm">
                  <div className="fw-semibold" style={{ fontSize: 18 }}>
                    Profile
                  </div>
                  <div className="text-muted">@{myUsername}</div>
                </div>
              </div>

              <hr className="my-3" />

              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="fw-semibold">Create Post</div>
                {/* <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={loadPosts}
                  disabled={loadingPosts || !userId}
                  title={!userId ? "Login required" : ""}
                >
                  {loadingPosts ? "..." : "Refresh"}
                </button> */}
              </div>

              {!userId ? (
                <div className="alert alert-warning py-2 mb-0">
                  Please login to create posts.
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

        {/* RIGHT CONTENT */}
        <div className="col-12 col-lg-8">
          
          <div className="d-flex align-items-center justify-content-end mb-2">
            {/* <h4 className="mb-0">My Posts</h4> */}
            <div className="text-muted small">
              <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={loadPosts}
                  disabled={loadingPosts || !userId}
                  title={!userId ? "Login required" : ""}
                >
                  {loadingPosts ? "..." : "Refresh"}
                </button>
            </div>
          </div>

          {loadingPosts ? (
            <div className="alert alert-info py-2">Loading...</div>
          ) : err ? (
            <div className="alert alert-danger py-2">{err}</div>
          ) : !userId ? (
            <div className="alert alert-warning py-2">
              Please login to view your posts.
            </div>
          ) : myPosts.length === 0 ? (
            <div className="alert alert-secondary py-2">No posts yet.</div>
          ) : (
            <>
              <div className="d-grid gap-2">
                {myPosts.map((p) => {
                  const isEditing = editingId === p._id;

                  // ✅ show username from populated user object (network shows user.username)
                  const owner = p.user ?? p.userId;
                  const username =
                    typeof owner === "object" && owner?.username
                      ? owner.username
                      : myUsername;

                  const initials = (username?.[0] || "U").toUpperCase();

                  const imageSrc = p.imageUrl
                    ? p.imageUrl.startsWith("http")
                      ? p.imageUrl
                      : `${BACKEND_URL}${p.imageUrl}`
                    : null;

                  const createdLabel = p.createdAt
                    ? formatDate
                      ? formatDate.format(new Date(p.createdAt))
                      : new Date(p.createdAt).toLocaleString()
                    : "";

                  return (
                    <div key={p._id} className="card shadow-sm">
                      <div className="card-body p-3">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div className="d-flex gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-semibold text-white"
                              style={{
                                width: 36,
                                height: 36,
                                background: "#6c757d",
                                flex: "0 0 auto",
                              }}
                            >
                              {initials}
                            </div>

                            <div className="lh-sm">
                              <div className="fw-semibold">@{username}</div>
                              <div className="text-muted small">
                                {createdLabel}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex gap-2 align-items-start flex-wrap justify-content-end">
                            <button
                              className={`btn btn-sm ${
                                p.likedByMe
                                  ? "btn-primary"
                                  : "btn-outline-primary"
                              }`}
                              onClick={() => handleLike(p._id)}
                              disabled={likingId === p._id}
                              style={{ minWidth: 50 }}
                            >
                              {likingId === p._id
                                ? "..."
                                : `${p.likedByMe ? "Liked" : "Like"} • ${p.likesCount ?? 0}`}
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

                        {/* Body */}
                        {!isEditing ? (
                          <>
                            {p.content ? (
                              <div
                                className="mt-2"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 4,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {p.content}
                              </div>
                            ) : null}

                            {imageSrc ? (
                              <div className="mt-2">
                                <img
                                  src={imageSrc}
                                  alt="post"
                                  className="w-100 rounded"
                                  style={{ height: 500
                                    , objectFit: "cover" }}
                                  loading="lazy"
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

                            <div className="d-flex gap-2 mt-2">
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

              <div className="mt-3">
                <Pagination
                  page={pagination?.page || page}
                  totalPages={pagination?.totalPages || 1}
                  onPage={onPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
