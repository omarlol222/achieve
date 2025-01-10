import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isResetFlow, setIsResetFlow] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const siteUrl = "https://achieve.lovable.app";

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/gat");
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        navigate("/gat");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${siteUrl}/password-reset`,
      });
      
      if (error) throw error;
      
      setIsResetFlow(true);
      toast({
        title: "Check your email",
        description: "We've sent you a code to verify your identity.",
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const { error } = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: otp,
        type: 'recovery'
      });
      
      if (error) throw error;

      navigate('/password-reset', { 
        state: { 
          recovery: true,
          email: resetEmail
        },
        replace: true
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isResetFlow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Enter verification code
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a code to {resetEmail}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Verify Code
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsResetFlow(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back to sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!isResetFlow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <img
              src="/lovable-uploads/9b9962d6-d485-4e43-88c7-9325eb10bd74.png"
              alt="Achieve"
              className="h-12 mx-auto mb-6"
            />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to your account
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000000',
                    brandAccent: '#333333',
                  },
                },
              },
            }}
            theme="light"
            providers={[]}
            redirectTo={siteUrl}
          />

          <div className="mt-4 text-center space-y-4">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="reset-email">Email for password reset</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <Button type="submit" variant="outline" className="w-full">
                Reset Password
              </Button>
            </form>

            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-black hover:text-gray-800">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default SignIn;