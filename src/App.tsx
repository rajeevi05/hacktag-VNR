import { ReactNode, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthService } from "@/lib/authService";
import { DbService } from "@/lib/dbService";
import { useAuth } from "@/hooks/use-auth";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Onboarding from "./pages/Onboarding";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import GenerateWebsite from "./pages/dashboard/GenerateWebsite";
import InfluencerMatch from "./pages/dashboard/InfluencerMatch";
import EmailMarketing from "./pages/dashboard/EmailMarketing";
import AIInsights from "./pages/dashboard/AIInsights";
import Chatbot from "./pages/dashboard/Chatbot";
import FeedbackAnalyzer from "./pages/dashboard/FeedbackAnalyzer";
import Analytics from "./pages/dashboard/Analytics";
import Community from "./pages/dashboard/Community";
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function GoogleRedirectHandler() {
  useEffect(() => {
    (async () => {
      try {
        const result = await AuthService.handleRedirectResult();
        if (result?.user) {
          let hasOnboarded = false;

          try {
            const existingUser = await DbService.getUser(result.user.uid);

            if (!existingUser) {
              await DbService.createUserDocument(
                result.user.uid,
                result.user.email!,
                result.user.displayName
              );
            }

            hasOnboarded = existingUser?.hasOnboarded || false;

            if (existingUser?.businessProfile) {
              localStorage.setItem("onboardingData", JSON.stringify(existingUser.businessProfile));
            }
          } catch (profileError) {
            console.warn("Signed in with Google, but could not load the Firestore profile:", profileError);
          }

          localStorage.setItem("user", JSON.stringify({
            id: result.user.uid,
            email: result.user.email,
            name: result.user.displayName || result.user.email,
            avatar: result.user.photoURL,
          }));

          window.location.replace(hasOnboarded ? "/dashboard" : "/onboarding");
        }
      } catch (err) {
        console.error("Redirect login failed:", err);
      }
    })();
  }, []);

  return null;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading, hasOnboarded } = useAuth();

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
    return <>{children}</>;
  }

  return <Navigate to={hasOnboarded ? "/dashboard" : "/onboarding"} replace />;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="boostly-theme">
        <TooltipProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <GoogleRedirectHandler />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicOnlyRoute>
                    <Signup />
                  </PublicOnlyRoute>
                }
              />

              {/* Email Verification Route */}
              <Route
                path="/verify-email"
                element={
                  <ProtectedRoute>
                    <VerifyEmail />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="generate" element={<GenerateWebsite />} />
                <Route path="influencer" element={<InfluencerMatch />} />
                <Route path="email" element={<EmailMarketing />} />
                <Route path="insights" element={<AIInsights />} />
                <Route path="chatbot" element={<Chatbot />} />
                <Route path="feedback" element={<FeedbackAnalyzer />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="community" element={<Community />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
