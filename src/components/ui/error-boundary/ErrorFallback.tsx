import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{error.message}</p>
        <Button 
          variant="outline" 
          onClick={resetErrorBoundary}
          className="mt-2"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}