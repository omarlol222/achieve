
import { useEffect, useRef, useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Send, Upload, Search, ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  rating?: number;
  marked_as_understood?: boolean;
};

export default function QuestionSupport() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionId, setQuestionId] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // TODO: Implement AI response logic here
      // For now, just add a mock response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "I'm here to help! (This is a placeholder response. AI integration coming soon)",
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleQuestionSearch = async () => {
    if (!questionId.trim()) {
      toast({
        description: "Please enter a question ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (error) throw error;

      if (data) {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Question found:\n${data.question_text}\n\nHow can I help you understand this question better?`
        }]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find question. Please check the ID and try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = () => {
    toast({
      description: "Image upload feature coming soon!",
    });
  };

  const handleRateMessage = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, rating: rating === 'up' ? 5 : 1 };
      }
      return msg;
    }));
    toast({
      description: rating === 'up' ? "Thanks for the positive feedback!" : "Thanks for the feedback. We'll try to improve.",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[#1B2B2B]">
            Question Support
          </h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Find Question
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Find a Question</SheetTitle>
                <SheetDescription>
                  Enter a question ID or upload an image of your question.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="question-id">Question ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="question-id"
                      value={questionId}
                      onChange={(e) => setQuestionId(e.target.value)}
                      placeholder="Enter question ID..."
                    />
                    <Button onClick={handleQuestionSearch}>Search</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Upload Image</Label>
                  <Button onClick={handleImageUpload} variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Question Image
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Card className="p-4">
          <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRateMessage(message.id, 'up')}
                          className={message.rating === 5 ? "text-green-500" : ""}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRateMessage(message.id, 'down')}
                          className={message.rating === 1 ? "text-red-500" : ""}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                    <p>AI is thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
