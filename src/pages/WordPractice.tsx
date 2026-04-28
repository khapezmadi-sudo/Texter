import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  Trophy,
  CheckCircle2,
  XCircle,
  Flame,
  Target,
  Keyboard,
  Eye,
} from "lucide-react";
import { getWordsDueForReview, updateWordWithSRS } from "@/lib/words";
import type { Word, WordPracticeSession, QualityRating } from "@/types/words";

// String similarity function (Levenshtein distance based)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 100;

  const distance = levenshteinDistance(longer, shorter);
  return Math.round(((longer.length - distance) / longer.length) * 100);
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1),
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

export function WordPractice() {
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessions, setSessions] = useState<WordPracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<"en-to-ru" | "ru-to-en">(
    "en-to-ru",
  );
  const [userAnswer, setUserAnswer] = useState("");
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      const data = await getWordsDueForReview(20);
      setWords(data);
    } catch (error) {
      console.error("Error loading words:", error);
    } finally {
      setLoading(false);
    }
  }

  const currentWord = words[currentIndex];

  const handleCheckAnswer = () => {
    if (!currentWord || !userAnswer.trim()) return;

    const correctAnswer =
      direction === "en-to-ru" ? currentWord.russian : currentWord.english;
    const sim = calculateSimilarity(userAnswer, correctAnswer);
    setSimilarity(sim);
    setShowAnswer(true);
  };

  const handleQualityRating = (quality: QualityRating) => {
    if (!currentWord) return;

    const isCorrect = similarity !== null && similarity >= 70;

    setSessions((prevSessions) => [
      ...prevSessions,
      {
        word: currentWord,
        userAnswer: userAnswer.trim(),
        correct: isCorrect,
        showedAnswer: similarity !== null && similarity < 70,
        quality,
      },
    ]);

    // Update streak
    if (quality >= 3) {
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }

    // Update word with SRS
    updateWordWithSRS(currentWord.id, quality, userAnswer.trim());
    handleNext();
  };

  const handleNext = () => {
    setShowAnswer(false);
    setUserAnswer("");
    setSimilarity(null);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCompleted(false);
    setSessions([]);
    setUserAnswer("");
    setSimilarity(null);
    setStreak(0);
    loadWords();
  };

  const handleSpeak = () => {
    if ("speechSynthesis" in window && currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord.english);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const getQualityLabel = (quality: QualityRating): string => {
    const labels: Record<QualityRating, string> = {
      5: "Идеально",
      4: "С трудом",
      3: "Правильно",
      2: "Забыл",
      1: "Напомнили",
      0: "Не знаю",
    };
    return labels[quality];
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground mb-4">
                Нет слов на сегодня!
                <br />
                Все слова повторены.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate("/words")}>
                  Добавить слова
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/words/practice/all")}
                >
                  Практиковать всё
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (completed) {
    const correctCount = sessions.filter((s) => s.correct).length;
    const avgQuality =
      sessions.length > 0
        ? Math.round(
            (sessions.reduce((sum, s) => sum + (s.quality || 0), 0) /
              sessions.length) *
              10,
          ) / 10
        : 0;

    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-8 max-w-2xl mx-auto">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/words")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>

            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Сессия завершена!</h2>
                <p className="text-muted-foreground mb-6">
                  {correctCount} из {sessions.length} правильно
                  {avgQuality > 0 && ` • Средняя оценка: ${avgQuality}`}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {correctCount}
                    </p>
                    <p className="text-sm text-green-600">Правильно</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {streak}
                    </p>
                    <p className="text-sm text-orange-600">Серия</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {sessions.length}
                    </p>
                    <p className="text-sm text-blue-600">Всего</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sessions.map((session, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-left ${
                        session.quality && session.quality >= 3
                          ? "bg-green-50"
                          : session.quality && session.quality >= 2
                            ? "bg-yellow-50"
                            : "bg-red-50"
                      }`}
                    >
                      <div className="flex justify-between">
                        <p className="font-medium">{session.word.english}</p>
                        <Badge
                          variant={
                            session.quality && session.quality >= 4
                              ? "default"
                              : "outline"
                          }
                        >
                          {session.quality !== undefined
                            ? getQualityLabel(session.quality as QualityRating)
                            : "-"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Твой ответ: {session.userAnswer || "-"} | Правильно:{" "}
                        {session.word.russian}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handleRestart}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Новая сессия
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/words")}>
                    К словам
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const frontText =
    direction === "en-to-ru" ? currentWord.english : currentWord.russian;
  const backText =
    direction === "en-to-ru" ? currentWord.russian : currentWord.english;
  const showTranscription =
    direction === "en-to-ru" && currentWord.transcription;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate("/words")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Выход
            </Button>
            <div className="flex items-center gap-3">
              {/* Streak */}
              {streak > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold">{streak}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={direction === "en-to-ru" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDirection("en-to-ru")}
                >
                  EN → RU
                </Button>
                <Button
                  variant={direction === "ru-to-en" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDirection("ru-to-en")}
                >
                  RU → EN
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {words.length}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>

          {/* Word Card */}
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <Badge variant="outline" className="mb-4">
                {currentWord.part_of_speech}
              </Badge>
              <p className="text-4xl font-bold mb-4">{frontText}</p>
              {showTranscription && (
                <p className="text-muted-foreground mb-4">
                  {currentWord.transcription}
                </p>
              )}
              {direction === "en-to-ru" && (
                <Button variant="ghost" size="sm" onClick={handleSpeak}>
                  <Volume2 className="h-4 w-4 mr-1" />
                  Прослушать
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Answer Input Section */}
          {!showAnswer ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Введи перевод..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userAnswer.trim()) {
                      handleCheckAnswer();
                    }
                  }}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  onClick={handleCheckAnswer}
                  disabled={!userAnswer.trim()}
                >
                  <Keyboard className="h-4 w-4 mr-2" />
                  Проверить
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowAnswer(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Не помню, показать ответ
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Show correct answer */}
              <Card
                className={
                  similarity !== null
                    ? similarity >= 70
                      ? "border-green-500"
                      : similarity >= 40
                        ? "border-yellow-500"
                        : "border-red-500"
                    : "border-gray-300"
                }
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Правильный ответ:
                    </p>
                    <p className="text-2xl font-bold">{backText}</p>
                  </div>
                  {similarity !== null && (
                    <div className="text-center">
                      <p
                        className={`text-lg font-bold ${similarity >= 70 ? "text-green-600" : similarity >= 40 ? "text-yellow-600" : "text-red-600"}`}
                      >
                        Схожесть: {similarity}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Твой ответ: {userAnswer}
                      </p>
                    </div>
                  )}
                  {currentWord.example && (
                    <p className="text-sm text-muted-foreground text-center italic mt-4">
                      &ldquo;{currentWord.example}&rdquo;
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* SRS Quality Ratings */}
              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                  Как хорошо ты знал это слово?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="border-red-300 hover:bg-red-50"
                    onClick={() => handleQualityRating(0 as QualityRating)}
                  >
                    <XCircle className="h-4 w-4 mr-1 text-red-600" />0 – Не знаю
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 hover:bg-red-50"
                    onClick={() => handleQualityRating(1 as QualityRating)}
                  >
                    1 – Напомнили
                  </Button>
                  <Button
                    variant="outline"
                    className="border-orange-200 hover:bg-orange-50"
                    onClick={() => handleQualityRating(2 as QualityRating)}
                  >
                    2 – Забыл
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-200 hover:bg-yellow-50"
                    onClick={() => handleQualityRating(3 as QualityRating)}
                  >
                    3 – С трудом
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-50"
                    onClick={() => handleQualityRating(4 as QualityRating)}
                  >
                    4 – Хорошо
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-200 hover:bg-green-50"
                    onClick={() => handleQualityRating(5 as QualityRating)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />5 –
                    Идеально
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
