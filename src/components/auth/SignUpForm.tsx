import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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

      // First, check if the username is already taken
      const { data: existingUsers, error: checkError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", data.username)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingUsers) {
        setSignUpError("Username is already taken");
        return;
      }

      // Proceed with signup
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
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

      if (signUpError) throw signUpError;

      // The profile will be created automatically via the handle_new_user database trigger
      
      toast({
        title: "Success",
        description: "Please check your email to verify your account.",
      });

      // Redirect to signin page after successful signup
      navigate("/signin");

    } catch (error: any) {
      console.error("Signup error:", error);
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