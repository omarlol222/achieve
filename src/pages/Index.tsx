import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Suspense } from "react";

const AuthComponent = () => {
  const { error, isLoading } = useAuthRedirect();

  if (isLoading) {
    return null;
  }

  return (
    <>
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
          className: {
            container: 'auth-container',
            label: 'auth-label',
            button: 'auth-button',
            input: 'auth-input',
          },
        }}
        theme="light"
        providers={[]}
        redirectTo={window.location.origin}
        options={{
          emailRedirectTo: window.location.origin,
          metadata: {
            username: undefined,
            full_name: undefined,
            phone: undefined,
          },
        }}
        localization={{
          variables: {
            sign_up: {
              email_label: "Email address",
              password_label: "Create a Password",
              email_input_placeholder: "Your email address",
              password_input_placeholder: "Your password",
              button_label: "Sign up",
              loading_button_label: "Signing up ...",
              social_provider_text: "Sign in with {{provider}}",
              link_text: "Don't have an account? Sign up",
              confirmation_text: "Check your email for the confirmation link",
            },
          },
        }}
        view="sign_up"
        showLinks={true}
      />
    </>
  );
};

const Index = () => {
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

        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          }
        >
          <AuthComponent />
        </Suspense>
      </div>
    </div>
  );
};

export default Index;