import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/auth.services";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const response = await forgotPassword({ email });
      setMsg(response?.message || "Reset link sent successfully");
      setEmail("");
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!password || !confirmPassword) {
      setErr("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        token,
        password,
        confirmPassword,
      });

      setMsg(response?.message || "Password reset successfully");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to reset password");
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
                <h3 className="mb-3">
                  {token ? "Reset Password" : "Forgot Password"}
                </h3>

                {err && <div className="alert alert-danger">{err}</div>}
                {msg && <div className="alert alert-success">{msg}</div>}

                {!token ? (
                  <form
                    onSubmit={handleForgotPassword}
                    className="d-grid gap-3"
                  >
                    <div>
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>

                    <button className="btn btn-dark" disabled={loading}>
                      {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    <div className="text-muted small">
                      Remember your password? <Link to="/login">Login</Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="d-grid gap-3">
                    <div>
                      <label className="form-label">New Password</label>
                      <input
                        className="form-control"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>

                    <div>
                      <label className="form-label">Confirm Password</label>
                      <input
                        className="form-control"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>

                    <button className="btn btn-dark" disabled={loading}>
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>

                    <div className="text-muted small">
                      Back to <Link to="/login">Login</Link>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
