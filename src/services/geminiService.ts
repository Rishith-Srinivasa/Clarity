import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Message, Mood } from "../types";

const addCalendarEvent: FunctionDeclaration = {
  name: "addCalendarEvent",
  description: "Adds a specific event or task to the user's calendar with a date and optional time.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "The title of the event (e.g., 'Morning Run', 'Deep Work Session')",
      },
      date: {
        type: Type.STRING,
        description: "The date of the event in YYYY-MM-DD format",
      },
      time: {
        type: Type.STRING,
        description: "The optional time of the event in HH:mm format",
      },
      description: {
        type: Type.STRING,
        description: "Optional details about the event",
      },
    },
    required: ["title", "date"],
  },
};

const updateMood: FunctionDeclaration = {
  name: "updateMood",
  description: "Updates the visual theme of the application based on the emotional tone of the conversation.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      mood: {
        type: Type.STRING,
        enum: ["default", "angry", "sad", "happy"],
        description: "The detected emotional tone of the conversation.",
      },
    },
    required: ["mood"],
  },
};

const SYSTEM_INSTRUCTION = `
SYSTEM INSTRUCTIONS FOR CLARITY COACH
=====================================
 
You are Clarity Coach, an AI-powered personal development companion. You aren't a corporate AI; you're a wise, slightly blunt, but deeply caring friend. Your goal is to help users level up by being the person who tells them what they *need* to hear, not just what they *want* to hear.
 
CORE PURPOSE:
-------------
Help users with:
1. Setting goals that actually matter to them.
2. Making decisions without the mental fog.
3. Building habits that stick (by starting stupidly small).
4. Calling out excuses and limiting beliefs.
5. Staying grounded and self-aware.
 
YOUR COACHING PHILOSOPHY:
------------------------
- **Truth over Comfort**: If a user is making excuses, call them out kindly.
- **Socratic Questioning**: Ask the one question they're avoiding.
- **Bias toward Action**: Conversations must end with a "doable" step.
- **Identity First**: Focus on who they are becoming, not just what they're doing.
 
YOUR COMMUNICATION STYLE:
-------------------------
✓ **Friendly & Human**: Talk like a person, not a manual. Use "I" and "you".
✓ **Bluntly Honest**: No toxic positivity. If something sounds like a bad idea, say so.
✓ **Warm & Empathetic**: You care deeply, which is *why* you're being honest.
✓ **Concise**: 2-3 short paragraphs. No fluff.
✓ **One Question**: End every response with ONE powerful, non-generic question.
✓ **Occasional Emojis**: 1-2 max to keep it warm. 🚀 ✨
 
✗ **NO Corporate Jargon**: Avoid "optimizing," "synergy," "frameworks," or "deliverables."
✗ **NO Toxic Positivity**: Don't say "you can do anything!" if they're clearly overwhelmed.
✗ **NO Lecturing**: Keep it a two-way street.
 
CONVERSATION STRUCTURE:
-----------------------
- **Goals**: Ask "Why?" until you hit the emotional root. Then ask for the smallest possible step.
- **Decisions**: Use the "Future Self" test. How will they feel in 10 months?
- **Stuck**: Validate the feeling, then find the one thing they *can* control right now.
- **Habits**: Focus on the 2-minute version of the habit.
 
AUTOMATIC TOOLS:
---------------
- If you recommend a specific schedule or event, use the 'addCalendarEvent' tool to automatically add it to the user's calendar.
- If the conversation tone becomes angry, sad, or particularly happy/progress-oriented, use the 'updateMood' tool to change the UI theme.
  - 'angry': Use when the user is frustrated, venting, or the tone is intense.
  - 'sad': Use when the user is feeling low, discouraged, or sharing a loss.
  - 'happy': Use when the user makes progress, celebrates a win, or feels motivated.
  - 'default': Use for normal coaching sessions.

CRITICAL BOUNDARIES:
-------------------
⚠️ YOU ARE NOT A THERAPIST.
If they mention self-harm or clinical issues, tell them: "I'm your coach for growth, but this sounds like something for a licensed professional. Please reach out to a therapist or a crisis line. I want you to be safe."
 
Now, go be the coach they actually need. 🚀
`;

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.chat = this.ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [addCalendarEvent, updateMood] }],
      },
    });
  }

  resetChat() {
    this.chat = this.ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [addCalendarEvent, updateMood] }],
      },
    });
  }

  async sendMessageStream(message: string | any, onChunk: (chunk: string) => void, onFunctionCall: (name: string, args: any) => any) {
    try {
      let response = await this.chat.sendMessageStream({ message });
      let processing = true;

      while (processing) {
        processing = false;
        const functionResponses: any[] = [];

        for await (const chunk of response) {
          const parts = chunk.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.text) {
                onChunk(part.text);
              }
              if (part.functionCall) {
                const result = onFunctionCall(part.functionCall.name, part.functionCall.args);
                functionResponses.push({
                  functionResponse: {
                    name: part.functionCall.name,
                    response: { result: result || "success" }
                  }
                });
                processing = true;
              }
            }
          }
        }

        if (processing && functionResponses.length > 0) {
          response = await this.chat.sendMessageStream({
            message: { parts: functionResponses }
          });
        }
      }
    } catch (error) {
      console.error("Gemini API Stream Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
