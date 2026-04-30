import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Edit, Save, X, Volume2 } from "lucide-react";
import type { Word } from "@/types/words";
import { getWords, updateWord } from "@/lib/words";
import {
  getWordPhrases,
  createWordPhrase,
  deleteWordPhrase,
  type WordPhrase,
} from "@/lib/wordPhrases";

export function WordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [word, setWord] = useState<Word | null>(null);
  const [relatedPhrases, setRelatedPhrases] = useState<WordPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPhrase, setShowAddPhrase] = useState(false);
  const [editForm, setEditForm] = useState({
    english: "",
    russian: "",
    transcription: "",
    part_of_speech: "noun" as
      | "noun"
      | "verb"
      | "adjective"
      | "adverb"
      | "phrase"
      | "other",
    example: "",
  });
  const [newPhrase, setNewPhrase] = useState({
    english: "",
    russian: "",
    category: "",
    context: "",
  });

  useEffect(() => {
    const loadWord = async () => {
      try {
        // Загружаем слово из Supabase
        const words = await getWords();
        const foundWord = words.find((w) => w.id === id);

        if (foundWord) {
          setWord(foundWord);
          setEditForm({
            english: foundWord.english,
            russian: foundWord.russian,
            transcription: foundWord.transcription || "",
            part_of_speech: foundWord.part_of_speech || "noun",
            example: foundWord.example || "",
          });

          // Загружаем связанные фразы
          const phrases = await getWordPhrases(id!);
          setRelatedPhrases(phrases);
        }
      } catch (error) {
        console.error("Error loading word:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWord();
  }, [id]);

  const handleSave = async () => {
    if (!word) return;

    try {
      await updateWord(word.id, editForm);
      setWord({ ...word, ...editForm });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving word:", error);
    }
  };

  const handleAddPhrase = async () => {
    if (!word || !newPhrase.english.trim() || !newPhrase.russian.trim()) return;

    try {
      const phrase = await createWordPhrase({
        word_id: word.id,
        english: newPhrase.english.trim(),
        russian: newPhrase.russian.trim(),
        context:
          newPhrase.context.trim() || `Фраза со словом "${word.english}"`,
      });

      setRelatedPhrases((prev) => [phrase, ...prev]);
      setNewPhrase({ english: "", russian: "", category: "", context: "" });
      setShowAddPhrase(false);
    } catch (error) {
      console.error("Error adding phrase:", error);
    }
  };

  const handleDeletePhrase = async (phraseId: string) => {
    try {
      await deleteWordPhrase(phraseId);
      setRelatedPhrases((prev) => prev.filter((p) => p.id !== phraseId));
    } catch (error) {
      console.error("Error deleting phrase:", error);
    }
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const getPartOfSpeechLabel = (pos: string) => {
    const labels: Record<string, string> = {
      noun: "Существительное",
      verb: "Глагол",
      adjective: "Прилагательное",
      adverb: "Наречие",
      phrase: "Фраза",
      other: "Другое",
    };
    return labels[pos] || pos;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "learning":
        return "bg-yellow-100 text-yellow-800";
      case "reviewing":
        return "bg-orange-100 text-orange-800";
      case "mastered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  if (!word) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <MobileNav />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Слово не найдено
              </h2>
              <p className="text-gray-600 mb-6">
                Такого слова не существует в вашем словаре
              </p>
              <Button onClick={() => navigate("/words")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Вернуться к словарю
              </Button>
            </div>
          </main>
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
            {/* Шапка */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/words")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl md:text-3xl font-bold">
                  {word.english}
                </h1>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(word.status)}>
                  {word.status === "new" && "Новое"}
                  {word.status === "learning" && "Изучается"}
                  {word.status === "known" && "Известно"}
                </Badge>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                )}
              </div>
            </div>

            {/* Основная информация о слове */}
            <Card>
              <CardHeader>
                <CardTitle>Информация о слове</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="english">Слово (английский) *</Label>
                        <Input
                          id="english"
                          value={editForm.english}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              english: e.target.value,
                            })
                          }
                          placeholder="Введите слово на английском"
                        />
                      </div>
                      <div>
                        <Label htmlFor="russian">Перевод (русский) *</Label>
                        <Input
                          id="russian"
                          value={editForm.russian}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              russian: e.target.value,
                            })
                          }
                          placeholder="Введите перевод"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="transcription">Транскрипция</Label>
                        <Input
                          id="transcription"
                          value={editForm.transcription}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              transcription: e.target.value,
                            })
                          }
                          placeholder="Например: /ˈæpəl/"
                        />
                      </div>
                      <div>
                        <Label htmlFor="partOfSpeech">Часть речи</Label>
                        <select
                          id="partOfSpeech"
                          value={editForm.part_of_speech}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              part_of_speech: e.target.value as
                                | "noun"
                                | "verb"
                                | "adjective"
                                | "adverb"
                                | "phrase"
                                | "other",
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="noun">Существительное</option>
                          <option value="verb">Глагол</option>
                          <option value="adjective">Прилагательное</option>
                          <option value="adverb">Наречие</option>
                          <option value="phrase">Фраза</option>
                          <option value="other">Другое</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="example">Пример использования</Label>
                      <Input
                        id="example"
                        value={editForm.example}
                        onChange={(e) =>
                          setEditForm({ ...editForm, example: e.target.value })
                        }
                        placeholder="Введите пример предложения"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Отмена
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Перевод</p>
                        <p className="text-lg font-medium">{word.russian}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Часть речи</p>
                        <p className="text-lg font-medium">
                          {getPartOfSpeechLabel(word.part_of_speech || "other")}
                        </p>
                      </div>
                    </div>

                    {word.transcription && (
                      <div>
                        <p className="text-sm text-gray-500">Транскрипция</p>
                        <p className="text-lg font-mono text-blue-600">
                          {word.transcription}
                        </p>
                      </div>
                    )}

                    {word.example && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Пример</p>
                            <p className="text-base italic">{word.example}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSpeak(word.example || "")}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Повторений: {word.review_count}</span>
                      <span>
                        Последнее повторение:{" "}
                        {word.last_reviewed
                          ? new Date(word.last_reviewed).toLocaleDateString(
                              "ru-RU",
                            )
                          : "Нет"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Связанные фразы */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle>Фразы со словом "{word.english}"</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowAddPhrase(true)}
                    disabled={showAddPhrase}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить фразу
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Форма добавления фразы */}
                {showAddPhrase && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-medium">Добавить новую фразу</h3>
                    <div>
                      <Label htmlFor="phraseEnglish">
                        Фраза (английский) *
                      </Label>
                      <Input
                        id="phraseEnglish"
                        value={newPhrase.english}
                        onChange={(e) =>
                          setNewPhrase({
                            ...newPhrase,
                            english: e.target.value,
                          })
                        }
                        placeholder={`Введите фразу со словом "${word.english}"`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phraseRussian">Перевод (русский) *</Label>
                      <Input
                        id="phraseRussian"
                        value={newPhrase.russian}
                        onChange={(e) =>
                          setNewPhrase({
                            ...newPhrase,
                            russian: e.target.value,
                          })
                        }
                        placeholder="Введите перевод фразы"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phraseContext">
                        Контекст / Примечание
                      </Label>
                      <Input
                        id="phraseContext"
                        value={newPhrase.context}
                        onChange={(e) =>
                          setNewPhrase({
                            ...newPhrase,
                            context: e.target.value,
                          })
                        }
                        placeholder="Где используется эта фраза?"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddPhrase(false)}
                      >
                        Отмена
                      </Button>
                      <Button size="sm" onClick={handleAddPhrase}>
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить
                      </Button>
                    </div>
                  </div>
                )}

                {/* Список фраз */}
                {relatedPhrases.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Пока нет фраз со словом "{word.english}"</p>
                    <p className="text-sm mt-1">
                      Добавьте фразы, чтобы лучше запомнить слово в контексте
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relatedPhrases.map((phrase) => (
                      <div
                        key={phrase.id}
                        className="bg-gray-50 p-4 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-medium mb-1">{phrase.english}</p>
                            <p className="text-sm text-gray-600">
                              {phrase.russian}
                            </p>
                            {phrase.context && (
                              <p className="text-xs text-gray-400 mt-2">
                                {phrase.context}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSpeak(phrase.english)}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePhrase(phrase.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default WordDetail;
