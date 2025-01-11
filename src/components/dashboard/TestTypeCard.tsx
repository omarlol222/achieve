import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

type TestTypeCardProps = {
  testType: {
    id: string;
    name: string;
    description: string | null;
  };
  onStart: () => void;
};

export const TestTypeCard = ({ testType, onStart }: TestTypeCardProps) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{testType.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-gray-500">
          {testType.description || `Practice and improve your ${testType.name} skills`}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={onStart} className="w-full">
          Start Test
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};