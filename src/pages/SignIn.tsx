import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const siteUrl = "https://achieve.lovable.app";

  useEffect(() => {
    const handlePasswordReset = () => {
      const type = searchParams.get('type');
      const token = searchParams.get('token');
      const redirectTo = searchParams.get('redirect_to');
      
      // If this is a recovery attempt, redirect to password reset
      if (type === 'recovery' && token) {
        navigate('/password-reset', { 
          state: { 
            token,
            type,
            redirectTo
          }
        });
        return true;
      }
      return false;
    };

    // First check if this is a password reset attempt
    const isPasswordReset = handlePasswordReset();
    
    // Only check session if not a password reset
    if (!isPasswordReset) {
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/gat");
        }
      };
      checkSession();
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        navigate("/gat");
      }
      if (event === "PASSWORD_RECOVERY") {
        navigate("/password-reset");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location, searchParams]);

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

        <div className="mt-4 text-center">
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
};

export default SignIn;