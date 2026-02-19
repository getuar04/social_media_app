import { useEffect, useState } from "react";
import { getPosts, toggleLike } from "../services/post.services";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [likingId, setLikingId] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    setErr("");

    try {
      const data = await getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      setErr("");
      setLikingId(postId);

      const res = await toggleLike(postId); // { liked, likesCount }

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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Home</h3>

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={loadPosts}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {loading && posts.length === 0 ? (
        <div>Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-muted">No posts yet.</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {posts.map((p) => (
            <div key={p._id} className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="fw-semibold">
                    @{p?.userId?.username || "unknown"}
                    <span className="text-muted fw-normal ms-2">
                      {p?.userId?.name
                        ? `${p.userId.name} ${p.userId.surname || ""}`
                        : ""}
                    </span>
                  </div>

                  <small className="text-muted">
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                  </small>
                </div>

                <p className="mt-2 mb-0">{p.content}</p>

                {p.media ? (
                  <div className="mt-3">
                    <img
                      src={p.media}
                      alt="post media"
                      className="img-fluid rounded"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                ) : null}

                <button
                  className={`btn btn-sm mt-3 ${
                    p.likedByMe ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => handleLike(p._id)}
                  disabled={likingId === p._id}
                >
                  {likingId === p._id
                    ? "..."
                    : `${p.likedByMe ? "Liked" : "Like"} • ${p.likesCount ?? 0}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
