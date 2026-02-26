import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { doRegister } = useAuth();
  const navigate = useNavigate();

  // backend expects: name, surname, username, email, birthday, password
  const [form, setForm] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    birthday: "",
    password: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await doRegister(form);
      navigate("/login");
    } catch (error) {
      setErr(error?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,193,7,0.12), rgba(13,110,253,0.12))",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-9 col-md-6 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h3 className="mb-3">Create account</h3>

                {err && <div className="alert alert-danger">{err}</div>}

                <form onSubmit={onSubmit} className="d-grid gap-3">
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label">Surname</label>
                      <input
                        className="form-control"
                        value={form.surname}
                        onChange={(e) => setField("surname", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Username</label>
                    <input
                      className="form-control"
                      value={form.username}
                      onChange={(e) => setField("username", e.target.value)}
                      autoComplete="username"
                    />
                  </div>

                  <div>
                    <label className="form-label">Birthday</label>
                    <input
                      className="form-control"
                      type="date"
                      value={form.birthday}
                      onChange={(e) => setField("birthday", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="form-label">Password</label>
                    <input
                      className="form-control"
                      type="password"
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>

                  <button
                    className="btn btn-warning fw-semibold"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Register"}
                  </button>

                  <div className="text-muted small">
                    Already have an account? <Link to="/login">Login</Link>
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
