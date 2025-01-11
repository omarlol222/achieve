import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { SignInForm } from "@/components/auth/SignInForm";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isResetFlow, setIsResetFlow] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const siteUrl = "https://achieve.lovable.app";

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/gat");
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        navigate("/gat");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        {!isResetFlow ? (
          <>
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

            <SignInForm 
              siteUrl={siteUrl}
              onResetSuccess={() => {
                setIsResetFlow(true);
                setResetEmail(resetEmail);
              }}
            />
          </>
        ) : (
          <OTPVerification
            email={resetEmail}
            onBack={() => setIsResetFlow(false)}
            onSuccess={() => navigate("/gat")}
          />
        )}
      </div>
    </div>
  );
};

export default SignIn;