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

export interface ErrorExample {
  original: string; // Что написал пользователь (например: "i doctor")
  error_type: string; // Тип ошибки (например: "артикли")
  corrected: string; // Как правильно (например: "I am a doctor")
  explanation: string; // Почему так (например: "Нужен глагол to be и артикль a")
}

export interface AIAnalysisResponse {
  rating: number;
  error_types: string[];
  notes: string;
  words_to_learn: string[];
  detailed_analysis: string;
  error_examples: ErrorExample[];
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

  const prompt = `Проанализируй качество перевода с русского на английский язык.

## Оригинальный текст (русский):
${originalText}

## Переведенный текст (английский):
${translatedText}

## Моя самооценка:
${rating ? `Оценка: ${rating}/5` : "Оценка не указана"}
${errorTypes.length > 0 ? `Отмеченные типы ошибок: ${errorTypes.join(", ")}` : ""}
${notes ? `Мои заметки: ${notes}` : ""}

## ВАЖНО: Ответь СТРОГО в следующем формате (без пояснений в скобках, без разделителей ---):

### ОЦЕНКА: [только число от 1 до 5, без /5]

### ТИПЫ ОШИБОК: [тип1, тип2, тип3 - только названия через запятую, без пояснений в скобках]
Пример правильного формата: артикли, лексика, предлоги, согласование

### ПРИМЕРЫ ОШИБОК:
Для КАЖДОЙ основной ошибки укажи:
1. Оригинал: что написал пользователь
2. Тип: тип ошибки (из списка выше)
3. Исправлено: как правильно
4. Почему: краткое объяснение правила

Формат для каждого примера:
ОРИГИНАЛ: [текст с ошибкой]
ТИП: [тип ошибки]
ИСПРАВЛЕНО: [правильный вариант]
ПОЧЕМУ: [объяснение]

Пример:
ОРИГИНАЛ: i doctor
ТИП: артикли
ИСПРАВЛЕНО: I am a doctor
ПОЧЕМУ: Нужен глагол to be и неопределенный артикль a перед профессией

---

### ЗАМЕТКИ:
[Общее описание ошибок текстом]

### СЛОВА ДЛЯ ЗАПОМИНАНИЯ: [слово1, слово2, слово3]

### ДЕТАЛЬНЫЙ АНАЛИЗ:
[Общий разбор и рекомендации]

---
Правила:
1. В ОЦЕНКА пиши только число (1-5), не пиши "3/5"
2. В ТИПЫ ОШИБОК перечисляй только названия
3. В ПРИМЕРЫ ОШИБОК обязательно указывай конкретные фрагменты из текста пользователя
4. Пиши простым текстом для копирования`;

  return prompt;
}

// Функция для парсинга ответа от ИИ
export function parseAIResponse(response: string): AIAnalysisResponse {
  const result: AIAnalysisResponse = {
    rating: 0,
    error_types: [],
    notes: "",
    words_to_learn: [],
    detailed_analysis: "",
    error_examples: [],
  };

  // Извлекаем оценку (поддерживает формат "3", "3/5", "3 из 5")
  const ratingMatch = response.match(/###\s*ОЦЕНКА:\s*(\d)(?:\s*[/]\s*5)?/i);
  if (ratingMatch) {
    result.rating = parseInt(ratingMatch[1], 10);
  }

  // Извлекаем типы ошибок
  const errorsMatch = response.match(/###\s*ТИПЫ ОШИБОК:\s*(.+?)(?=###|$)/is);
  if (errorsMatch) {
    result.error_types = errorsMatch[1]
      .split(/[,;]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && !e.startsWith("["));
  }

  // Извлекаем заметки
  const notesMatch = response.match(/###\s*ЗАМЕТКИ:\s*(.+?)(?=###|$)/is);
  if (notesMatch) {
    result.notes = notesMatch[1].trim();
  }

  // Извлекаем слова для запоминания
  const wordsMatch = response.match(
    /###\s*СЛОВА ДЛЯ ЗАПОМИНАНИЯ:\s*(.+?)(?=###|$)/is,
  );
  if (wordsMatch) {
    result.words_to_learn = wordsMatch[1]
      .split(/[,;]/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0 && !w.startsWith("["));
  }

  // Извлекаем детальный анализ
  const analysisMatch = response.match(/###\s*ДЕТАЛЬНЫЙ АНАЛИЗ:\s*(.+?)$/is);
  if (analysisMatch) {
    result.detailed_analysis = analysisMatch[1].trim();
  }

  // Извлекаем примеры ошибок
  const examplesMatch = response.match(
    /###\s*ПРИМЕРЫ ОШИБОК:\s*(.+?)(?=###|$)/is,
  );
  if (examplesMatch) {
    const examplesText = examplesMatch[1];
    // Парсим блоки ОРИГИНАЛ/ТИП/ИСПРАВЛЕНО/ПОЧЕМУ
    const blocks = examplesText.split(/(?=ОРИГИНАЛ:)/i).filter((b) => b.trim());

    for (const block of blocks) {
      const original = block
        .match(/ОРИГИНАЛ:\s*(.+?)(?=ТИП:|$)/is)?.[1]
        ?.trim();
      const type = block.match(/ТИП:\s*(.+?)(?=ИСПРАВЛЕНО:|$)/is)?.[1]?.trim();
      const corrected = block
        .match(/ИСПРАВЛЕНО:\s*(.+?)(?=ПОЧЕМУ:|$)/is)?.[1]
        ?.trim();
      const explanation = block
        .match(/ПОЧЕМУ:\s*(.+?)(?=ОРИГИНАЛ:|$)/is)?.[1]
        ?.trim();

      if (original && type) {
        result.error_examples.push({
          original,
          error_type: type,
          corrected: corrected || "",
          explanation: explanation || "",
        });
      }
    }
  }

  return result;
}
