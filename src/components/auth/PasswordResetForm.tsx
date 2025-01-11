import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type PasswordResetFormProps = {
  onResetSuccess: (email: string) => void;
};

export const PasswordResetForm = ({ onResetSuccess }: PasswordResetFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(45);

  const startCooldownTimer = () => {
    setCooldownActive(true);
    setCooldownSeconds(45);
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCooldownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownActive) {
      setError(`Please wait ${cooldownSeconds} seconds before requesting another reset.`);
      return;
    }

    setIsLoading(true);
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/password-reset'
      });
      
      if (error) {
        if (error.message.includes('over_email_send_rate_limit')) {
          startCooldownTimer();
          throw new Error(`Please wait ${cooldownSeconds} seconds before requesting another reset.`);
        }
        throw error;
      }
      
      onResetSuccess(resetEmail);
      toast({
        title: "Check your email",
        description: "We've sent you a code to verify your identity.",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          />
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || cooldownActive}
        >
          {isLoading ? "Sending..." : cooldownActive 
            ? `Wait ${cooldownSeconds}s` 
            : "Send Reset Code"}
        </Button>
      </form>
    </div>
  );
};