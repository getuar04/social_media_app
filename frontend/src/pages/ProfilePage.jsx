import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as Post from "../services/post.services"; // kujdes: emri yt aktual

export default function ProfilePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    setErr("");
    setLoading(true);
    try {
      const data = await Post.getPosts();
      setPosts(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const myPosts = useMemo(() => {
    return posts.filter((p) => p.userId?._id === user?._id);
  }, [posts, user]);

  const add = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await Post.addPost({ content, media: "" });
      setContent("");
      loadPosts();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to add post");
    }
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="mb-3">My Profile</h4>

            <div className="mb-2">
              <div className="text-muted small">Name</div>
              <div className="fw-semibold">
                {user?.first_name} {user?.last_name}
              </div>
            </div>

            <div className="mb-2">
              <div className="text-muted small">Username</div>
              <div className="fw-semibold">{user?.username}</div>
            </div>

            <div className="mb-2">
              <div className="text-muted small">Email</div>
              <div className="fw-semibold">{user?.email}</div>
            </div>

            <div>
              <div className="text-muted small">Role</div>
              <span className="badge text-bg-dark">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <h5 className="mb-3">Add Post</h5>

            {err && <div className="alert alert-danger py-2">{err}</div>}

            <form onSubmit={add} className="d-grid gap-2">
              <input
                className="form-control"
                placeholder="Write something..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button className="btn btn-primary" disabled={!content.trim()}>
                Post
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-8">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h4 className="mb-0">My Posts</h4>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={loadPosts}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="alert alert-info">Loading posts...</div>
        ) : myPosts.length === 0 ? (
          <div className="alert alert-secondary">No posts yet.</div>
        ) : (
          <div className="d-grid gap-3">
            {myPosts.map((p) => (
              <div key={p._id} className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted small mb-2">
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                  <div className="fs-6">{p.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
