import { supabase } from "./supabase";

export interface ReadingText {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  source?: string;
  status: "new" | "completed";
  created_at: string;
  updated_at: string;
}

export async function getReadingTexts(): Promise<ReadingText[]> {
  const { data, error } = await supabase
    .from("reading_texts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getReadingText(id: string): Promise<ReadingText | null> {
  const { data, error } = await supabase
    .from("reading_texts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createReadingText(
  text: Omit<ReadingText, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<ReadingText> {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user?.id;

  if (!user_id) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("reading_texts")
    .insert([{ ...text, user_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReadingText(
  id: string,
  updates: Partial<ReadingText>,
): Promise<ReadingText> {
  const { data, error } = await supabase
    .from("reading_texts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReadingText(id: string): Promise<void> {
  const { error } = await supabase.from("reading_texts").delete().eq("id", id);
  if (error) throw error;
}
