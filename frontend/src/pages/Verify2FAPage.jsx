import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Verify2FAPage() {
  const { doVerify2FA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await doVerify2FA(email, code);
      navigate("/profile", { replace: true });
    } catch (error) {
      setErr(error?.response?.data?.message || "Verification failed");
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
                <h3 className="mb-2">Verify 2FA</h3>
                <p className="text-muted small mb-3">
                  We sent a 6-digit verification code to <strong>{email}</strong>.
                </p>

                {err && <div className="alert alert-danger">{err}</div>}

                <form onSubmit={onSubmit} className="d-grid gap-3">
                  <div>
                    <label className="form-label">Verification Code</label>
                    <input
                      className="form-control"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      autoComplete="one-time-code"
                    />
                  </div>

                  <button className="btn btn-dark" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>

                  <div className="text-muted small">
                    Back to <Link to="/login">Login</Link>
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
