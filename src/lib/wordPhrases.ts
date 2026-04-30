import { supabase } from "./supabase";

export interface WordPhrase {
  id: string;
  word_id: string;
  user_id: string;
  english: string;
  russian: string;
  context?: string;
  created_at: string;
  updated_at: string;
}

export async function getWordPhrases(wordId: string): Promise<WordPhrase[]> {
  const { data, error } = await supabase
    .from("word_phrases")
    .select("*")
    .eq("word_id", wordId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createWordPhrase(
  phrase: Omit<WordPhrase, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<WordPhrase> {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user?.id;

  if (!user_id) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("word_phrases")
    .insert([{ ...phrase, user_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWordPhrase(
  id: string,
  updates: Partial<WordPhrase>,
): Promise<WordPhrase> {
  const { data, error } = await supabase
    .from("word_phrases")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWordPhrase(id: string): Promise<void> {
  const { error } = await supabase.from("word_phrases").delete().eq("id", id);
  if (error) throw error;
}

// Получить все фразы пользователя (для страницы Phrases)
export async function getAllUserPhrases(): Promise<WordPhrase[]> {
  const { data, error } = await supabase
    .from("word_phrases")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
