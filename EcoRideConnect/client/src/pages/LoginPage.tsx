import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RecaptchaVerifier } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Mail } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { appName, appSubtitle } from "@/lib/brand";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { signInWithGoogle, setUser, startPhoneLogin, confirmPhoneLogin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const appRoleEnv = (import.meta.env.VITE_APP_ROLE as "rider" | "driver" | "admin" | undefined) || undefined;
  const fixedRole = appRoleEnv && ["rider","driver","admin"].includes(appRoleEnv) ? (appRoleEnv as any) : undefined;
  const [selectedRole, setSelectedRole] = useState<"rider" | "driver" | "admin">(fixedRole || "rider");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneMode, setPhoneMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const SIMPLE_AUTH = import.meta.env.VITE_SIMPLE_AUTH === 'true';
      if (SIMPLE_AUTH) {
        // In simple auth, we immediately show the role/profile form
        setShowRoleSelection(true);
      } else {
        await signInWithGoogle();
        // After Firebase sign-in, check if user already exists in backend
        try {
          const verifyRes = await apiRequest('POST', '/api/auth/verify');
          const existingUser = await verifyRes.json();
          if (existingUser && existingUser.id) {
            // User exists, redirect to their dashboard
            setUser(existingUser);
            const role = existingUser.role || 'rider';
            if (role === 'admin') setLocation('/admin');
            else if (role === 'driver') setLocation('/driver');
            else setLocation('/rider');
            return;
          }
        } catch (e) {
          // User doesn't exist or verify failed; proceed to profile form
          console.log('User not found, showing profile form');
        }
        // New user: show profile completion form
        setShowRoleSelection(true);
      }
    } catch (error: any) {
      const message = error?.message || "Could not sign in with Google. Please try again.";
      toast({
        title: "Sign In Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneStart = async () => {
    const SIMPLE_AUTH = import.meta.env.VITE_SIMPLE_AUTH === 'true';
    if (SIMPLE_AUTH) {
      toast({ title: "Phone login requires Firebase", description: "Set VITE_SIMPLE_AUTH=false in .env to enable Firebase auth.", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      // Ensure a recaptcha container exists
      const containerId = 'recaptcha-container';
      let verifier = (window as any).recaptchaVerifier as any;
      if (!verifier) {
        verifier = new RecaptchaVerifier(firebaseAuth as any, containerId, { size: 'invisible' } as any);
        (window as any).recaptchaVerifier = verifier;
      }
      const conf = await startPhoneLogin(phone, verifier);
      setConfirmation(conf);
      toast({ title: "Code sent", description: "Enter the OTP you received." });
    } catch (e) {
      toast({ title: "Failed to start phone login", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneConfirm = async () => {
    if (!confirmation) return;
    try {
      setLoading(true);
      await confirmPhoneLogin(confirmation, otp);
      setShowRoleSelection(true);
    } catch (e) {
      toast({ title: "Invalid code", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and phone number.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const SIMPLE_AUTH = import.meta.env.VITE_SIMPLE_AUTH === 'true';
      let userData: any;
      if (SIMPLE_AUTH) {
        // Prefer header-bypass in SIMPLE_AUTH/local to avoid 3rd-party cookie issues
        const role = fixedRole || selectedRole;
        const email = `${name.split(' ').join('.').toLowerCase()}@example.com`;
        // Attempt to set a dev session (best-effort)
        try {
          await apiRequest('POST', '/api/auth/login', { email, name, role });
        } catch {}
        // Complete profile with header identity so it works even if cookies are blocked
        const res = await apiRequest(
          "POST",
          "/api/auth/complete-profile",
          { name, phone, role },
          { 'x-simple-email': email, 'x-simple-role': role }
        );
        userData = await res.json();
      } else {
        // In DB mode (SIMPLE_AUTH=false) during local dev we still allow header-bypass
        // when ALLOW_SIMPLE_AUTH_ROUTES=true on the server. Always send identity headers
        // if an app role is fixed to avoid cross-site cookie hiccups.
        const role = fixedRole || selectedRole;
        const email = `${name.split(' ').join('.').toLowerCase()}@example.com`;
        // Best-effort: try to establish a session, but don't fail hard if it doesn't stick
        try {
          await apiRequest('POST', '/api/auth/login', { email, name, role });
        } catch {}
        const response = await apiRequest(
          "POST",
          "/api/auth/complete-profile",
          { name, phone, role },
          fixedRole ? { 'x-simple-email': email, 'x-simple-role': role } : undefined
        );
        userData = await response.json();
      }
      setUser(userData);
      
      toast({
        title: `Welcome to ${appName()}!`,
        description: "Your account has been created successfully.",
      });

      const finalRole = fixedRole || selectedRole;
      if (finalRole === "admin") {
        setLocation("/admin");
      } else if (finalRole === "driver") {
        setLocation("/driver");
      } else {
        setLocation("/rider");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to complete profile. Please try again.";
      toast({
        title: "Error",
        description: message,
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
            <div className="flex flex-col items-start">
              <h1 className="font-serif text-4xl font-bold text-foreground leading-tight">{appName()}</h1>
              {appSubtitle() && (
                <span className="text-xs tracking-widest uppercase text-muted-foreground">{appSubtitle()}</span>
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Join the movement towards cleaner, safer transportation
          </p>
        </div>

        <Card className="p-8">
          {!showRoleSelection ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-semibold text-center">Welcome</h2>
                <p className="text-muted-foreground text-center text-sm">
                  Sign in to start your journey with {appName()}
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
                Continue
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <div className="space-y-3">
                {!phoneMode ? (
                  <Button variant="outline" className="w-full" size="lg" onClick={() => setPhoneMode(true)}>
                    Use Phone Number
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="+91 XXXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handlePhoneStart} disabled={loading || !phone}>Send Code</Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otp">OTP</Label>
                      <Input id="otp" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    </div>
                    <Button className="w-full" onClick={handlePhoneConfirm} disabled={loading || !otp}>Verify</Button>
                    <div id="recaptcha-container" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-semibold text-center">Complete Your Profile</h2>
                <p className="text-muted-foreground text-center text-sm">
                  Tell us a bit about yourself
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+91 XXXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                </div>

                {!fixedRole && (
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rider" id="rider" data-testid="radio-rider" />
                        <Label htmlFor="rider" className="font-normal cursor-pointer">
                          Rider - Book eco-friendly rides
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="driver" id="driver" data-testid="radio-driver" />
                        <Label htmlFor="driver" className="font-normal cursor-pointer">
                          Driver - Provide green transportation
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="admin" data-testid="radio-admin" />
                        <Label htmlFor="admin" className="font-normal cursor-pointer">
                          Admin - Manage the platform
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleCompleteProfile}
                disabled={loading}
                size="lg"
                data-testid="button-complete-profile"
              >
                {loading ? "Setting up..." : "Get Started"}
              </Button>
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to {appName()}'s Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
