-- Создание таблицы для текстов чтения
CREATE TABLE IF NOT EXISTS reading_texts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    source TEXT,
    status TEXT CHECK (status IN ('new', 'completed')) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Индексы для быстрого поиска
CREATE INDEX idx_reading_texts_user_id ON reading_texts(user_id);
CREATE INDEX idx_reading_texts_difficulty ON reading_texts(difficulty);
CREATE INDEX idx_reading_texts_status ON reading_texts(status);

-- Политики доступа (RLS)
ALTER TABLE reading_texts ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свои тексты
CREATE POLICY "Users can view own reading texts"
    ON reading_texts FOR SELECT
    USING (auth.uid() = user_id);

-- Пользователи могут создавать свои тексты
CREATE POLICY "Users can create own reading texts"
    ON reading_texts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои тексты
CREATE POLICY "Users can update own reading texts"
    ON reading_texts FOR UPDATE
    USING (auth.uid() = user_id);

-- Пользователи могут удалять свои тексты
CREATE POLICY "Users can delete own reading texts"
    ON reading_texts FOR DELETE
    USING (auth.uid() = user_id);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reading_texts_updated_at
    BEFORE UPDATE ON reading_texts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
