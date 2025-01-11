import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useOTPVerification = (email: string, onBack: () => void) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleInvalidCode = () => {
    setError("Invalid verification code. Please check the code or request a new one.");
    setTimeout(onBack, 3000);
  };

  const verifyOTP = async (otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      });

      if (verifyError) {
        if (verifyError.message.includes('expired') || verifyError.message.includes('invalid')) {
          handleInvalidCode();
          return;
        }
        throw verifyError;
      }

      if (!data?.user) {
        throw new Error("Verification failed. Please try again.");
      }

      setIsVerified(true);
      toast({
        title: "Success",
        description: "Code verified successfully. Please enter your new password.",
      });
    } catch (err: any) {
      if (err.message?.includes('body stream already read')) {
        handleInvalidCode();
        return;
      }
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { error, isLoading, isVerified, verifyOTP, setError };
};