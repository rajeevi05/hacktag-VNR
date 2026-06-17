import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface OnboardingCheckProps {
  children: ReactNode;
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const { loading, hasOnboarded } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Checking onboarding status...</p>
        </div>
      </div>
    );
  }

  if (!hasOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
} 
