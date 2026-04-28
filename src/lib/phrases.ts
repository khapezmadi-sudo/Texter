import { supabase } from './supabase'
import type { Phrase } from '@/types/phrases'

export async function getPhrases(): Promise<Phrase[]> {
  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getPhrasesByStatus(status: Phrase['status']): Promise<Phrase[]> {
  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createPhrase(phrase: Omit<Phrase, 'id' | 'user_id' | 'created_at' | 'review_count'>): Promise<Phrase> {
  const { data: userData } = await supabase.auth.getUser()
  const user_id = userData.user?.id
  
  if (!user_id) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from('phrases')
    .insert({ ...phrase, user_id, review_count: 0 })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updatePhrase(id: string, updates: Partial<Phrase>): Promise<Phrase> {
  const { data, error } = await supabase
    .from('phrases')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deletePhrase(id: string): Promise<void> {
  const { error } = await supabase
    .from('phrases')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getRandomPhrases(limit: number = 10): Promise<Phrase[]> {
  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .order('review_count', { ascending: true })
    .limit(limit)
  
  if (error) throw error
  return data || []
}
