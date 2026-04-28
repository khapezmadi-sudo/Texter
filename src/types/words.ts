export interface Word {
  id: string;
  user_id: string;
  english: string;
  russian: string;
  transcription?: string;
  part_of_speech: "noun" | "verb" | "adjective" | "adverb" | "phrase" | "other";
  example?: string;
  status: "new" | "learning" | "known";
  review_count: number;
  last_reviewed?: string;
  created_at: string;
  // SRS fields
  next_review_date?: string;
  interval_days: number;
  ease_factor: number;
  repetition_count: number;
  streak_days: number;
}

export interface WordPracticeSession {
  word: Word;
  userAnswer: string;
  correct: boolean;
  showedAnswer: boolean;
  quality?: number; // 0-5 rating for SRS
}

export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

// Quality ratings:
// 5 - perfect response
// 4 - correct response after a hesitation
// 3 - correct response recalled with serious difficulty
// 2 - incorrect response; where the correct one seemed easy to recall
// 1 - incorrect response; the correct one remembered
// 0 - complete blackout
