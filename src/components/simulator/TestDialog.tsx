import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type TestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TestDialog({ open, onOpenChange }: TestDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const createSession = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("test_sessions")
        .insert([{ user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (session) => {
      onOpenChange(false);
      navigate("/gat/simulator/test", { state: { sessionId: session.id } });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error starting test",
        description: error.message,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Card className="max-w-2xl w-full p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Brain className="h-16 w-16 text-[#1B2B2B]" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Ready to Start Your Test?
              </h1>
              <p className="text-gray-600 max-w-md mx-auto">
                You will go through several modules. Each module has its own time limit
                and set of questions. Make sure you're in a quiet environment before
                starting.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">Important Notes:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>You cannot pause the test once started</li>
                  <li>Each module has its own timer</li>
                  <li>You can flag questions for review</li>
                  <li>You can review your answers before submitting each module</li>
                </ul>
              </div>

              <Button 
                onClick={() => createSession.mutate()}
                className="w-full bg-[#1B2B2B] hover:bg-[#2C3C3C] text-white"
              >
                Start Test
              </Button>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}