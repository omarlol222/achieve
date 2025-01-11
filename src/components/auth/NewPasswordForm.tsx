import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usePasswordReset } from "@/hooks/usePasswordReset";

type NewPasswordFormProps = {
  onSuccess: () => void;
};

export const NewPasswordForm = ({ onSuccess }: NewPasswordFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const { error, isLoading, resetPassword } = usePasswordReset(onSuccess);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(newPassword);
  };

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
};