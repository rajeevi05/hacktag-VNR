import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/authService";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const { user, emailVerified } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-refresh user state every 3 seconds
  useEffect(() => {
    if (!user || emailVerified) {
      return;
    }
    
    const checkVerification = async () => {
      const reloadedUser = await AuthService.reloadUser();
      if (reloadedUser?.emailVerified) {
        navigate("/onboarding", { replace: true });
      }
    };

    const interval = setInterval(checkVerification, 3000);
    
    return () => clearInterval(interval);
  }, [user, emailVerified, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            Please verify your email address to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            We've sent a verification link to <strong>{user?.email}</strong>
          </p>
          <Button
            onClick={async () => {
              setIsResending(true);
              try {
                await AuthService.resendVerification();
                toast({
                  title: "Verification email sent",
                  description: "Please check your inbox and follow the verification link.",
                });
              } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                toast({
                  title: "Error",
                  description: errorMessage,
                  variant: "destructive",
                });
              } finally {
                setIsResending(false);
              }
            }}
            disabled={isResending}
            variant="outline"
            className="w-full"
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
