import React, { useState, useRef, useEffect } from "react";
import { Send, ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-2 bg-white p-2 rounded-[32px] border border-black/10 shadow-lg focus-within:border-coach-olive/30 transition-colors"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Share your thoughts, goals, or a decision..."
        className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-coach-ink placeholder:text-coach-ink/30 max-h-[200px]"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className="p-3 bg-coach-olive text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
      >
        <ArrowUp size={20} />
      </button>
    </form>
  );
};
