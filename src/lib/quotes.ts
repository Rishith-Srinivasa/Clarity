export const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Your future self is watching you right now through your memories.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "Stop waiting for the 'right time'. It doesn't exist.", author: "Clarity Coach" },
  { text: "You are what you do, not what you say you'll do.", author: "Carl Jung" },
  { text: "Hard choices, easy life. Easy choices, hard life.", author: "Jerzy Gregorek" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "If it's important you'll find a way. If it's not, you'll find an excuse.", author: "Unknown" }
];

export const getRandomQuote = () => {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
};
