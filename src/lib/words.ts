import { supabase } from "./supabase";
import type { Word } from "@/types/words";

export async function getWords(): Promise<Word[]> {
  const { data, error } = await supabase
    .from("words")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getWordsByStatus(
  status: Word["status"],
): Promise<Word[]> {
  const { data, error } = await supabase
    .from("words")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createWord(
  word: Omit<
    Word,
    | "id"
    | "user_id"
    | "created_at"
    | "review_count"
    | "interval_days"
    | "ease_factor"
    | "repetition_count"
    | "streak_days"
  >,
): Promise<Word> {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user?.id;

  if (!user_id) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("words")
    .insert({
      ...word,
      user_id,
      review_count: 0,
      interval_days: 0,
      ease_factor: 2.5,
      repetition_count: 0,
      streak_days: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWord(
  id: string,
  updates: Partial<Word>,
): Promise<Word> {
  const { data, error } = await supabase
    .from("words")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWord(id: string): Promise<void> {
  const { error } = await supabase.from("words").delete().eq("id", id);

  if (error) throw error;
}

export async function getRandomWords(limit: number = 10): Promise<Word[]> {
  const { data, error } = await supabase
    .from("words")
    .select("*")
    .order("review_count", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Get words due for review today
export async function getWordsDueForReview(
  limit: number = 20,
): Promise<Word[]> {
  const today = new Date().toISOString();

  const { data, error } = await supabase
    .from("words")
    .select("*")
    .or(`next_review_date.is.null,next_review_date.lte.${today}`)
    .neq("status", "known")
    .order("next_review_date", { ascending: true, nullsFirst: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Get streak info
export async function getStreakInfo(): Promise<{
  currentStreak: number;
  longestStreak: number;
}> {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user?.id;

  if (!user_id) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("words")
    .select("streak_days")
    .eq("user_id", user_id)
    .order("streak_days", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows

  // For simplicity, return streak from highest streak word
  // In a real app, you'd track daily activity separately
  return {
    currentStreak: data?.streak_days || 0,
    longestStreak: data?.streak_days || 0,
  };
}

// SRS Algorithm (SM-2)
export function calculateNextReview(
  quality: number,
  currentInterval: number,
  currentEaseFactor: number,
  repetitionCount: number,
): { interval: number; easeFactor: number; repetitionCount: number } {
  // SM-2 Algorithm
  let newEaseFactor =
    currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  let newInterval: number;
  let newRepetitionCount = repetitionCount;

  if (quality < 3) {
    // Failed - reset
    newRepetitionCount = 0;
    newInterval = 1;
  } else {
    // Success
    newRepetitionCount = repetitionCount + 1;
    if (newRepetitionCount === 1) {
      newInterval = 1;
    } else if (newRepetitionCount === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
    }
  }

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitionCount: newRepetitionCount,
  };
}

// Update word with SRS data
export async function updateWordWithSRS(
  id: string,
  quality: number,
  writtenAnswer?: string,
): Promise<Word> {
  const { data: word } = await supabase
    .from("words")
    .select("*")
    .eq("id", id)
    .single();

  if (!word) throw new Error("Word not found");

  const srs = calculateNextReview(
    quality,
    word.interval_days,
    word.ease_factor,
    word.repetition_count,
  );

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + srs.interval);

  // Update status based on quality and repetition count
  let newStatus = word.status;
  if (quality >= 4 && srs.repetitionCount >= 3) {
    newStatus = "known";
  } else if (quality >= 3) {
    newStatus = "learning";
  }

  const { data, error } = await supabase
    .from("words")
    .update({
      interval_days: srs.interval,
      ease_factor: srs.easeFactor,
      repetition_count: srs.repetitionCount,
      next_review_date: nextReview.toISOString(),
      last_reviewed: new Date().toISOString(),
      review_count: word.review_count + 1,
      status: newStatus,
      streak_days: quality >= 3 ? word.streak_days + 1 : 0,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
