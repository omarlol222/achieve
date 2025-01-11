import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SignInForm } from "@/components/auth/SignInForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: hasAccess, error: accessError } = await supabase
          .rpc('check_platform_access', {
            user_id_input: session.user.id,
            platform: 'gat'
          });

        if (accessError) {
          console.error("Error checking access:", accessError);
          return;
        }

        if (hasAccess) {
          navigate("/gat");
        } else {
          navigate("/shop");
        }
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        // Check for existing sessions
        const { data, error: sessionsError } = await supabase.rpc('get_concurrent_sessions', {
          user_id_input: session?.user.id
        });

        if (sessionsError) {
          console.error("Error checking sessions:", sessionsError);
          toast({
            title: "Error",
            description: "Could not verify session status",
            variant: "destructive",
          });
          return;
        }

        if (data && data > 1) {
          // Sign out if there's already an active session
          await supabase.auth.signOut();
          setError("Another session is already active. Please sign out from other devices first.");
          return;
        }

        // Check platform access
        const { data: hasAccess, error: accessError } = await supabase
          .rpc('check_platform_access', {
            user_id_input: session.user.id,
            platform: 'gat'
          });

        if (accessError) {
          console.error("Error checking access:", accessError);
          return;
        }

        if (hasAccess) {
          navigate("/gat");
        } else {
          navigate("/shop");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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

        <SignInForm siteUrl="https://achieve.lovable.app" />
      </div>
    </div>
  );
};

export default SignIn;