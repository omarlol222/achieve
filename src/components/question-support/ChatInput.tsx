
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Upload, Check } from "lucide-react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  hasUploadedImage: boolean;
  currentImageMessage: Message | null;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onImageUpload: (file: File) => void;
}

export function ChatInput({
  input,
  isLoading,
  hasUploadedImage,
  currentImageMessage,
  onInputChange,
  onSubmit,
  onImageUpload,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      onInputChange(input + '\n');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as any);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <div className="flex items-center gap-2">
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload(file);
            }}
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
  );
}
