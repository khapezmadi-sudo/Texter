-- Создание таблицы для попыток перевода (если не существует)
CREATE TABLE IF NOT EXISTS translation_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text_id UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    translation TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    errors JSONB NOT NULL DEFAULT '{"articles": false, "tenses": false, "prepositions": false, "vocabulary": false, "word_order": false, "punctuation": false}',
    custom_error_types TEXT[] DEFAULT '{}',
    error_examples JSONB DEFAULT '[]',
    notes TEXT DEFAULT '',
    extracted_words TEXT[] DEFAULT '{}',
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_translation_attempts_text_id ON translation_attempts(text_id);
CREATE INDEX IF NOT EXISTS idx_translation_attempts_user_id ON translation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_attempts_created_at ON translation_attempts(created_at DESC);

-- RLS политики
ALTER TABLE translation_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own translation attempts" ON translation_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own translation attempts" ON translation_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own translation attempts" ON translation_attempts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own translation attempts" ON translation_attempts
    FOR DELETE USING (auth.uid() = user_id);
