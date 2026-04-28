import { supabase } from "./supabase";
import type { Text, TranslationAttempt } from "@/types/database";

export async function getTexts(): Promise<Text[]> {
  const { data, error } = await supabase
    .from("texts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getText(id: string): Promise<Text | null> {
  const { data, error } = await supabase
    .from("texts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createText(
  text: Omit<Text, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<Text> {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user?.id;

  if (!user_id) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("texts")
    .insert({ ...text, user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateText(
  id: string,
  updates: Partial<Text>,
): Promise<Text> {
  const { data, error } = await supabase
    .from("texts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteText(id: string): Promise<void> {
  const { error } = await supabase.from("texts").delete().eq("id", id);

  if (error) throw error;
}

export async function getTranslationAttempts(
  textId: string,
): Promise<TranslationAttempt[]> {
  const { data, error } = await supabase
    .from("translation_attempts")
    .select("*")
    .eq("text_id", textId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTranslationAttempt(
  attempt: Omit<TranslationAttempt, "id" | "user_id" | "created_at">,
): Promise<TranslationAttempt> {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user?.id;

  if (!user_id) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("translation_attempts")
    .insert({ ...attempt, user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}
