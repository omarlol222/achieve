
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";

type SignInFormProps = {
  siteUrl: string;
};

export const SignInForm = ({ siteUrl }: SignInFormProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
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
        redirectTo={`${window.location.origin}/dashboard`}
        showLinks={false}
        onlyThirdPartyProviders={false}
      />

      <div className="mt-4 text-center space-y-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-black hover:text-gray-800">
            Sign up
          </Link>
        </p>
        <p className="text-sm text-gray-600">
          <button
            onClick={() => navigate("/password-reset", { state: { recovery: true } })}
            className="font-medium text-black hover:text-gray-800"
          >
            Forgot password?
          </button>
        </p>
      </div>
    </div>
  );
};
