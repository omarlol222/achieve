import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type PasswordResetFormProps = {
  onResetSuccess: () => void;
};

export const PasswordResetForm = ({ onResetSuccess }: PasswordResetFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOtp({
        email: resetEmail,
      });
      
      if (error) throw error;
      
      onResetSuccess();
      toast({
        title: "Check your email",
        description: "We've sent you a code to verify your identity.",
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div>
        <Label htmlFor="reset-email">Email for password reset</Label>
        <Input
          id="reset-email"
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>
      <Button type="submit" variant="outline" className="w-full">
        Send Reset Code
      </Button>
    </form>
  );
};