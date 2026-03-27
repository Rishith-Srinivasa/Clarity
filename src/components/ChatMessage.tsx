import React from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "../types";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === "model";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mb-6",
        isModel ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] px-6 py-4 rounded-3xl shadow-sm",
          isModel
            ? "bg-coach-card text-coach-card-text rounded-tl-none border border-black/5"
            : "bg-coach-olive text-white rounded-tr-none"
        )}
      >
        {isModel && (
          <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2 font-medium">
            Clarity Coach
          </div>
        )}
        <div className={cn("markdown-body", isModel ? "font-serif" : "font-sans")}>
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
        <div className="text-[10px] opacity-40 mt-2 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </motion.div>
  );
};
