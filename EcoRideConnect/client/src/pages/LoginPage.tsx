import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Mail } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { signInWithGoogle, setUser, firebaseUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  // Default role comes from environment so each app can set its own (rider/driver/admin)
  const defaultRole = (import.meta.env.VITE_DEFAULT_ROLE as "rider" | "driver" | "admin") || "rider";
  const selectedRole = defaultRole;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const SIMPLE_AUTH = import.meta.env.VITE_SIMPLE_AUTH === 'true';
      // Always perform client Google sign-in (opens popup)
      await signInWithGoogle();

      // Extract basic profile info for session + profile creation
      const displayName = firebaseUser?.displayName || "EcoRide User";
      const email = firebaseUser?.email || `${Date.now()}@example.com`;

      if (SIMPLE_AUTH) {
        // Create a server session (simple-auth) and bootstrap user profile
        await apiRequest('POST', '/api/auth/login', {
          email,
          name: displayName,
          role: selectedRole,
        });
        const res = await apiRequest('POST', '/api/auth/complete-profile', {
          name: displayName,
          phone: '',
          role: selectedRole,
        });
        const userData = await res.json();
        setUser(userData);
      } else {
        // In full mode, the API expects Authorization: Bearer <idToken>.
        // Our fetch helper is session-based; so for now we hit the same endpoints
        // relying on dev SIMPLE_AUTH. If switching to full mode later, update
        // queryClient/apiRequest to attach the ID token.
        const res = await apiRequest('POST', '/api/auth/complete-profile', {
          name: displayName,
          phone: '',
          role: selectedRole,
        });
        const userData = await res.json();
        setUser(userData);
      }

      toast({ title: "Signed in", description: `Welcome, ${displayName}!` });

      // Redirect based on default role
      if (selectedRole === 'admin') setLocation('/admin');
      else if (selectedRole === 'driver') setLocation('/driver');
      else setLocation('/rider');
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-eco-mint via-background to-eco-mint/50 dark:from-background dark:via-background dark:to-eco-dark-green/10 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary rounded-full">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground">EcoRide</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Join the movement towards cleaner, safer transportation
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-semibold text-center">Welcome</h2>
              <p className="text-muted-foreground text-center text-sm">
                Sign in to start your eco-friendly journey
              </p>
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleGoogleSignIn}
              disabled={loading}
              size="lg"
              data-testid="button-google-signin"
            >
              <SiGoogle className="h-5 w-5" />
              Continue with Google
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              You will be signed in as a default <span className="font-medium">{selectedRole}</span>.
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              disabled
              size="lg"
            >
              <Mail className="h-5 w-5" />
              Continue with Email (Coming Soon)
            </Button>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to EcoRide's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
