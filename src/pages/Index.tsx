import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Check if user has a profile and is an admin
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profile?.role === "admin") {
            navigate("/admin");
          } else {
            setError("Access denied. Admin privileges required.");
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
        setError("An error occurred while checking your session.");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Check if user is admin
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profile?.role === "admin") {
            navigate("/admin");
          } else {
            setError("Access denied. Admin privileges required.");
          }
        }

        if (event === "SIGNED_OUT") {
          setError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          return 'Invalid email or password. Please check your credentials and try again.';
        case 422:
          return 'Invalid login credentials. Please check your email and password.';
        case 401:
          return 'Please verify your email address before signing in.';
        case 404:
          return 'No user found with these credentials.';
        default:
          return error.message;
      }
    }
    return error.message;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
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
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0EA5E9',
                  brandAccent: '#0284C7',
                },
              },
            },
          }}
          theme="light"
          providers={[]}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default Index;