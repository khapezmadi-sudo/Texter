export interface Phrase {
  id: string
  user_id: string
  english: string
  russian: string
  category: string
  context?: string
  status: 'new' | 'learning' | 'known'
  review_count: number
  last_reviewed?: string
  created_at: string
}

export interface PracticeSession {
  phrase: Phrase
  userAnswer: string
  correct: boolean
  showedAnswer: boolean
}
