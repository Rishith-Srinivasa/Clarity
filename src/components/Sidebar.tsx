import React from "react";
import { Goal, ProgressDay, CalendarEvent } from "../types";
import { Target, CheckCircle2, Circle, Plus, Trash2, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProgressCalendar } from "./ProgressCalendar";

interface SidebarProps {
  goals: Goal[];
  progress: ProgressDay[];
  events: CalendarEvent[];
  onAddGoal: () => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onClearChat: () => void;
  onToggleProgress: (date: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  goals,
  progress,
  events,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onDeleteEvent,
  onClearChat,
  onToggleProgress,
}) => {
  return (
    <div className="h-full flex flex-col p-6 bg-white/50 backdrop-blur-sm border-r border-black/5">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif font-semibold">Your Focus</h2>
        <button
          onClick={onAddGoal}
          className="p-2 hover:bg-coach-olive/10 rounded-full transition-colors text-coach-olive"
          title="Add new goal"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="mb-8">
        <ProgressCalendar progress={progress} onToggleDay={onToggleProgress} />
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2">
        {/* Goals Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 opacity-40">
            <Target size={14} />
            <h3 className="text-[10px] uppercase tracking-widest font-bold">Active Goals</h3>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {goals.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 px-4 border border-dashed border-black/10 rounded-2xl"
                >
                  <p className="text-[10px] text-coach-card-text/40 italic">
                    No active goals yet.
                  </p>
                </motion.div>
              ) : (
                goals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group relative bg-coach-card p-4 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleGoal(goal.id)}
                        className="mt-1 text-coach-olive hover:scale-110 transition-transform"
                      >
                        {goal.status === "completed" ? (
                          <CheckCircle2 size={18} className="fill-coach-olive text-white" />
                        ) : (
                          <Circle size={18} />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3
                          className={`font-medium text-sm ${
                            goal.status === "completed" ? "line-through opacity-40" : ""
                          }`}
                        >
                          {goal.title}
                        </h3>
                        {goal.nextStep && (
                          <p className="text-[10px] uppercase tracking-wider text-coach-olive mt-2 font-semibold">
                            Next: {goal.nextStep}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Schedule Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 opacity-40">
            <Calendar size={14} />
            <h3 className="text-[10px] uppercase tracking-widest font-bold">Upcoming Schedule</h3>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {events.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 px-4 border border-dashed border-black/10 rounded-2xl"
                >
                  <p className="text-[10px] text-coach-card-text/40 italic">
                    No scheduled events.
                  </p>
                </motion.div>
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group relative bg-coach-card p-4 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-coach-olive">
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{event.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-bold text-coach-olive/60 uppercase tracking-wider">
                            {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          {event.time && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-coach-olive/60 uppercase tracking-wider">
                              <Clock size={10} />
                              {event.time}
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-[10px] text-coach-card-text/40 mt-1 italic">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <div className="mt-auto pt-6 border-t border-black/5 space-y-4">
        <button
          onClick={onClearChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold hover:bg-red-100 transition-all"
        >
          <Trash2 size={14} />
          Clear Conversation
        </button>
        <div className="p-4 bg-coach-olive/5 rounded-2xl">
          <p className="text-xs italic text-coach-card-text/60 leading-relaxed">
            "The secret of getting ahead is getting started."
          </p>
          <p className="text-[10px] mt-2 font-medium uppercase tracking-widest opacity-40">
            — Mark Twain
          </p>
        </div>
      </div>
    </div>
  );
};
