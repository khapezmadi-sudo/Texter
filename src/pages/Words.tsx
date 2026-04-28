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
  Volume2,
} from "lucide-react";
import { getWords, createWord, deleteWord, updateWord } from "@/lib/words";
import type { Word } from "@/types/words";

const PARTS_OF_SPEECH = [
  { value: "noun", label: "Существительное" },
  { value: "verb", label: "Глагол" },
  { value: "adjective", label: "Прилагательное" },
  { value: "adverb", label: "Наречие" },
  { value: "phrase", label: "Фраза" },
  { value: "other", label: "Другое" },
];

export function Words() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "learning" | "known"
  >("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [english, setEnglish] = useState("");
  const [russian, setRussian] = useState("");
  const [transcription, setTranscription] = useState("");
  const [partOfSpeech, setPartOfSpeech] =
    useState<Word["part_of_speech"]>("noun");
  const [example, setExample] = useState("");

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      const data = await getWords();
      setWords(data);
    } catch (error) {
      console.error("Error loading words:", error);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setEditingId(null);
    setEnglish("");
    setRussian("");
    setTranscription("");
    setPartOfSpeech("noun");
    setExample("");
    setShowAddForm(false);
  };

  const handleEdit = (word: Word) => {
    setEditingId(word.id);
    setEnglish(word.english);
    setRussian(word.russian);
    setTranscription(word.transcription || "");
    setPartOfSpeech(word.part_of_speech);
    setExample(word.example || "");
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !russian.trim()) return;

    setSaving(true);
    try {
      await createWord({
        english: english.trim(),
        russian: russian.trim(),
        transcription: transcription.trim() || undefined,
        part_of_speech: partOfSpeech,
        example: example.trim() || undefined,
        status: "new",
      });
      resetForm();
      loadWords();
    } catch (error) {
      console.error("Error creating word:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !english.trim() || !russian.trim()) return;

    setSaving(true);
    try {
      await updateWord(editingId, {
        english: english.trim(),
        russian: russian.trim(),
        transcription: transcription.trim() || undefined,
        part_of_speech: partOfSpeech,
        example: example.trim() || undefined,
      });
      resetForm();
      loadWords();
    } catch (error) {
      console.error("Error updating word:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить это слово?")) return;
    try {
      await deleteWord(id);
      loadWords();
    } catch (error) {
      console.error("Error deleting word:", error);
    }
  };

  const handleMarkKnown = async (word: Word) => {
    try {
      await updateWord(word.id, {
        status: "known",
        review_count: word.review_count + 1,
        last_reviewed: new Date().toISOString(),
      });
      loadWords();
    } catch (error) {
      console.error("Error updating word:", error);
    }
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredWords = words.filter(
    (w) =>
      (w.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.russian.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "all" || w.status === statusFilter),
  );

  const stats = {
    total: words.length,
    new: words.filter((w) => w.status === "new").length,
    learning: words.filter((w) => w.status === "learning").length,
    known: words.filter((w) => w.status === "known").length,
  };

  const getPartOfSpeechLabel = (value: Word["part_of_speech"]) => {
    return PARTS_OF_SPEECH.find((p) => p.value === value)?.label || value;
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-3xl font-bold">Слова</h1>
              <p className="text-muted-foreground mt-1">
                Добавляй и учи новые слова
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/words/practice">
                <Button variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Карточки
                </Button>
              </Link>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить слово
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
                    {editingId ? "Редактировать слово" : "Новое слово"}
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
                      <Label>На английском *</Label>
                      <Input
                        placeholder="beautiful"
                        value={english}
                        onChange={(e) => setEnglish(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Перевод *</Label>
                      <Input
                        placeholder="красивый"
                        value={russian}
                        onChange={(e) => setRussian(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Транскрипция (опционально)</Label>
                    <Input
                      placeholder="[ˈbjuːtɪfl]"
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Часть речи</Label>
                    <div className="flex flex-wrap gap-2">
                      {PARTS_OF_SPEECH.map((pos) => (
                        <Badge
                          key={pos.value}
                          variant={
                            partOfSpeech === pos.value ? "default" : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() =>
                            setPartOfSpeech(pos.value as Word["part_of_speech"])
                          }
                        >
                          {pos.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Пример использования (опционально)</Label>
                    <Textarea
                      placeholder="She has a beautiful voice..."
                      value={example}
                      onChange={(e) => setExample(e.target.value)}
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

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по словам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={statusFilter === "all" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Все
              </Button>
              <Button
                variant={statusFilter === "learning" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("learning")}
              >
                Учу
              </Button>
              <Button
                variant={statusFilter === "known" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("known")}
              >
                Знаю
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Нет слов. Добавь первое!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredWords.map((word) => (
                <Card
                  key={word.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              word.status === "known"
                                ? "secondary"
                                : word.status === "learning"
                                  ? "default"
                                  : "outline"
                            }
                          >
                            {word.status === "known" && "Знаю"}
                            {word.status === "learning" && "Изучаю"}
                            {word.status === "new" && "Новое"}
                          </Badge>
                          <Badge variant="outline">
                            {getPartOfSpeechLabel(word.part_of_speech)}
                          </Badge>
                          {word.review_count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Повторений: {word.review_count}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-medium">{word.english}</p>
                          {word.transcription && (
                            <span className="text-muted-foreground text-sm">
                              {word.transcription}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleSpeak(word.english)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground">{word.russian}</p>
                        {word.example && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{word.example}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(word)}
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        {word.status !== "known" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkKnown(word)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Знаю
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(word.id)}
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
