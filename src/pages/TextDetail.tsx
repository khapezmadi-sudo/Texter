import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import {
  generateAIPrompt,
  parseAIResponse,
  type ErrorExample,
} from "@/lib/ai-prompt";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  History,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
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
  const [customErrorTypes, setCustomErrorTypes] = useState<string[]>([]);
  const [newErrorType, setNewErrorType] = useState("");
  const [notes, setNotes] = useState("");
  const [extractedWords, setExtractedWords] = useState("");
  const [errorExamples, setErrorExamples] = useState<ErrorExample[]>([]);

  // History and AI import states
  const [showHistory, setShowHistory] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showAIImport, setShowAIImport] = useState(false);
  const [copied, setCopied] = useState(false);
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

  // Функции для кастомных типов ошибок
  const handleAddErrorType = () => {
    if (
      newErrorType.trim() &&
      !customErrorTypes.includes(newErrorType.trim())
    ) {
      setCustomErrorTypes([...customErrorTypes, newErrorType.trim()]);
      setNewErrorType("");
    }
  };

  const handleRemoveErrorType = (type: string) => {
    setCustomErrorTypes(customErrorTypes.filter((t) => t !== type));
  };

  // Функция для импорта ответа от ИИ
  const handleImportAIResponse = () => {
    if (!aiResponse.trim()) return;

    const parsed = parseAIResponse(aiResponse);

    if (parsed.rating > 0) {
      setRating(parsed.rating);
    }

    if (parsed.error_types.length > 0) {
      // Обновляем стандартные чекбоксы если есть совпадения
      const standardErrors = {
        articles: false,
        tenses: false,
        prepositions: false,
        vocabulary: false,
        word_order: false,
        punctuation: false,
      };

      const customTypes: string[] = [];

      parsed.error_types.forEach((type) => {
        const lower = type.toLowerCase();
        if (lower.includes("артикл")) standardErrors.articles = true;
        else if (lower.includes("врем") || lower.includes(" tense"))
          standardErrors.tenses = true;
        else if (lower.includes("предлог")) standardErrors.prepositions = true;
        else if (lower.includes("лексик") || lower.includes("слов"))
          standardErrors.vocabulary = true;
        else if (lower.includes("порядок") || lower.includes("word order"))
          standardErrors.word_order = true;
        else if (lower.includes("пунктуац")) standardErrors.punctuation = true;
        else customTypes.push(type);
      });

      setErrors(standardErrors);
      setCustomErrorTypes(customTypes);
    }

    if (parsed.notes) {
      setNotes(parsed.notes);
    }

    if (parsed.words_to_learn.length > 0) {
      setExtractedWords(parsed.words_to_learn.join(", "));
    }

    if (parsed.error_examples.length > 0) {
      setErrorExamples(parsed.error_examples);
    }

    setShowAIImport(false);
    setAiResponse("");
  };

  // Функции для работы с примерами ошибок
  const handleAddErrorExample = () => {
    setErrorExamples([
      ...errorExamples,
      { original: "", error_type: "", corrected: "", explanation: "" },
    ]);
  };

  const handleUpdateErrorExample = (
    index: number,
    field: keyof ErrorExample,
    value: string,
  ) => {
    const updated = [...errorExamples];
    updated[index] = { ...updated[index], [field]: value };
    setErrorExamples(updated);
  };

  const handleRemoveErrorExample = (index: number) => {
    setErrorExamples(errorExamples.filter((_, i) => i !== index));
  };

  // Функция для копирования промпта
  const handleCopyPrompt = () => {
    const prompt = generateAIPrompt({
      originalText: text?.content || "",
      translatedText: translation,
      rating,
      errors,
      notes,
    });
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        custom_error_types: customErrorTypes,
        error_examples: errorExamples,
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

                  {/* Кастомные типы ошибок */}
                  <div className="mt-4">
                    <Label className="mb-2 block text-sm text-muted-foreground">
                      Свои типы ошибок
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {customErrorTypes.map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => handleRemoveErrorType(type)}
                        >
                          {type} ×
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Например: фразовые глаголы, согласование..."
                        value={newErrorType}
                        onChange={(e) => setNewErrorType(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddErrorType();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddErrorType}
                      >
                        Добавить
                      </Button>
                    </div>
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

                {/* Примеры ошибок */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Примеры ошибок</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddErrorExample}
                    >
                      Добавить пример
                    </Button>
                  </div>

                  {errorExamples.length === 0 && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Нет примеров. Добавь или импортируй из ИИ.
                    </p>
                  )}

                  <div className="space-y-3">
                    {errorExamples.map((example, index) => (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Оригинал (с ошибкой)
                              </Label>
                              <Input
                                value={example.original}
                                onChange={(e) =>
                                  handleUpdateErrorExample(
                                    index,
                                    "original",
                                    e.target.value,
                                  )
                                }
                                placeholder="i doctor"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Исправлено
                              </Label>
                              <Input
                                value={example.corrected}
                                onChange={(e) =>
                                  handleUpdateErrorExample(
                                    index,
                                    "corrected",
                                    e.target.value,
                                  )
                                }
                                placeholder="I am a doctor"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Тип ошибки
                              </Label>
                              <Input
                                value={example.error_type}
                                onChange={(e) =>
                                  handleUpdateErrorExample(
                                    index,
                                    "error_type",
                                    e.target.value,
                                  )
                                }
                                placeholder="артикли"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Почему так
                              </Label>
                              <Input
                                value={example.explanation}
                                onChange={(e) =>
                                  handleUpdateErrorExample(
                                    index,
                                    "explanation",
                                    e.target.value,
                                  )
                                }
                                placeholder="Нужен глагол to be и артикль"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 h-7"
                            onClick={() => handleRemoveErrorExample(index)}
                          >
                            Удалить пример
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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

                {/* AI анализ блок */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCopyPrompt}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Скопировано!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Копировать промпт для ИИ
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowAIImport(true)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Вставить ответ от ИИ
                    </Button>
                  </div>
                </div>

                {/* История попыток */}
                {attempts.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        История попыток ({attempts.length})
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(!showHistory)}
                      >
                        {showHistory ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Скрыть
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Показать
                          </>
                        )}
                      </Button>
                    </div>

                    {showHistory && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {attempts.map((attempt, index) => (
                          <Card key={attempt.id} className="bg-muted/50">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  Попытка {attempts.length - index}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">
                                    {"⭐".repeat(attempt.rating)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(
                                      attempt.created_at,
                                    ).toLocaleDateString("ru-RU")}
                                  </span>
                                </div>
                              </div>

                              {/* Типы ошибок */}
                              <div className="flex flex-wrap gap-1 mb-2">
                                {Object.entries(attempt.errors)
                                  .filter(([, hasError]) => hasError)
                                  .map(([key]) => {
                                    const labels: Record<string, string> = {
                                      articles: "Артикли",
                                      tenses: "Времена",
                                      prepositions: "Предлоги",
                                      vocabulary: "Лексика",
                                      word_order: "Порядок слов",
                                      punctuation: "Пунктуация",
                                    };
                                    return (
                                      <Badge
                                        key={key}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {labels[key] || key}
                                      </Badge>
                                    );
                                  })}
                                {attempt.custom_error_types?.map((type) => (
                                  <Badge
                                    key={type}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {type}
                                  </Badge>
                                ))}
                              </div>

                              {/* Заметки */}
                              {attempt.notes && (
                                <div className="text-sm text-muted-foreground mt-2">
                                  <p className="font-medium text-xs mb-1">
                                    Заметки:
                                  </p>
                                  <p className="line-clamp-3">
                                    {attempt.notes}
                                  </p>
                                </div>
                              )}

                              {/* Примеры ошибок в истории */}
                              {attempt.error_examples?.length > 0 && (
                                <div className="mt-2">
                                  <p className="font-medium text-xs mb-1">
                                    Примеры ошибок:
                                  </p>
                                  <div className="space-y-1">
                                    {attempt.error_examples.map(
                                      (
                                        ex: {
                                          original: string;
                                          corrected: string;
                                          error_type: string;
                                        },
                                        i: number,
                                      ) => (
                                        <div
                                          key={i}
                                          className="text-xs bg-white/50 p-2 rounded"
                                        >
                                          <span className="text-red-600 line-through">
                                            {ex.original}
                                          </span>
                                          {" → "}
                                          <span className="text-green-600">
                                            {ex.corrected}
                                          </span>
                                          <span className="text-muted-foreground ml-1">
                                            ({ex.error_type})
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Слова */}
                              {attempt.extracted_words.length > 0 && (
                                <div className="text-sm text-muted-foreground mt-2">
                                  <p className="font-medium text-xs mb-1">
                                    Слова:
                                  </p>
                                  <p>{attempt.extracted_words.join(", ")}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog для импорта ответа от ИИ */}
      {showAIImport && (
        <Dialog open={showAIImport} onOpenChange={setShowAIImport}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Импорт анализа от ИИ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Вставь ответ от ИИ в формате:
                <br />
                ### ОЦЕНКА: 4
                <br />
                ### ТИПЫ ОШИБОК: артикли, предлоги
                <br />
                ### ЗАМЕТКИ: ...
                <br />
                ### СЛОВА ДЛЯ ЗАПОМИНАНИЯ: word1, word2
              </p>
              <Textarea
                placeholder="Вставь ответ от ИИ здесь..."
                value={aiResponse}
                onChange={(e) => setAiResponse(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAIImport(false)}>
                Отмена
              </Button>
              <Button
                onClick={handleImportAIResponse}
                disabled={!aiResponse.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Импортировать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
