import { memo, useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/components/ui/use-toast";

type PasswordResetFormProps = {
  onResetSuccess: (email: string) => void;
};

const PasswordResetFormComponent = ({ onResetSuccess }: PasswordResetFormProps) => {
  const { error, isLoading, resetPassword } = useAuthStore();
  const [resetEmail, setResetEmail] = useState("");

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(resetEmail);
      onResetSuccess(resetEmail);
      toast({
        title: "Check your email",
        description: "We've sent you a code to verify your identity.",
      });
    } catch (err) {
      // Error is handled by the store
    }
  }, [resetEmail, resetPassword, onResetSuccess]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email to receive a verification code
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div>
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="mt-1"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Code"}
        </Button>
      </form>
    </div>
  );
};

export const PasswordResetForm = memo(PasswordResetFormComponent);