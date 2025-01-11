import { useState, useCallback, memo } from "react";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const PasswordResetComponent = () => {
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const navigate = useNavigate();

  const handleResetSuccess = useCallback((resetEmail: string) => {
    setEmail(resetEmail);
    setShowOTP(true);
  }, []);

  const handleBack = useCallback(() => {
    setShowOTP(false);
  }, []);

  const handleSuccess = useCallback(() => {
    navigate("/signin");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <ErrorBoundary>
          {showOTP ? (
            <OTPVerification
              email={email}
              onBack={handleBack}
              onSuccess={handleSuccess}
            />
          ) : (
            <PasswordResetForm onResetSuccess={handleResetSuccess} />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default memo(PasswordResetComponent);