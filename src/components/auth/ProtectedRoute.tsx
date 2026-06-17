import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, hasOnboarded } = useAuth();
  const location = useLocation();
  const canEnterDashboard = hasOnboarded || Boolean(localStorage.getItem("onboardingData"));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canEnterDashboard && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (canEnterDashboard && (location.pathname === "/verify-email" || location.pathname === "/onboarding")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
