import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, Building2, Target, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DbService } from "@/lib/dbService";
import { useAuth } from "@/hooks/use-auth";

interface OnboardingData {
  businessName: string;
  topOfferings: string[];
  businessType: string;
  userGoal: string;
  brandTone: 'friendly' | 'professional' | 'bold' | 'minimal';
}

export default function Onboarding() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessName: "",
    topOfferings: ["", "", ""],
    businessType: "",
    userGoal: "",
    brandTone: 'friendly'
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete onboarding.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      localStorage.setItem("user", JSON.stringify({
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email,
      }));
      localStorage.setItem("onboardingData", JSON.stringify(onboardingData));
      await DbService.saveOnboarding(user.uid, onboardingData);

      toast({
        title: "Onboarding complete!",
        description: "Welcome to your dashboard.",
      });
      window.location.replace("/dashboard");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Onboarding failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addOffering = () => {
    setOnboardingData(prev => ({
      ...prev,
      topOfferings: [...prev.topOfferings, ""]
    }));
  };

  const removeOffering = (index: number) => {
    setOnboardingData(prev => ({
      ...prev,
      topOfferings: prev.topOfferings.filter((_, i) => i !== index)
    }));
  };

  const updateOffering = (index: number, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      topOfferings: prev.topOfferings.map((offering, i) => 
        i === index ? value : offering
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-large border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>Tell us about your business to personalize your experience</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Business Basics */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Business Basics</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Enter your business name"
                    value={onboardingData.businessName}
                    onChange={(e) => setOnboardingData(prev => ({ ...prev, businessName: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={onboardingData.businessType} onValueChange={(value) => setOnboardingData(prev => ({ ...prev, businessType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Café & Restaurant">Café & Restaurant</SelectItem>
                      <SelectItem value="Retail Store">Retail Store</SelectItem>
                      <SelectItem value="Design Agency">Design Agency</SelectItem>
                      <SelectItem value="Tech Startup">Tech Startup</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Fitness & Wellness">Fitness & Wellness</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Beauty & Salon">Beauty & Salon</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Step 2: Services & Goals */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Services & Goals</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label>Top 3 Products or Services</Label>
                  <div className="space-y-2">
                    {onboardingData.topOfferings.map((offering, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          placeholder={`Service ${index + 1}`}
                          value={offering}
                          onChange={(e) => updateOffering(index, e.target.value)}
                        />
                        {onboardingData.topOfferings.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOffering(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOffering}
                      className="w-full"
                    >
                      Add Another Service
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="userGoal">Primary Goal</Label>
                  <Select value={onboardingData.userGoal} onValueChange={(value) => setOnboardingData(prev => ({ ...prev, userGoal: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="What's your main goal?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Create a website">Create a website</SelectItem>
                      <SelectItem value="Get more leads">Get more leads</SelectItem>
                      <SelectItem value="Automate support">Automate support</SelectItem>
                      <SelectItem value="Improve marketing">Improve marketing</SelectItem>
                      <SelectItem value="Increase sales">Increase sales</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Step 3: Brand Personality */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Brand Personality</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label>Brand Tone</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
                      { value: 'professional', label: 'Professional', description: 'Trustworthy and reliable' },
                      { value: 'bold', label: 'Bold', description: 'Confident and energetic' },
                      { value: 'minimal', label: 'Minimal', description: 'Clean and simple' }
                    ].map((tone) => (
                      <div
                        key={tone.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          onboardingData.brandTone === tone.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setOnboardingData(prev => ({ ...prev, brandTone: tone.value as OnboardingData['brandTone'] }))}
                      >
                        <div className="font-medium">{tone.label}</div>
                        <div className="text-sm text-gray-600">{tone.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-primary hover:opacity-90"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating Profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
