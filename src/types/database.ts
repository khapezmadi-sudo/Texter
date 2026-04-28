export interface Text {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  source?: string
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'draft' | 'pending_review' | 'completed' | 'needs_retry'
  created_at: string
  updated_at: string
}

export interface TranslationAttempt {
  id: string
  text_id: string
  user_id: string
  translation: string
  rating: number
  errors: {
    articles: boolean
    tenses: boolean
    prepositions: boolean
    vocabulary: boolean
    word_order: boolean
    punctuation: boolean
  }
  notes: string
  extracted_words: string[]
  duration_seconds?: number
  created_at: string
}
