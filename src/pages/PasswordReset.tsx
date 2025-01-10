import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PasswordReset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const siteUrl = "https://achieve.lovable.app";

  useEffect(() => {
    const state = location.state as { recovery?: boolean } | null;
    
    if (!state?.recovery) {
      navigate('/signin');
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Stay on the page
      } else if (event === "SIGNED_IN") {
        navigate("/gat");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

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