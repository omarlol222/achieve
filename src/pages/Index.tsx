import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { SignUpForm } from "@/components/auth/SignUpForm";

const Index = () => {
  const { error: redirectError, isLoading } = useAuthRedirect();

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please fill in your details to sign up
          </p>
        </div>

        <SignUpForm />
      </div>
    </div>
  );
};

export default Index;