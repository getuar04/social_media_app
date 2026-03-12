import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { doLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await doLogin(email, password);

      if (res?.twoFactorRequired) {
        navigate("/verify-2fa", {
          state: { email: res.email || email.toLowerCase().trim() },
        });
        return;
      }

      navigate("/profile");
    } catch (error) {
      setErr(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(13,110,253,0.12), rgba(255,193,7,0.12))",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-md-5 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h3 className="mb-3">Login</h3>

                {err && <div className="alert alert-danger">{err}</div>}

                <form onSubmit={onSubmit} className="d-grid gap-3">
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="form-label">Password</label>
                    <input
                      className="form-control"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="text-end">
                    <Link to="/reset-password" className="small text-decoration-none">
                      Forgot password?
                    </Link>
                  </div>

                  <button className="btn btn-dark" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </button>

                  <div className="text-muted small">
                    Don’t have an account? <Link to="/register">Register</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
