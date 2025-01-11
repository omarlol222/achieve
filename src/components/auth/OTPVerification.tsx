import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useOTPVerification } from "@/hooks/useOTPVerification";
import { NewPasswordForm } from "./NewPasswordForm";

type OTPVerificationProps = {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
};

export const OTPVerification = ({ email, onBack, onSuccess }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const { error, isLoading, isVerified, verifyOTP } = useOTPVerification(email, onBack);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOTP(otp);
  };

  if (isVerified) {
    return <NewPasswordForm onSuccess={onSuccess} />;
  }

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
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter verification code"
            required
            maxLength={6}
            className="mt-1"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to email input
          </button>
        </div>
      </form>
    </div>
  );
};