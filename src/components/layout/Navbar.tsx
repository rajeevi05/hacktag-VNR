import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { Sparkles, Menu, X, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthService } from "@/lib/authService";

export function Navbar(_props?: { variant?: "landing" | "dashboard" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await AuthService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('onboardingData');
    navigate('/', { replace: true });
  };

  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-teal-500 bg-clip-text text-transparent">
              Boostly
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link to="/#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/#about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Button asChild size="sm" className="bg-gradient-to-r from-purple-500 to-teal-500 hover:opacity-90">
              <Link to="/signup">Start Free</Link>
            </Button>
            <ThemeToggle />
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container py-4 space-y-4">
              <Link to="/#features" className="block text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link to="/#pricing" className="block text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link to="/#about" className="block text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/login" className="block text-sm font-medium hover:text-primary transition-colors">
                Sign In
              </Link>
              <Button asChild size="sm" className="w-full bg-gradient-to-r from-purple-500 to-teal-500 hover:opacity-90">
                <Link to="/signup">Start Free</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-teal-500 bg-clip-text text-transparent">
            Boostly
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
