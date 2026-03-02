import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as Post from "../services/post.services";
import Pagination from "../components/pagination";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function HomePage() {
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const limitFromUrl = parseInt(searchParams.get("limit") || "7", 10);

  const page = Number.isNaN(pageFromUrl) ? 1 : Math.max(pageFromUrl, 1);
  const limit = Number.isNaN(limitFromUrl)
    ? 7
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const onPage = (p) =>
    setSearchParams({ page: String(p), limit: String(limit) });

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

  return (
    <div className="container py-3" style={{ maxWidth: 760 }}>
      {/* <div className="d-flex align-items-center justify-content-between mb-2">
        <h4 className="mb-0">Home</h4>
        <div className="text-muted small">
          Page {pagination?.page || page} / {pagination?.totalPages || 1}
        </div>
      </div> */}

      {loading ? (
        <div className="alert alert-info py-2">Loading...</div>
      ) : err ? (
        <div className="alert alert-danger py-2">{err}</div>
      ) : posts.length === 0 ? (
        <div className="alert alert-secondary py-2">No posts.</div>
      ) : (
        <>
          <div className="d-grid gap-2">
            {posts.map((p) => {
              const owner = p.user ?? p.userId;

              // ✅ USERNAME (si në network)
              const username =
                typeof owner === "object" && owner?.username
                  ? owner.username
                  : "user";

              // fallback initiale për avatar
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
                    {/* Header i ngushtë */}
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div className="d-flex gap-2">
                        {/* Avatar */}
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
                          <div className="text-muted small">{createdLabel}</div>
                        </div>
                      </div>

                      <button
                        className={`btn btn-sm ${
                          p.likedByMe ? "btn-primary" : "btn-outline-primary"
                        }`}
                        onClick={() => handleLike(p._id)}
                        disabled={!user || likingId === p._id}
                        title={!user ? "Login to like" : ""}
                      style={{ minWidth: 50 }}
                      >
                        {likingId === p._id
                          ? "..."
                          : `${p.likedByMe ? "Liked" : "Like"} • ${p.likesCount ?? 0}`}
                      </button>
                    </div>

                    {/* Content më i kontrolluar (mos u hap kartela) */}
                    {p.content ? (
                      <div
                        className="mt-2"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {p.content}
                      </div>
                    ) : null}

                    {/* Image kompakte */}
                    {imageSrc ? (
                      <div className="mt-2">
                        <img
                          src={imageSrc}
                          alt="post"
                          className="w-100 rounded"
                          style={{
                            height: 500,
                            objectFit: "cover",
                          }}
                          loading="lazy"
                          onError={(e) => {
                            console.log("Image load error:", imageSrc, e);
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : null}
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
  );
}
