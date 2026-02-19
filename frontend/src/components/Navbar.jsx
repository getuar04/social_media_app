import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, doLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    doLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to="/">
          SocialApp
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            {user && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile">
                    Profile
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/home">
                    Home
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex gap-2">
            {user ? (
              <>
                <span className="navbar-text text-white-50 me-2">
                  {user.first_name} {user.last_name}
                </span>
                <button
                  className="btn btn-outline-light"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light" to="/login">
                  Login
                </Link>
                <Link className="btn btn-warning" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
