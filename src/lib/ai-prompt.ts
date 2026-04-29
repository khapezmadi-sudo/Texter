export interface AIPromptData {
  originalText: string;
  translatedText: string;
  rating?: number;
  errors?: {
    articles: boolean;
    tenses: boolean;
    prepositions: boolean;
    vocabulary: boolean;
    word_order: boolean;
    punctuation: boolean;
  };
  notes?: string;
}

export function generateAIPrompt(data: AIPromptData): string {
  const { originalText, translatedText, rating, errors, notes } = data;

  const errorTypes = errors
    ? Object.entries(errors)
        .filter(([, hasError]) => hasError)
        .map(([type]) => {
          const typeNames: Record<string, string> = {
            articles: "Артикли",
            tenses: "Времена",
            prepositions: "Предлоги",
            word_order: "Порядок слов",
            vocabulary: "Лексика",
            punctuation: "Пунктуация",
          };
          return typeNames[type] || type;
        })
    : [];

  const prompt = `Проанализируй качество перевода с русского на английский язык и дай подробную обратную связь.

## Оригинальный текст (русский):
${originalText}

## Переведенный текст (английский):
${translatedText}

## Моя самооценка:
${rating ? `Оценка: ${rating}/5` : "Оценка не указана"}
${errorTypes.length > 0 ? `Отмеченные типы ошибок: ${errorTypes.join(", ")}` : ""}
${notes ? `Мои заметки: ${notes}` : ""}

## Что мне нужно от тебя:

1. **Общая оценка перевода** (шкала 1-5 звезд) с кратким обоснованием
2. **Детальный анализ ошибок**:
   - Грамматические ошибки (артикли, времена, предлоги, порядок слов)
   - Лексические ошибки (неправильный выбор слов, несоответствие контексту)
   - Стилистические проблемы (неестественные формулировки, буквализмы)
3. **Подробные заметки** - что именно не так и как исправить
4. **Слова для запоминания** - выдели 5-10 важных слов/фраз из текста, которые стоит выучить, через запятую
5. **Рекомендации** - как улучшить перевод в будущем

Будь конструктивным и дай конкретные примеры. Формат ответа сделай удобным для чтения.`;

  return prompt;
}
