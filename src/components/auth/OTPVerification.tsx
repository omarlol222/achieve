import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type OTPVerificationProps = {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
};

export const OTPVerification = ({ email, onBack, onSuccess }: OTPVerificationProps) => {
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      
      if (error) throw error;

      if (data.session) {
        onSuccess();
        toast({
          title: "Success",
          description: "You have been signed in successfully.",
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          Enter verification code
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a code to {email}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={6}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, idx) => (
                  <InputOTPSlot key={idx} {...slot} index={idx} />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Verify Code
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to sign in
          </button>
        </div>
      </form>
    </div>
  );
};