import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ResetPassword from "./pages/ResetPassword";
import Verify2FAPage from "./pages/Verify2FAPage";

import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="container py-4">Loading...</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={user ? "/profile" : "/login"} replace />}
      />

      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-2fa" element={<Verify2FAPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/home" element={<HomePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
