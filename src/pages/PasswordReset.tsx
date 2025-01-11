import { useState } from "react";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { useNavigate } from "react-router-dom";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const navigate = useNavigate();

  const handleResetSuccess = (resetEmail: string) => {
    setEmail(resetEmail);
    setShowOTP(true);
  };

  const handleBack = () => {
    setShowOTP(false);
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