-- Добавляем поддержку кастомных типов ошибок в translation_attempts

-- Добавляем колонку для кастомных типов ошибок
ALTER TABLE translation_attempts 
ADD COLUMN IF NOT EXISTS custom_error_types TEXT[] DEFAULT '{}';

-- Добавляем колонку для примеров ошибок (JSONB для хранения массива объектов)
ALTER TABLE translation_attempts 
ADD COLUMN IF NOT EXISTS error_examples JSONB DEFAULT '[]';

-- Обновляем комментарии
COMMENT ON COLUMN translation_attempts.custom_error_types IS 'Пользовательские типы ошибок (например: фразовые глаголы, согласование)';
COMMENT ON COLUMN translation_attempts.error_examples IS 'Примеры ошибок с исправлениями в формате JSON [{original, error_type, corrected, explanation}]';
