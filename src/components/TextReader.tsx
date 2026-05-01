import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, X, BookOpen, ExternalLink } from "lucide-react";
import { AddWordModal } from "./AddWordModal";
import { getWords } from "@/lib/words";
import type { Word } from "@/types/words";
import { useNavigate } from "react-router-dom";

interface TextReaderProps {
  title: string;
  content: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  onWordSelect?: (word: string) => void;
}

export function TextReader({
  title,
  content,
  tags,
  difficulty,
}: TextReaderProps) {
  const navigate = useNavigate();
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [selection, setSelection] = useState<{
    text: string;
    x: number;
    y: number;
    context: string;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userWords, setUserWords] = useState<Word[]>([]);
  const [existingWord, setExistingWord] = useState<Word | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load user's dictionary
  useEffect(() => {
    const loadWords = async () => {
      try {
        const words = await getWords();
        setUserWords(words);
      } catch (error) {
        console.error("Error loading words:", error);
      }
    };
    loadWords();
  }, []);

  // Функция для извлечения предложения с выделенным словом
  const getSentenceWithWord = (word: string, textContent: string): string => {
    // Разбиваем текст на предложения
    const sentences = textContent.split(/(?<=[.!?])\s+/);
    // Ищем предложение содержащее слово
    const sentence = sentences.find((s) =>
      s.toLowerCase().includes(word.toLowerCase()),
    );
    return sentence || "";
  };

  const handleTextSelection = (e?: React.MouseEvent | React.TouchEvent) => {
    // На мобильных устройствах нужна небольшая задержка для корректного получения выделения
    const processSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelection(null);
        setExistingWord(null);
        return;
      }

      const selectedText = sel.toString().trim();
      // Разрешаем слова с дефисами и апострофами (don't, well-known)
      const isValidWord = /^[a-zA-Z]+(['-][a-zA-Z]+)?$/.test(selectedText);

      if (selectedText && isValidWord) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Получаем контент текста
        const textContent = contentRef.current?.textContent || "";
        const context = getSentenceWithWord(selectedText, textContent);

        // Проверяем есть ли слово в словаре
        const found = userWords.find(
          (w) => w.english.toLowerCase() === selectedText.toLowerCase(),
        );
        setExistingWord(found || null);

        // На мобильных позиционируем относительно viewport
        const isMobile = window.innerWidth < 768;

        setSelection({
          text: selectedText,
          x: isMobile ? window.innerWidth / 2 : rect.left + rect.width / 2,
          y: isMobile ? window.innerHeight - 100 : rect.top - 10,
          context,
        });
        setSelectedWord(selectedText);
      } else {
        // Если выделено несколько слов или не слово - игнорируем
        if (selectedText.split(/\s+/).length > 1) {
          setSelection(null);
          setSelectedWord("");
          setExistingWord(null);
        }
      }
    };

    // Для touch событий добавляем небольшую задержку
    if (e?.type === "touchend") {
      setTimeout(processSelection, 100);
    } else {
      processSelection();
    }
  };

  const handleAddWithTranslation = () => {
    setShowAddModal(true);
  };

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                <Badge className={`text-xs ${getDifficultyColor(difficulty)}`}>
                  {difficulty === "easy"
                    ? "Лёгкий"
                    : difficulty === "medium"
                      ? "Средний"
                      : "Сложный"}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpeak}
              className="shrink-0"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Озвучить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={contentRef}
            className="prose prose-gray max-w-none leading-relaxed text-base select-text cursor-text"
            onMouseUp={(e) => handleTextSelection(e)}
            onTouchEnd={(e) => handleTextSelection(e)}
            style={{
              lineHeight: "1.8",
              WebkitUserSelect: "text",
              userSelect: "text",
            }}
          >
            <div className="md:hidden text-xs text-gray-400 mb-2">
              💡 Зажмите палец на слове, затем отпустите чтобы выделить
            </div>
            {content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Всплывающее меню для выделенного слова */}
      {selection && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 md:p-4 flex flex-col gap-2 md:gap-3 w-[calc(100vw-40px)] md:min-w-[320px] md:w-auto max-w-[320px]"
          style={{
            left: "50%",
            bottom: "20px",
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-sm md:text-base font-medium text-gray-700 border-b pb-2">
            Выделенное слово:{" "}
            <span className="text-blue-600 font-semibold">
              "{selection.text}"
            </span>
          </div>

          {/* Показываем данные существующего слова */}
          {existingWord ? (
            <div className="bg-green-50 p-2 rounded-md">
              <div className="flex items-center gap-1 text-green-700 text-xs mb-1">
                <BookOpen className="h-3 w-3" />
                <span>Уже в словаре</span>
              </div>
              <p className="font-medium text-sm">{existingWord.russian}</p>
              {existingWord.transcription && (
                <p className="text-xs text-gray-500">
                  {existingWord.transcription}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {existingWord.part_of_speech}
                {existingWord.status === "known" && " • Изучено"}
                {existingWord.status === "learning" && " • Учу"}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7 mt-1 w-full"
                onClick={() => navigate(`/words/${existingWord.id}`)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Открыть в словаре
              </Button>
            </div>
          ) : (
            <div className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
              💡 Нажмите "Добавить" чтобы сохранить слово с примером из текста
            </div>
          )}

          <div className="flex flex-row gap-2 w-full">
            {!existingWord && (
              <Button
                size="sm"
                onClick={handleAddWithTranslation}
                className="text-xs md:text-sm flex-1 min-w-0"
              >
                📚 Добавить
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelection(null);
                setExistingWord(null);
              }}
              className={`text-xs md:text-sm shrink-0 ${existingWord ? "flex-1" : ""}`}
            >
              <X className="h-4 w-4" />
              <span className="ml-1">Закрыть</span>
            </Button>
          </div>
        </div>
      )}

      {/* Модальное окно для добавления слова с переводом */}
      <AddWordModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelection(null);
          setSelectedWord("");
          window.getSelection()?.removeAllRanges();
        }}
        word={selectedWord}
        initialExample={selection?.context || ""}
        onSuccess={() => {
          // Можно добавить уведомление об успехе
        }}
      />
    </div>
  );
}
