import { useState, useCallback, memo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usePasswordReset } from "@/hooks/usePasswordReset";

type NewPasswordFormProps = {
  onSuccess: () => void;
};

const NewPasswordFormComponent = ({ onSuccess }: NewPasswordFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const { error, isLoading, resetPassword } = usePasswordReset(onSuccess);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(newPassword);
  }, [newPassword, resetPassword]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  }, []);

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

      <form onSubmit={handleSubmit} className="space-y-4">
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
            onChange={handlePasswordChange}
            placeholder="Enter your new password"
            required
            className="mt-1"
            minLength={6}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
};

export const NewPasswordForm = memo(NewPasswordFormComponent);