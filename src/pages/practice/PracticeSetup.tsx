import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

const PracticeSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string>("option1");

  // Check session and handle authentication
  const { data: session, error: sessionError } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

  useEffect(() => {
    if (sessionError) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please sign in to continue.",
      });
      navigate("/signin");
    }
  }, [sessionError, navigate, toast]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      navigate("/signin");
    }
  }, [session, navigate]);

  const handleStartPractice = () => {
    navigate(`/practice/${selectedOption}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Practice Setup</CardTitle>
          <CardDescription>Choose your practice mode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="space-y-4"
            >
              <div>
                <RadioGroupItem value="option1" id="option1" />
                <Label htmlFor="option1" className="ml-2">
                  Option 1
                </Label>
              </div>
              <div>
                <RadioGroupItem value="option2" id="option2" />
                <Label htmlFor="option2" className="ml-2">
                  Option 2
                </Label>
              </div>
              <div>
                <RadioGroupItem value="option3" id="option3" />
                <Label htmlFor="option3" className="ml-2">
                  Option 3
                </Label>
              </div>
            </RadioGroup>

            <Button onClick={handleStartPractice} className="w-full">
              Start Practice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeSetup;