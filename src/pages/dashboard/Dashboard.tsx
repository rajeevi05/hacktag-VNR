import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Globe, 
  HardDrive, 
  Mail, 
  MessageSquare, 
  TrendingUp, 
  Sparkles,
  Users,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const userName = user?.displayName || user?.email?.split("@")[0] || "User";

  const stats = [
    {
      title: "Sites Created",
      value: "12",
      change: "+3 this month",
      icon: Globe,
      color: "text-primary"
    },
    {
      title: "Storage Used", 
      value: "2.4 GB",
      change: "of 10 GB",
      icon: HardDrive,
      color: "text-warning"
    },
    {
      title: "Emails Sent",
      value: "1,284",
      change: "+127 this week",
      icon: Mail,
      color: "text-success"
    },
    {
      title: "Chatbot Sessions",
      value: "456",
      change: "+12% this month",
      icon: MessageSquare,
      color: "text-secondary"
    }
  ];

  const recentActivity = [
    {
      type: "website",
      title: "Created 'Sweet Dreams Bakery' website",
      time: "2 hours ago",
      icon: Globe
    },
    {
      type: "email",
      title: "Sent promotional email campaign",
      time: "5 hours ago", 
      icon: Mail
    },
    {
      type: "influencer",
      title: "Matched with @foodie_blogger",
      time: "1 day ago",
      icon: Users
    },
    {
      type: "analytics",
      title: "Monthly analytics report generated",
      time: "2 days ago",
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {loading ? (
              "Welcome back!"
            ) : (
              `Welcome back, ${userName}!`
            )}
          </h1>
        
        </div>
        
      </div>

      

      {/* Quick Actions - Full Width */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Get started with these popular features</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Button 
            variant="outline" 
            className="h-32 flex flex-col items-center justify-center space-y-4 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/dashboard/generate')}
          >
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-lg font-semibold">Generate Website</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-32 flex flex-col items-center justify-center space-y-4 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/dashboard/influencer')}
          >
            <Users className="w-8 h-8 text-purple-600" />
            <span className="text-lg font-semibold">Find Influencers</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-32 flex flex-col items-center justify-center space-y-4 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/dashboard/email')}
          >
            <Mail className="w-8 h-8 text-orange-600" />
            <span className="text-lg font-semibold">Email Campaign</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-32 flex flex-col items-center justify-center space-y-4 hover:bg-success/20 hover:border-success transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/dashboard/analytics')}
          >
            <TrendingUp className="w-8 h-8 text-success" />
            <span className="text-lg font-semibold">View Analytics</span>
          </Button>
        </CardContent>
      </Card>

      {/* Monthly Progress - Below Quick Actions */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
          <CardDescription>Your usage this month</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Websites Created</span>
              <span>3/5</span>
            </div>
            <Progress value={60} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Storage Used</span>
              <span>2.4/10 GB</span>
            </div>
            <Progress value={24} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Email Campaigns</span>
              <span>8/25</span>
            </div>
            <Progress value={32} className="h-3" />
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
