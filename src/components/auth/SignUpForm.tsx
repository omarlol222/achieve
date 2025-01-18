import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SignUpFormFields } from "./signup/SignUpFormFields";
import { signUpSchema, type SignUpForm } from "./signup/types";
import { useToast } from "@/hooks/use-toast";

export function SignUpForm() {
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      fullName: "",
      phone: "",
    },
  });

  const onSubmit = async (data: SignUpForm) => {
    try {
      setIsSubmitting(true);
      setSignUpError(null);

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.fullName,
            phone: data.phone || null,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Please check your email to verify your account.",
      });

    } catch (error: any) {
      setSignUpError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {signUpError && (
            <Alert variant="destructive">
              <AlertDescription>{signUpError}</AlertDescription>
            </Alert>
          )}

          <SignUpFormFields form={form} />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}