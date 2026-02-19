import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { doLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await doLogin(email, password);
      navigate("/profile");
    } catch (error) {
      setErr(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6 col-lg-5">
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
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button className="btn btn-dark">Login</button>

              <div className="text-muted small">
                you dont have account <Link to="/register">Register</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
