import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, X, Save, BookOpen, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getReadingTexts,
  createReadingText,
  updateReadingText,
  deleteReadingText,
  type ReadingText,
} from "@/lib/readingTexts";

export function Reading() {
  const [texts, setTexts] = useState<ReadingText[]>([]);
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
  const [editingText, setEditingText] = useState<ReadingText | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadReadingTexts = async () => {
      try {
        const data = await getReadingTexts();
        setTexts(data);
      } catch (error) {
        console.error("Error loading reading texts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReadingTexts();
  }, []);

  const handleAddText = async () => {
    if (!newText.title.trim() || !newText.content.trim()) return;

    try {
      const tags = newText.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await createReadingText({
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

      const data = await getReadingTexts();
      setTexts(data);
    } catch (error) {
      console.error("Error creating text:", error);
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

  const handleEdit = (text: ReadingText, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingText(text);
    setNewText({
      title: text.title,
      content: text.content,
      tags: text.tags.join(", "),
      difficulty: text.difficulty,
      source: text.source || "",
    });
    setShowEditForm(true);
  };

  const handleUpdateText = async () => {
    if (!editingText || !newText.title.trim() || !newText.content.trim())
      return;

    try {
      const tags = newText.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await updateReadingText(editingText.id, {
        title: newText.title.trim(),
        content: newText.content.trim(),
        tags: [...tags, "чтение"],
        source: newText.source.trim() || undefined,
        difficulty: newText.difficulty,
      });

      setEditingText(null);
      setShowEditForm(false);
      setNewText({
        title: "",
        content: "",
        tags: "",
        difficulty: "medium",
        source: "",
      });

      const data = await getReadingTexts();
      setTexts(data);
    } catch (error) {
      console.error("Error updating text:", error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Удалить этот текст? Это действие нельзя отменить.")) return;

    try {
      await deleteReadingText(id);
      const data = await getReadingTexts();
      setTexts(data);
    } catch (error) {
      console.error("Error deleting text:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-6xl">
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">
                Чтение на английском
              </h1>
              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить текст
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск текстов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : (
              <>
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
                            placeholder="например: технологии, культура, наука"
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

                {/* Форма редактирования текста */}
                {showEditForm && editingText && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Редактировать текст</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowEditForm(false);
                            setEditingText(null);
                            setNewText({
                              title: "",
                              content: "",
                              tags: "",
                              difficulty: "medium",
                              source: "",
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="edit-title">Название</Label>
                        <Input
                          id="edit-title"
                          value={newText.title}
                          onChange={(e) =>
                            setNewText({ ...newText, title: e.target.value })
                          }
                          placeholder="Введите название текста"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-content">Текст</Label>
                        <Textarea
                          id="edit-content"
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
                          <Label htmlFor="edit-tags">
                            Теги (через запятую)
                          </Label>
                          <Input
                            id="edit-tags"
                            value={newText.tags}
                            onChange={(e) =>
                              setNewText({ ...newText, tags: e.target.value })
                            }
                            placeholder="например: технологии, культура, наука"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-difficulty">Сложность</Label>
                          <select
                            id="edit-difficulty"
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
                          <Label htmlFor="edit-source">
                            Источник (опционально)
                          </Label>
                          <Input
                            id="edit-source"
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
                          onClick={() => {
                            setShowEditForm(false);
                            setEditingText(null);
                            setNewText({
                              title: "",
                              content: "",
                              tags: "",
                              difficulty: "medium",
                              source: "",
                            });
                          }}
                        >
                          Отмена
                        </Button>
                        <Button onClick={handleUpdateText}>
                          <Save className="h-4 w-4 mr-2" />
                          Сохранить изменения
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Список текстов */}
                {filteredTexts.length === 0 ? (
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
                ) : (
                  <div className="space-y-4">
                    {filteredTexts.map((text) => (
                      <Card
                        key={text.id}
                        className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] group"
                        onClick={() => navigate(`/reading/${text.id}`)}
                      >
                        <CardHeader className="p-4 md:p-6">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base md:text-lg leading-tight flex-1">
                                {text.title}
                              </CardTitle>
                              <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => handleEdit(text, e)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                  onClick={(e) => handleDelete(text.id, e)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
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
                              {text.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {text.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{text.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 line-clamp-2">
                              {text.content.substring(0, 100)}...
                            </p>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
