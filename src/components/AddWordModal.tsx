import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createWord } from "@/lib/words";
import { createWordPhrase } from "@/lib/wordPhrases";

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  onSuccess: () => void;
  initialExample?: string;
}

export function AddWordModal({
  isOpen,
  onClose,
  word,
  onSuccess,
  initialExample = "",
}: AddWordModalProps) {
  const [russian, setRussian] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState<
    "noun" | "verb" | "adjective" | "adverb" | "phrase" | "other"
  >("other");
  const [example, setExample] = useState(initialExample);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!russian.trim()) {
      alert("Пожалуйста, введите перевод слова");
      return;
    }

    setLoading(true);
    try {
      // Проверяем есть ли такое слово уже в словаре
      const { getWords } = await import("@/lib/words");
      const existingWords = await getWords();
      const wordExists = existingWords.some(
        (w) => w.english.toLowerCase() === word.toLowerCase(),
      );

      if (wordExists) {
        alert(`Слово "${word}" уже есть в словаре!`);
        setLoading(false);
        return;
      }

      const newWord = await createWord({
        english: word,
        russian: russian.trim(),
        part_of_speech: partOfSpeech,
        example: example.trim() || undefined,
        status: "new",
      });

      // Если есть пример, создаем фразу в word_phrases
      if (example.trim()) {
        try {
          await createWordPhrase({
            word_id: newWord.id,
            english: example.trim(),
            russian: `Пример со словом "${word}"`,
            context: `Добавлено из текста при изучении слова "${word}"`,
          });
        } catch (err) {
          console.error("Error creating word phrase:", err);
        }
      }

      // Сбрасываем форму
      setRussian("");
      setPartOfSpeech("other");
      setExample("");

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding word:", error);
      alert("Ошибка при добавлении слова");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Сбрасываем форму при закрытии
    setRussian("");
    setPartOfSpeech("other");
    setExample(initialExample);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            Добавить слово в словарь
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 md:space-y-4 py-3 md:py-4">
            <div className="text-center mb-3 md:mb-4">
              <div className="text-xl md:text-2xl font-medium text-blue-600 mb-2">
                "{word}"
              </div>
              <div className="text-sm md:text-base text-gray-600">
                Добавьте перевод и дополнительную информацию
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div>
                <Label htmlFor="russian" className="text-sm md:text-base">
                  Перевод *
                </Label>
                <Input
                  id="russian"
                  value={russian}
                  onChange={(e) => setRussian(e.target.value)}
                  placeholder="Введите перевод на русском языке"
                  className="w-full h-11 md:h-10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="partOfSpeech" className="text-sm md:text-base">
                  Часть речи
                </Label>
                <select
                  id="partOfSpeech"
                  value={partOfSpeech}
                  onChange={(e) =>
                    setPartOfSpeech(
                      e.target.value as
                        | "noun"
                        | "verb"
                        | "adjective"
                        | "adverb"
                        | "phrase"
                        | "other",
                    )
                  }
                  className="w-full h-11 md:h-10 p-2 md:p-2 border border-gray-300 rounded-md text-base"
                >
                  <option value="noun">Существительное</option>
                  <option value="verb">Глагол</option>
                  <option value="adjective">Прилагательное</option>
                  <option value="adverb">Наречие</option>
                  <option value="phrase">Фраза</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div>
                <Label htmlFor="example" className="text-sm md:text-base">
                  Пример (опционально)
                </Label>
                <Input
                  id="example"
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  placeholder="Пример использования слова в предложении"
                  className="w-full h-11 md:h-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto h-11 md:h-10"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-11 md:h-10"
            >
              {loading ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
