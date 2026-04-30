import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextReader } from "@/components/TextReader";
import { ArrowLeft } from "lucide-react";
import { createWord } from "@/lib/words";
import { getReadingText, type ReadingText } from "@/lib/readingTexts";

export function ReadingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [text, setText] = useState<ReadingText | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadText = async () => {
      try {
        const foundText = await getReadingText(id!);
        setText(foundText);
      } catch (error) {
        console.error("Error loading text:", error);
      } finally {
        setLoading(false);
      }
    };

    loadText();
  }, [id]);

  const handleAddWord = async (word: string) => {
    try {
      // Проверяем есть ли такое слово уже в словаре
      const { getWords } = await import("@/lib/words");
      const existingWords = await getWords();
      const wordExists = existingWords.some(
        (w) => w.english.toLowerCase() === word.toLowerCase(),
      );

      if (wordExists) {
        alert(`Слово "${word}" уже есть в словаре!`);
        return;
      }

      await createWord({
        english: word,
        russian: "",
        part_of_speech: "other",
        status: "new",
      });
      alert(`Слово "${word}" добавлено в словарь!`);
    } catch (error) {
      console.error("Error adding word:", error);
      alert("Ошибка при добавлении слова");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <MobileNav />
          <div className="flex-1 flex items-center justify-center">
            <div>Загрузка...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <MobileNav />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Текст не найден
              </h2>
              <p className="text-gray-600 mb-6">
                Такой текст для чтения не существует
              </p>
              <Button onClick={() => navigate("/reading")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Вернуться к списку
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 md:mb-6">
              <h1 className="text-xl md:text-3xl font-bold">{text.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={`${
                    text.difficulty === "easy"
                      ? "bg-green-100 text-green-800"
                      : text.difficulty === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {text.difficulty === "easy"
                    ? "Лёгкий"
                    : text.difficulty === "medium"
                      ? "Средний"
                      : "Сложный"}
                </Badge>
                {text.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Полный текст</CardTitle>
              </CardHeader>
              <CardContent>
                <TextReader
                  title={text.title}
                  content={text.content}
                  tags={text.tags}
                  difficulty={text.difficulty}
                  onWordSelect={handleAddWord}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center mt-6">
              <Button onClick={() => navigate("/reading")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Вернуться к списку
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
