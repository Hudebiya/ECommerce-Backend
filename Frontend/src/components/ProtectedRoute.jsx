import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useToast } from "../context/ToastContext";

export default function ProtectedRoute({ guestOnly = false, children }) {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!guestOnly && !isLoading && !user) {
      showToast("Please sign in first");
    }
  }, [guestOnly, isLoading, showToast, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-ink/70" role="status">
        Checking your session...
      </div>
    );
  }

  if (guestOnly) {
    return user ? <Navigate to="/" replace /> : children || <Outlet />;
  }

  return user ? children || <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}