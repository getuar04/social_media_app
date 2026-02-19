import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { doRegister } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    birthday: "",
    password: "",
  });

  const [err, setErr] = useState("");

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await doRegister(form);
      navigate("/login");
    } catch (error) {
      setErr(error?.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-7">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h3 className="mb-3">Create account</h3>

            {err && <div className="alert alert-danger">{err}</div>}

            <form onSubmit={onSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">First name</label>
                <input
                  className="form-control"
                  value={form.first_name}
                  onChange={(e) => setField("first_name", e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Last name</label>
                <input
                  className="form-control"
                  value={form.last_name}
                  onChange={(e) => setField("last_name", e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Username</label>
                <input
                  className="form-control"
                  value={form.username}
                  onChange={(e) => setField("username", e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Birthday</label>
                <input
                  className="form-control"
                  type="date"
                  value={form.birthday}
                  onChange={(e) => setField("birthday", e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="col-12 d-grid">
                <button className="btn btn-warning fw-semibold">
                  Register
                </button>
              </div>

              <div className="text-muted small">
                you have acount <Link to="/login">Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
