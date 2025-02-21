
import { Message } from "@/components/question-support/types";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image/OptimizedImage";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  currentImageMessage: Message | null;
  onRateMessage: (messageId: string, rating: 'up' | 'down') => void;
}

export function MessageList({
  messages,
  isLoading,
  currentImageMessage,
  onRateMessage,
}: MessageListProps) {
  return (
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
                  onClick={() => onRateMessage(message.id, 'up')}
                  className={message.rating === 5 ? "text-green-500" : ""}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRateMessage(message.id, 'down')}
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
  );
}
