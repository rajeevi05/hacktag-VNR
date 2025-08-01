import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { Bell, User, Settings, LogOut, Sparkles } from "lucide-react";
import { signOut } from "@/lib/supabase";

interface NavbarProps {
  variant?: "landing" | "dashboard";
}

export function Navbar({ variant = "landing" }: NavbarProps) {
  const [notifications] = useState(3);
  const navigate = useNavigate();

  // Get user data from localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Clear user session
      localStorage.removeItem('user');

      // Redirect to home page
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local session and redirect
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "JD";
    if (user.name) {
      return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "John Doe";
    return user.name || user.email?.split('@')[0] || "User";
  };

  // Get user email
  const getUserEmail = () => {
    if (!user) return "john@example.com";
    return user.email || "user@example.com";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="text-xl font-bold text-black">
            Boostly
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center space-x-4">
          {variant === "landing" ? (
            // Landing page navigation
            <>
              <div className="hidden md:flex items-center space-x-6">
                <Link 
                  to="#features" 
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  Features
                </Link>
                <Link 
                  to="#templates" 
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </div>
              <ThemeToggle />
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-purple-500 to-teal-500 hover:opacity-90">
                <Link to="/signup">Start Free</Link>
              </Button>
            </>
          ) : (
            // Dashboard navigation
            <>
              {/* Notifications */}
              <NotificationCenter />

              <ThemeToggle />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/user.png" alt="User" />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {getUserEmail()}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}