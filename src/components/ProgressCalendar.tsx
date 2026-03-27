import React from "react";
import { ProgressDay } from "../types";
import { cn } from "../lib/utils";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";

interface ProgressCalendarProps {
  progress: ProgressDay[];
  onToggleDay: (date: string) => void;
}

export const ProgressCalendar: React.FC<ProgressCalendarProps> = ({
  progress,
  onToggleDay,
}) => {
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString(new Date());
  
  // Get last 14 days for a compact view
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return getLocalDateString(d);
  });

  return (
    <div className="bg-coach-card p-6 rounded-3xl border border-black/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 text-coach-card-text">Daily Progress</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-coach-olive rounded-full" />
          <span className="text-[10px] uppercase tracking-wider font-medium opacity-40 text-coach-card-text">Done</span>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((date) => {
          const [year, month, day] = date.split('-').map(Number);
          const d = new Date(year, month - 1, day);
          const dayName = d.toLocaleDateString("en-US", { weekday: "narrow" });
          const dayNum = d.getDate();
          const isToday = date === today;
          const isCompleted = progress.find((p) => p.date === date)?.completed;

          return (
            <div key={date} className="flex flex-col items-center gap-1">
              <span className="text-[8px] uppercase tracking-widest opacity-30 font-bold text-coach-card-text">{dayName}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onToggleDay(date)}
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-all border",
                  isCompleted 
                    ? "bg-coach-olive border-coach-olive text-white shadow-sm" 
                    : "bg-coach-cream/10 border-black/5 text-coach-card-text/20 hover:border-coach-olive/30",
                  isToday && !isCompleted && "border-coach-olive/50 ring-2 ring-coach-olive/10"
                )}
              >
                {isCompleted ? <Check size={14} /> : <span className="text-[10px] font-bold">{dayNum}</span>}
              </motion.button>
            </div>
          );
        })}
      </div>
      
      {days.some(d => d === today && !progress.find(p => p.date === today)?.completed) && (
        <div className="mt-4 p-3 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <X size={14} />
          </div>
          <p className="text-[10px] text-red-800 font-medium leading-tight">
            Real Talk: You haven't checked off today yet. Procrastination is just a fancy word for fear. Get moving.
          </p>
        </div>
      )}
    </div>
  );
};
