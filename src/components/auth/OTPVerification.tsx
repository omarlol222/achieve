import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  const [newPassword, setNewPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      setError(null);
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      });
      
      if (verifyError) throw verifyError;
      if (!data.session) throw new Error('No session created');

      setIsVerified(true);
      toast({
        title: "Success",
        description: "Code verified successfully. Please enter your new password.",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      setError(null);
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              className="mt-1"
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    );
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
          <Label htmlFor="otp">Verification Code</Label>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            render={({ slots }) => (
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, i) => (
                  <InputOTPSlot key={i} {...slots[i]} index={i} />
                ))}
              </InputOTPGroup>
            )}
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