import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { generateAIPrompt, type AIPromptData } from "@/lib/ai-prompt";

interface AIPromptButtonProps {
  originalText: string;
  translatedText: string;
  rating?: number;
  errors?: {
    articles: boolean;
    tenses: boolean;
    prepositions: boolean;
    vocabulary: boolean;
    word_order: boolean;
    punctuation: boolean;
  };
  notes?: string;
  className?: string;
}

export function AIPromptButton({
  originalText,
  translatedText,
  rating,
  errors,
  notes,
  className,
}: AIPromptButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    const promptData: AIPromptData = {
      originalText,
      translatedText,
      rating,
      errors,
      notes,
    };

    const prompt = generateAIPrompt(promptData);

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = prompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleCopyPrompt}
      className={className}
      disabled={!translatedText.trim()}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Скопировано!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Скопировать промпт для ИИ
        </>
      )}
    </Button>
  );
}
