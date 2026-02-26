import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as Post from "../services/post.services";
import Pagination from "../components/pagination";
import { useAuth } from "../context/AuthContext";


const BACKEND_URL = process.env.REACT_APP_API_URL; 
console.log('🛃 BACKEND_URL:', BACKEND_URL);

export default function HomePage() {
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const limitFromUrl = parseInt(searchParams.get("limit") || "7", 10);

  const page = Number.isNaN(pageFromUrl) ? 1 : Math.max(pageFromUrl, 1);
  const limit = Number.isNaN(limitFromUrl)
    ? 10
    : Math.min(Math.max(limitFromUrl, 1), 50);

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [likingId, setLikingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await Post.getPosts(page, limit); 
      setPosts(Array.isArray(res?.data) ? res.data : []);
      setPagination(res?.pagination || null);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load posts");
      setPosts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, limit]);

  const onPage = (p) => {
    setSearchParams({ page: String(p), limit: String(limit) });
  };

  const handleLike = async (postId) => {
    if (!user) return; 
    setLikingId(postId);
    setErr("");

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
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Home</h3>
        <div className="text-muted small">
          Page {pagination?.page || page} / {pagination?.totalPages || 1}
        </div>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading...</div>
      ) : err ? (
        <div className="alert alert-danger">{err}</div>
      ) : posts.length === 0 ? (
        <div className="alert alert-secondary">No posts.</div>
      ) : (
        <>
          <div className="d-grid gap-3">
            {posts.map((p) => {
              const owner = p.user ?? p.userId;
              const authorName =
                typeof owner === "object"
                  ? `${owner?.first_name ?? owner?.name ?? ""} ${owner?.last_name ?? owner?.surname ?? ""}`.trim()
                  : "User";

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

                      <button
                        className={`btn btn-sm ${
                          p.likedByMe ? "btn-primary" : "btn-outline-primary"
                        }`}
                        onClick={() => handleLike(p._id)}
                        disabled={!user || likingId === p._id}
                        title={!user ? "Login to like" : ""}
                      >
                        {likingId === p._id
                          ? "..."
                          : `${p.likedByMe ? "Liked" : "Like"} • ${p.likesCount ?? 0}`}
                      </button>
                    </div>

                    <div className="mt-2">{p.content}</div>

                    {p.imageUrl ? (
                      <div className="mt-2">
                        <img
                          src={imageSrc}
                          alt="post"
                          className="img-fluid rounded"
                          style={{ maxHeight: "420px", objectFit: "cover" }}
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            page={pagination?.page || page}
            totalPages={pagination?.totalPages || 1}
            onPage={onPage}
          />
        </>
      )}
    </div>
  );
}
