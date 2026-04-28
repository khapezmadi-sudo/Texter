import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  BookOpen,
  Play,
  Trash2,
  X,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Pencil,
} from "lucide-react";
import {
  getPhrases,
  createPhrase,
  deletePhrase,
  updatePhrase,
} from "@/lib/phrases";
import type { Phrase } from "@/types/phrases";

const CATEGORIES = [
  "Идиомы",
  "Деловые",
  "Разговорные",
  "Из фильмов",
  "Сленг",
  "Другое",
];

export function Phrases() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [english, setEnglish] = useState("");
  const [russian, setRussian] = useState("");
  const [category, setCategory] = useState("Другое");
  const [context, setContext] = useState("");

  useEffect(() => {
    loadPhrases();
  }, []);

  async function loadPhrases() {
    try {
      const data = await getPhrases();
      setPhrases(data);
    } catch (error) {
      console.error("Error loading phrases:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !russian.trim()) return;

    setSaving(true);
    try {
      await createPhrase({
        english: english.trim(),
        russian: russian.trim(),
        category,
        context: context.trim() || undefined,
        status: "new",
      });
      setEnglish("");
      setRussian("");
      setContext("");
      setShowAddForm(false);
      loadPhrases();
    } catch (error) {
      console.error("Error creating phrase:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить эту фразу?")) return;
    try {
      await deletePhrase(id);
      loadPhrases();
    } catch (error) {
      console.error("Error deleting phrase:", error);
    }
  };

  const handleEdit = (phrase: Phrase) => {
    setEditingId(phrase.id);
    setEnglish(phrase.english);
    setRussian(phrase.russian);
    setCategory(phrase.category);
    setContext(phrase.context || "");
    setShowAddForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !english.trim() || !russian.trim()) return;

    setSaving(true);
    try {
      await updatePhrase(editingId, {
        english: english.trim(),
        russian: russian.trim(),
        category,
        context: context.trim() || undefined,
      });
      resetForm();
      loadPhrases();
    } catch (error) {
      console.error("Error updating phrase:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setEnglish("");
    setRussian("");
    setCategory("Другое");
    setContext("");
    setShowAddForm(false);
  };

  const handleMarkKnown = async (phrase: Phrase) => {
    try {
      await updatePhrase(phrase.id, {
        status: "known",
        review_count: phrase.review_count + 1,
        last_reviewed: new Date().toISOString(),
      });
      loadPhrases();
    } catch (error) {
      console.error("Error updating phrase:", error);
    }
  };

  const filteredPhrases = phrases.filter(
    (p) =>
      p.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.russian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = {
    total: phrases.length,
    new: phrases.filter((p) => p.status === "new").length,
    learning: phrases.filter((p) => p.status === "learning").length,
    known: phrases.filter((p) => p.status === "known").length,
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-3xl font-bold">Фразы</h1>
              <p className="text-muted-foreground mt-1">
                Добавляй и учи английские фразы
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/phrases/practice">
                <Button variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Практика
                </Button>
              </Link>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить фразу
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Всего</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Новые</p>
                    <p className="text-2xl font-bold">{stats.new}</p>
                  </div>
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Изучаю</p>
                    <p className="text-2xl font-bold">{stats.learning}</p>
                  </div>
                  <GraduationCap className="h-6 w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Знаю</p>
                    <p className="text-2xl font-bold">{stats.known}</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {showAddForm && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingId ? "Редактировать фразу" : "Новая фраза"}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <form
                  onSubmit={editingId ? handleUpdate : handleSubmit}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>На английском</Label>
                      <Input
                        placeholder="It's raining cats and dogs"
                        value={english}
                        onChange={(e) => setEnglish(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Перевод</Label>
                      <Input
                        placeholder="Льёт как из ведра"
                        value={russian}
                        onChange={(e) => setRussian(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Категория</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <Badge
                          key={cat}
                          variant={category === cat ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setCategory(cat)}
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Контекст (опционально)</Label>
                    <Textarea
                      placeholder="Пример использования..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saving}>
                      {saving
                        ? "Сохранение..."
                        : editingId
                          ? "Обновить"
                          : "Сохранить"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Отмена
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по фразам..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : filteredPhrases.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Нет фраз. Добавь первую!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredPhrases.map((phrase) => (
                <Card
                  key={phrase.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              phrase.status === "known"
                                ? "secondary"
                                : phrase.status === "learning"
                                  ? "default"
                                  : "outline"
                            }
                          >
                            {phrase.status === "known" && "Знаю"}
                            {phrase.status === "learning" && "Изучаю"}
                            {phrase.status === "new" && "Новая"}
                          </Badge>
                          <Badge variant="outline">{phrase.category}</Badge>
                          {phrase.review_count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Повторений: {phrase.review_count}
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-medium">{phrase.english}</p>
                        <p className="text-muted-foreground">
                          {phrase.russian}
                        </p>
                        {phrase.context && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{phrase.context}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(phrase)}
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        {phrase.status !== "known" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkKnown(phrase)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Знаю
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(phrase.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
