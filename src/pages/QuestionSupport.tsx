
import { useEffect, useRef, useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Send, Upload, Search, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OptimizedImage } from "@/components/ui/optimized-image/OptimizedImage";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  rating?: number;
  marked_as_understood?: boolean;
  image?: string;
  imageBase64?: string;
};

export default function QuestionSupport() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionId, setQuestionId] = useState("");
  const [questionContext, setQuestionContext] = useState("");
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [currentImageMessage, setCurrentImageMessage] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const convertImageToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !currentImageMessage) return;

    let userMessageContent = input.trim() || "Please help me understand this question";
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessageContent,
      image: currentImageMessage?.image,
      imageBase64: currentImageMessage?.imageBase64,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setCurrentImageMessage(null);
    setHasUploadedImage(false);
    setIsLoading(true);

    try {
      console.log('Sending message to AI:', userMessage);

      const messageHistory = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content,
        image: msg.imageBase64 ? {
          data: msg.imageBase64,
          mimeType: 'image/jpeg'
        } : undefined
      }));

      const { data, error } = await supabase.functions.invoke('question-support', {
        body: {
          messages: messageHistory,
          questionContext,
        },
      });

      if (error) {
        throw error;
      }

      console.log('AI Response:', data);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.choices[0].message.content,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Data = await convertImageToBase64(file);
      const imageUrl = URL.createObjectURL(file);

      const imageMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: '',
        image: imageUrl,
        imageBase64: base64Data,
      };

      setCurrentImageMessage(imageMessage);
      setHasUploadedImage(true);
      
      toast({
        description: "Image uploaded successfully! Click send to get an explanation.",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
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
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const questionText = `Question: ${data.question_text}\n\nChoices:\n1. ${data.choice1}\n2. ${data.choice2}\n3. ${data.choice3}\n4. ${data.choice4}\n\nCorrect Answer: ${data.correct_answer}`;
        setQuestionContext(questionText);
        
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `I found the question you're looking for. Here it is:\n\n${questionText}\n\nHow can I help you understand this question better?`
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

  const handleRateMessage = async (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, rating: rating === 'up' ? 5 : 1 };
      }
      return msg;
    }));

    try {
      const { error } = await supabase
        .from('ai_chat_messages')
        .update({ rating: rating === 'up' ? 5 : 1 })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        description: rating === 'up' ? "Thanks for the positive feedback!" : "Thanks for the feedback. We'll try to improve.",
      });
    } catch (error) {
      console.error('Error storing rating:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setInput(prev => prev + '\n');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
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
                  Enter a question ID to find it.
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
                    {message.image && (
                      <div className="mb-2">
                        <OptimizedImage 
                          src={message.image} 
                          alt="Question" 
                          className="rounded-lg max-w-full h-auto"
                        />
                      </div>
                    )}
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
              {currentImageMessage && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg p-4 bg-primary text-primary-foreground">
                    <div className="mb-2">
                      <OptimizedImage 
                        src={currentImageMessage.image!} 
                        alt="Question" 
                        className="rounded-lg max-w-full h-auto"
                      />
                    </div>
                    <p className="text-sm text-primary-foreground/80">Click send to get an explanation</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentImageMessage ? "Add any specific questions about the image (optional)" : "Type your question... (Shift+Enter for new line)"}
                disabled={isLoading}
                className="min-h-[60px]"
                rows={1}
              />
              <div className="flex gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  size="icon"
                  className="h-10 w-10 shrink-0"
                >
                  {hasUploadedImage ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || (!input.trim() && !currentImageMessage)}
                  size="icon"
                  className="h-10 w-10 shrink-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
