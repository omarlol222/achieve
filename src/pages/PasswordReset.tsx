import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PasswordReset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const siteUrl = "https://achieve.lovable.app";

  useEffect(() => {
    const checkRecoveryToken = () => {
      // Check URL parameters
      const type = searchParams.get('type');
      const token = searchParams.get('token');
      const redirectTo = searchParams.get('redirect_to');
      
      // Check location state (from SignIn component)
      const state = location.state as { token?: string; type?: string; redirectTo?: string } | null;
      
      // If no recovery token is present in either URL or state, redirect to signin
      if (!((type === 'recovery' && token) || (state?.type === 'recovery' && state?.token))) {
        navigate('/signin');
        return;
      }

      // If we have a token, set it in the session
      if (token || state?.token) {
        supabase.auth.setSession({
          access_token: token || state?.token || '',
          refresh_token: '',
        });
      }
    };

    checkRecoveryToken();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "USER_UPDATED") {
        setError(null);
        navigate("/signin");
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
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your new password
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Auth
          supabaseClient={supabase}
          view="update_password"
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
      </div>
    </div>
  );
};

export default PasswordReset;