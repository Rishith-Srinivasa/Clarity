import { useState, useRef, useEffect } from "react";
import { Message, Goal, ProgressDay, CalendarEvent, Mood } from "./types";
import { geminiService } from "./services/geminiService";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { Sidebar } from "./components/Sidebar";
import { Menu, X, Sparkles, Target, Brain, Palette } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Modal } from "./components/Modal";
import { getRandomQuote } from "./lib/quotes";
import { cn } from "./lib/utils";

export default function App() {
  // Persistence helpers
  const getStored = <T,>(key: string, fallback: T): T => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  };

  const [messages, setMessages] = useState<Message[]>(() => getStored("messages", []));
  const [goals, setGoals] = useState<Goal[]>(() => getStored("goals", []));
  const [progress, setProgress] = useState<ProgressDay[]>(() => getStored("progress", []));
  const [events, setEvents] = useState<CalendarEvent[]>(() => getStored("events", []));
  const [mood, setMood] = useState<Mood>(() => getStored("mood", "default"));
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("progress", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("mood", JSON.stringify(mood));
  }, [mood]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const quote = getRandomQuote();
      setMessages([
        {
          id: "welcome-" + Date.now(),
          role: "model",
          text: `Hey! I'm your Clarity Coach. 🚀\n\nHere's a thought for you today:\n\n> "${quote.text}" — ${quote.author}\n\nI'm not here to give you generic 'you can do it' advice. I'm here to help you cut through the noise and actually get things done. \n\nSo, let's skip the small talk. What's one thing you're currently avoiding, or a goal you've been 'meaning to start' for way too long?`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    const modelMessage: Message = {
      id: modelMessageId,
      role: "model",
      text: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, modelMessage]);

    try {
      let fullResponse = "";
      await geminiService.sendMessageStream(
        text, 
        (chunk) => {
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === modelMessageId ? { ...msg, text: fullResponse } : msg
            )
          );
        },
        (name, args) => {
          if (name === "addCalendarEvent") {
            const newEvent: CalendarEvent = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              title: args.title,
              date: args.date,
              time: args.time,
              description: args.description,
            };
            setEvents((prev) => [...prev, newEvent]);
            return { status: "success", message: "Event added to calendar" };
          } else if (name === "updateMood") {
            setMood(args.mood);
            return { status: "success", message: `Theme updated to ${args.mood}` };
          }
          return { status: "error", message: "Unknown function" };
        }
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMessageId
            ? { ...msg, text: "I'm sorry, I encountered an error. Please try again." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: newGoalTitle.trim(),
        description: "",
        status: "active",
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };
      setGoals((prev) => [newGoal, ...prev]);
      setNewGoalTitle("");
      setIsGoalModalOpen(false);
    }
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { 
              ...g, 
              status: g.status === "completed" ? "active" : "completed",
              lastUpdated: Date.now()
            }
          : g
      )
    );
  };

  const toggleProgress = (date: string) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.date === date);
      if (existing) {
        return prev.map((p) =>
          p.date === date ? { ...p, completed: !p.completed } : p
        );
      }
      return [...prev, { date, completed: true }];
    });
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const summarizeSession = async () => {
    if (messages.length < 3 || isLoading) return;
    
    const summaryPrompt = "Based on our conversation so far, please provide a brief summary of: 1. What I actually want (Clarity), 2. One specific action I can take in the next 24 hours, 3. A new perspective or question for me to think about. Keep it concise and encouraging.";
    
    await handleSendMessage(summaryPrompt);
  };

  const handleClearChat = () => {
    geminiService.resetChat();
    const quote = getRandomQuote();
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "model",
        text: `Hey! I'm your Clarity Coach. 🚀\n\nHere's a thought for you today:\n\n> "${quote.text}" — ${quote.author}\n\nI'm here to help you navigate your goals, make better decisions, and build the habits that lead to your best self. \n\nWhat's on your mind today? Is there a specific goal you're working toward, or perhaps a decision you're feeling stuck on?`,
        timestamp: Date.now(),
      },
    ]);
    // Also clear goals and progress for a fresh start if requested
    setGoals([]);
    setProgress([]);
    setEvents([]);
    setMood("default");
    setIsLoading(false);
    setIsClearModalOpen(false);
  };

  return (
    <div className={cn(
      "flex h-screen overflow-hidden transition-colors duration-700",
      mood === "angry" && "mood-angry",
      mood === "sad" && "mood-sad",
      mood === "happy" && "mood-happy",
      mood === "default" && "bg-coach-cream"
    )}>
      {/* Modals */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="New Focus Goal"
      >
        <div className="space-y-4">
          <p className="text-sm text-coach-ink/60">What is one meaningful goal you'd like to focus on?</p>
          <input
            autoFocus
            type="text"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
            placeholder="e.g. Read 20 pages daily"
            className="w-full px-4 py-3 bg-coach-cream rounded-2xl border border-black/5 focus:ring-2 focus:ring-coach-olive/20 outline-none"
          />
          <button
            onClick={handleAddGoal}
            disabled={!newGoalTitle.trim()}
            className="w-full py-3 bg-coach-olive text-white rounded-2xl font-bold disabled:opacity-30 transition-all"
          >
            Add Goal
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear Conversation"
      >
        <div className="space-y-4">
          <p className="text-sm text-coach-ink/60">Are you sure you want to clear your conversation history? This cannot be undone.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsClearModalOpen(false)}
              className="flex-1 py-3 bg-coach-cream text-coach-ink rounded-2xl font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleClearChat}
              className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </Modal>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-80 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          goals={goals}
          progress={progress}
          events={events}
          onAddGoal={() => setIsGoalModalOpen(true)}
          onToggleGoal={toggleGoal}
          onDeleteGoal={deleteGoal}
          onDeleteEvent={deleteEvent}
          onToggleProgress={toggleProgress}
          onClearChat={() => setIsClearModalOpen(true)}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/50 backdrop-blur-sm border-b border-black/5 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden hover:bg-black/5 rounded-full transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-coach-olive rounded-lg flex items-center justify-center text-white shadow-sm">
                <Brain size={18} />
              </div>
              <h1 className="text-xl font-serif font-bold tracking-tight">Clarity Coach</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-coach-olive"
                title="Change Theme"
              >
                <Palette size={20} />
              </button>
              <AnimatePresence>
                {isThemeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-black/5 p-2 z-50"
                  >
                    {[
                      { id: "default", label: "Default", color: "bg-coach-olive" },
                      { id: "angry", label: "Angry", color: "bg-red-600" },
                      { id: "sad", label: "Sad", color: "bg-violet-600" },
                      { id: "happy", label: "Happy", color: "bg-amber-400" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setMood(t.id as Mood);
                          setIsThemeMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-black/5 rounded-xl transition-colors text-left"
                      >
                        <div className={cn("w-4 h-4 rounded-full", t.color)} />
                        <span className="text-sm font-medium">{t.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={summarizeSession}
              disabled={messages.length < 3 || isLoading}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-coach-olive/10 text-coach-olive rounded-full text-xs font-semibold hover:bg-coach-olive/20 disabled:opacity-30 transition-all"
            >
              <Sparkles size={14} />
              Summarize Session
            </button>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-black/5 shadow-sm">
              <Sparkles size={14} className="text-coach-olive" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">AI Powered</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-2">
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start mb-6">
                <div className="bg-white px-6 py-4 rounded-3xl rounded-tl-none border border-black/5 shadow-sm">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-2 h-2 bg-coach-olive rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      className="w-2 h-2 bg-coach-olive rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      className="w-2 h-2 bg-coach-olive rounded-full"
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-coach-cream via-coach-cream to-transparent">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            <p className="text-center text-[10px] mt-4 opacity-30 uppercase tracking-widest font-medium">
              Your journey to clarity starts with a single honest thought.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
