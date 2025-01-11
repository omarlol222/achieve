import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { supabase } from "@/integrations/supabase/client";

const PasswordReset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);

  useEffect(() => {
    const state = location.state as { recovery?: boolean } | null;
    
    if (!state?.recovery) {
      navigate('/signin');
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        navigate("/gat");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  const handleResetSuccess = (resetEmail: string) => {
    setEmail(resetEmail);
    setShowOTP(true);
  };

  const handleBack = () => {
    navigate("/signin");
  };

  const handleSuccess = () => {
    navigate("/signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        {showOTP ? (
          <OTPVerification
            email={email}
            onBack={handleBack}
            onSuccess={handleSuccess}
          />
        ) : (
          <PasswordResetForm onResetSuccess={handleResetSuccess} />
        )}
      </div>
    </div>
  );
};

export default PasswordReset;