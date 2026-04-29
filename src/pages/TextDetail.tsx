import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { AIPromptButton } from "@/components/AIPromptButton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Save,
  Star,
  BookOpen,
  Pencil,
  X,
} from "lucide-react";
import {
  getText,
  getTranslationAttempts,
  createTranslationAttempt,
  updateText,
} from "@/lib/texts";
import type { Text, TranslationAttempt } from "@/types/database";

export function TextDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [text, setText] = useState<Text | null>(null);
  const [translation, setTranslation] = useState("");
  const [attempts, setAttempts] = useState<TranslationAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);

  // Analysis form state
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState({
    articles: false,
    tenses: false,
    prepositions: false,
    vocabulary: false,
    word_order: false,
    punctuation: false,
  });
  const [notes, setNotes] = useState("");
  const [extractedWords, setExtractedWords] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editDifficulty, setEditDifficulty] =
    useState<Text["difficulty"]>("medium");

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [textData, attemptsData] = await Promise.all([
          getText(id),
          getTranslationAttempts(id),
        ]);
        setText(textData);
        setAttempts(attemptsData);
        if (attemptsData.length > 0 && attemptsData[0].translation) {
          setTranslation(attemptsData[0].translation);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTranslation = (isNewAttempt = false) => {
    // If new attempt, reset translation and timer
    if (isNewAttempt) {
      setTranslation("");
      setElapsedTime(0);
    }
    setIsTimerRunning(true);
    if (text?.status === "draft") {
      updateText(text.id, { status: "pending_review" });
    }
  };

  const handleContinueOld = () => {
    if (previousAttempt) {
      setTranslation(previousAttempt.translation);
      // Optionally restore time if you want to continue timing
      // setElapsedTime(previousAttempt.duration_seconds || 0);
      setElapsedTime(0); // Start fresh but with old text
      setIsTimerRunning(true);
    }
  };

  const handleComplete = () => {
    setIsTimerRunning(false);
    setShowAnalysis(true);
    // Scroll to analysis after a short delay to let it render
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleSaveAnalysis = async () => {
    if (!text || !translation.trim()) return;

    setSaving(true);
    try {
      await createTranslationAttempt({
        text_id: text.id,
        translation: translation.trim(),
        rating,
        errors,
        notes: notes.trim(),
        extracted_words: extractedWords
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean),
        duration_seconds: elapsedTime,
      });

      const newStatus = rating >= 4 ? "completed" : "needs_retry";
      await updateText(text.id, { status: newStatus });

      navigate("/texts");
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <MobileNav />
        <div className="flex-1 flex items-center justify-center pt-14 lg:pt-0">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <MobileNav />
        <div className="flex-1 flex items-center justify-center pt-14 lg:pt-0">
          <p>Текст не найден</p>
        </div>
      </div>
    );
  }

  const isImportant = text.status === "needs_retry";
  const previousAttempt = attempts[0];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-6xl">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/texts")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>

          {isImportant && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">
                  Важный текст требует повторения
                </p>
                {previousAttempt && (
                  <p className="text-sm text-red-600">
                    Предыдущая попытка: {previousAttempt.rating}/5,{" "}
                    {
                      Object.values(previousAttempt.errors).filter(Boolean)
                        .length
                    }{" "}
                    типов ошибок
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {text.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
              <span
                className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
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
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  if (!isEditing) {
                    setEditTitle(text.title);
                    setEditContent(text.content);
                    setEditSource(text.source || "");
                    setEditTags(text.tags.join(", "));
                    setEditDifficulty(text.difficulty);
                  }
                  setIsEditing(!isEditing);
                }}
              >
                <Pencil className="h-4 w-4 mr-1" />
                {isEditing ? "Отмена" : "Редактировать"}
              </Button>
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-xl font-bold"
                />
                <Input
                  placeholder="Источник (опционально)"
                  value={editSource}
                  onChange={(e) => setEditSource(e.target.value)}
                />
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label className="text-xs">Теги (через запятую)</Label>
                    <Input
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Сложность</Label>
                    <select
                      value={editDifficulty}
                      onChange={(e) =>
                        setEditDifficulty(e.target.value as Text["difficulty"])
                      }
                      className="border rounded px-2 py-2 text-sm"
                    >
                      <option value="easy">Лёгкий</option>
                      <option value="medium">Средний</option>
                      <option value="hard">Сложный</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        await updateText(text.id, {
                          title: editTitle,
                          content: editContent,
                          source: editSource || undefined,
                          tags: editTags
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                          difficulty: editDifficulty,
                        });
                        setText({
                          ...text,
                          title: editTitle,
                          content: editContent,
                          source: editSource || undefined,
                          tags: editTags
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                          difficulty: editDifficulty,
                        });
                        setIsEditing(false);
                      } catch (error) {
                        console.error("Error updating text:", error);
                      }
                    }}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Сохранить
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold">{text.title}</h1>
                {text.source && (
                  <p className="text-muted-foreground">{text.source}</p>
                )}
              </>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Русский текст
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {text.content}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(text.content)}
                  >
                    Копировать
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Мой перевод
                  </span>
                  {isTimerRunning && (
                    <span className="text-lg font-mono text-blue-600">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {formatTime(elapsedTime)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isTimerRunning && !showAnalysis && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      {previousAttempt
                        ? "Этот текст уже переводился. Хочешь попробовать снова?"
                        : "Готов начать перевод?"}
                    </p>
                    <Button
                      onClick={() => handleStartTranslation(!!previousAttempt)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {previousAttempt ? "Новая попытка" : "Начать перевод"}
                    </Button>
                    {previousAttempt && (
                      <Button
                        variant="outline"
                        className="ml-2"
                        onClick={handleContinueOld}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Продолжить старый
                      </Button>
                    )}
                  </div>
                )}

                {(isTimerRunning || showAnalysis) && (
                  <>
                    <Textarea
                      className="min-h-[300px]"
                      placeholder="Пиши свой перевод здесь..."
                      value={translation}
                      onChange={(e) => setTranslation(e.target.value)}
                      disabled={showAnalysis}
                    />
                    {!showAnalysis && (
                      <Button
                        className="w-full mt-4"
                        onClick={handleComplete}
                        disabled={!translation.trim()}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Завершить и проверить
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {showAnalysis && (
            <Card ref={analysisRef} className="mt-6">
              <CardHeader>
                <CardTitle>Анализ перевода</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">Оцени свой перевод</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${rating >= star ? "text-yellow-500" : "text-gray-300"}`}
                      >
                        <Star
                          className="h-8 w-8"
                          fill={rating >= star ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground self-center">
                      {rating === 1 && "Ужасно"}
                      {rating === 2 && "Плохо"}
                      {rating === 3 && "Нормально"}
                      {rating === 4 && "Хорошо"}
                      {rating === 5 && "Отлично"}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Типы ошибок</Label>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries({
                      articles: "Артикли",
                      tenses: "Времена",
                      prepositions: "Предлоги",
                      vocabulary: "Лексика",
                      word_order: "Порядок слов",
                      punctuation: "Пунктуация",
                    }).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={errors[key as keyof typeof errors]}
                          onChange={(e) =>
                            setErrors({ ...errors, [key]: e.target.checked })
                          }
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Подробные заметки</Label>
                  <Textarea
                    id="notes"
                    placeholder="Опиши конкретные ошибки и что исправил..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="words">
                    Слова для запоминания (через запятую)
                  </Label>
                  <Input
                    id="words"
                    placeholder="utilize, however, significant..."
                    value={extractedWords}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setExtractedWords(e.target.value)
                    }
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    className="flex-1"
                    onClick={handleSaveAnalysis}
                    disabled={saving || rating === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving
                      ? "Сохранение..."
                      : rating >= 4
                        ? "Отметить завершённым"
                        : "Пометить для повторения"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAnalysis(false)}
                  >
                    Назад к переводу
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <AIPromptButton
                    originalText={text?.content || ""}
                    translatedText={translation}
                    rating={rating}
                    errors={errors}
                    notes={notes}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
