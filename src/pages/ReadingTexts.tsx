import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextReader } from "@/components/TextReader";
import { Plus, Search, BookOpen, Trash2, X, Save } from "lucide-react";
import { createText, getTexts, deleteText } from "@/lib/texts";
import { createWord } from "@/lib/words";
import type { Text } from "@/types/database";

export function ReadingTexts() {
  const [texts, setTexts] = useState<Text[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState({
    title: "",
    content: "",
    tags: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    source: "",
  });

  useEffect(() => {
    const loadTexts = async () => {
      try {
        const allTexts = await getTexts();
        // Фильтруем только тексты для чтения по тегу
        const readingTexts = allTexts.filter(
          (text) =>
            text.tags.includes("чтение") || text.tags.includes("reading"),
        );
        setTexts(readingTexts);
      } catch (error) {
        console.error("Error loading texts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTexts();
  }, []);

  const handleAddText = async () => {
    if (!newText.title.trim() || !newText.content.trim()) return;

    try {
      const tags = newText.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await createText({
        title: newText.title.trim(),
        content: newText.content.trim(),
        tags: [...tags, "чтение"],
        source: newText.source.trim() || undefined,
        difficulty: newText.difficulty,
        status: "completed",
      });

      setNewText({
        title: "",
        content: "",
        tags: "",
        difficulty: "medium",
        source: "",
      });
      setShowAddForm(false);
      // Перезагружаем тексты
      (async () => {
        try {
          const allTexts = await getTexts();
          const readingTexts = allTexts.filter(
            (text) =>
              text.tags.includes("чтение") || text.tags.includes("reading"),
          );
          setTexts(readingTexts);
        } catch (error) {
          console.error("Error reloading texts:", error);
        }
      })();
    } catch (error) {
      console.error("Error creating text:", error);
    }
  };

  const handleDeleteText = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот текст?")) return;

    try {
      await deleteText(id);
      // Перезагружаем тексты
      (async () => {
        try {
          const allTexts = await getTexts();
          const readingTexts = allTexts.filter(
            (text) =>
              text.tags.includes("чтение") || text.tags.includes("reading"),
          );
          setTexts(readingTexts);
        } catch (error) {
          console.error("Error reloading texts:", error);
        }
      })();
    } catch (error) {
      console.error("Error deleting text:", error);
    }
  };

  const handleAddWord = async (word: string) => {
    try {
      await createWord({
        english: word,
        russian: "", // Пользователь заполнит позже
        part_of_speech: "other",
        status: "new",
      });
      alert(`Слово "${word}" добавлено в словарь!`);
    } catch (error) {
      console.error("Error adding word:", error);
      alert("Ошибка при добавлении слова");
    }
  };

  const filteredTexts = texts.filter(
    (text) =>
      text.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      text.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      text.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div>Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Тексты для чтения</h1>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить текст
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск текстов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Форма добавления текста */}
            {showAddForm && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Добавить новый текст</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Название</Label>
                    <Input
                      id="title"
                      value={newText.title}
                      onChange={(e) =>
                        setNewText({ ...newText, title: e.target.value })
                      }
                      placeholder="Введите название текста"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Текст</Label>
                    <Textarea
                      id="content"
                      value={newText.content}
                      onChange={(e) =>
                        setNewText({ ...newText, content: e.target.value })
                      }
                      placeholder="Введите текст на английском языке"
                      rows={8}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tags">Теги (через запятую)</Label>
                      <Input
                        id="tags"
                        value={newText.tags}
                        onChange={(e) =>
                          setNewText({ ...newText, tags: e.target.value })
                        }
                        placeholder="например: бизнес, технологии, культура"
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Сложность</Label>
                      <select
                        id="difficulty"
                        value={newText.difficulty}
                        onChange={(e) =>
                          setNewText({
                            ...newText,
                            difficulty: e.target.value as
                              | "easy"
                              | "medium"
                              | "hard",
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="easy">Лёгкий</option>
                        <option value="medium">Средний</option>
                        <option value="hard">Сложный</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="source">Источник (опционально)</Label>
                      <Input
                        id="source"
                        value={newText.source}
                        onChange={(e) =>
                          setNewText({ ...newText, source: e.target.value })
                        }
                        placeholder="Например: BBC, The Guardian"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Отмена
                    </Button>
                    <Button onClick={handleAddText}>
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Список текстов */}
            <div className="space-y-4">
              {filteredTexts.map((text) => (
                <Card key={text.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{text.title}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          {text.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          <Badge
                            className={`text-xs ${
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
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteText(text.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
              ))}
            </div>

            {filteredTexts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery
                      ? "Тексты не найдены"
                      : "Нет текстов для чтения"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery
                      ? "Попробуйте изменить поисковый запрос"
                      : "Добавьте свой первый текст для практики чтения"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить текст
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
