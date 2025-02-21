import { useEffect, useRef, useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuestionSearch } from "@/components/question-support/QuestionSearch";
import { MessageList } from "@/components/question-support/MessageList";
import { ChatInput } from "@/components/question-support/ChatInput";
import { Message } from "@/components/question-support/types";

export default function QuestionSupport() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionContext, setQuestionContext] = useState("");
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [currentImageMessage, setCurrentImageMessage] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    let userMessageContent = input.trim() || "Could you please analyze this image and help me understand the question shown?";
    
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
      const messageHistory = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content,
        imageBase64: msg.id === userMessage.id ? msg.imageBase64 : undefined
      }));

      const { data, error } = await supabase.functions.invoke('question-support', {
        body: {
          messages: messageHistory,
          questionContext,
        },
      });

      if (error) throw error;

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

  const handleImageUpload = async (file: File) => {
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

  const handleQuestionFound = (questionText: string) => {
    setQuestionContext(questionText);
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `I found the question you're looking for. Here it is:\n\n${questionText}\n\nHow can I help you understand this question better?`
    }]);
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

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[#1B2B2B]">
            Question Support
          </h1>
          <QuestionSearch onQuestionFound={handleQuestionFound} />
        </div>

        <Card className="p-4">
          <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
            <MessageList
              messages={messages}
              isLoading={isLoading}
              currentImageMessage={currentImageMessage}
              onRateMessage={handleRateMessage}
            />
          </ScrollArea>

          <ChatInput
            input={input}
            isLoading={isLoading}
            hasUploadedImage={hasUploadedImage}
            currentImageMessage={currentImageMessage}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onImageUpload={handleImageUpload}
          />
        </Card>
      </div>
    </div>
  );
}
