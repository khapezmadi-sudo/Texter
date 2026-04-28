import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { getRandomPhrases, updatePhrase } from "@/lib/phrases";
import type { Phrase, PracticeSession } from "@/types/phrases";

export function PhrasePractice() {
  const navigate = useNavigate();
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhrases();
  }, []);

  async function loadPhrases() {
    try {
      const data = await getRandomPhrases(10);
      setPhrases(data);
    } catch (error) {
      console.error("Error loading phrases:", error);
    } finally {
      setLoading(false);
    }
  }

  const currentPhrase = phrases[currentIndex];

  const handleCheck = () => {
    if (!userAnswer.trim()) return;

    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedCorrect = currentPhrase.russian.toLowerCase().trim();
    const correct =
      normalizedUser === normalizedCorrect ||
      normalizedCorrect.includes(normalizedUser) ||
      normalizedUser.includes(normalizedCorrect);

    setSessions([
      ...sessions,
      {
        phrase: currentPhrase,
        userAnswer: userAnswer.trim(),
        correct,
        showedAnswer: showAnswer,
      },
    ]);

    if (!showAnswer) {
      updatePhraseStatus(correct);
    }

    setShowAnswer(true);
  };

  const updatePhraseStatus = async (correct: boolean) => {
    try {
      const newStatus = correct ? "known" : "learning";
      const newCount = currentPhrase.review_count + 1;
      await updatePhrase(currentPhrase.id, {
        status: newStatus,
        review_count: newCount,
        last_reviewed: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating phrase:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowAnswer(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setShowAnswer(false);
    setCompleted(false);
    setSessions([]);
    loadPhrases();
  };

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentPhrase.english);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
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

  if (phrases.length === 0) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <MobileNav />
        <div className="flex-1 flex items-center justify-center pt-14 lg:pt-0">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Нет фраз для практики
              </p>
              <Button onClick={() => navigate("/phrases")}>
                Добавить фразы
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (completed) {
    const correctCount = sessions.filter((s) => s.correct).length;
    const showedAnswerCount = sessions.filter((s) => s.showedAnswer).length;

    return (
      <div className="flex h-screen">
        <Sidebar />
        <MobileNav />
        <div className="flex-1 overflow-auto pt-14 lg:pt-0">
          <div className="p-4 lg:p-8 max-w-2xl mx-auto">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/phrases")}
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
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {correctCount}
                    </p>
                    <p className="text-sm text-green-600">Правильно</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {sessions.length - correctCount}
                    </p>
                    <p className="text-sm text-red-600">Неправильно</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {showedAnswerCount}
                    </p>
                    <p className="text-sm text-blue-600">С подсказкой</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {sessions.map((session, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-left ${
                        session.correct ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      <p className="font-medium">{session.phrase.english}</p>
                      <p className="text-sm">
                        Твой ответ: {session.userAnswer}
                        {!session.correct && (
                          <span className="text-muted-foreground">
                            {" "}
                            (правильно: {session.phrase.russian})
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handleRestart}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Новая сессия
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/phrases")}
                  >
                    К фразам
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate("/phrases")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Выход
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {phrases.length}
              </span>
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{
                    width: `${((currentIndex + 1) / phrases.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">{currentPhrase.category}</Badge>
                <Button variant="ghost" size="sm" onClick={handleSpeak}>
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-2xl font-medium text-center mb-8">
                {currentPhrase.english}
              </p>

              {currentPhrase.context && (
                <p className="text-sm text-muted-foreground text-center mb-6 italic">
                  "{currentPhrase.context}"
                </p>
              )}

              <div className="space-y-4">
                <Input
                  placeholder="Введи перевод на русском..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !showAnswer && handleCheck()
                  }
                  disabled={showAnswer}
                  className="text-lg text-center"
                />

                {!showAnswer ? (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleCheck}
                      disabled={!userAnswer.trim()}
                    >
                      Проверить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAnswer(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Показать ответ
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-lg ${
                        sessions[sessions.length - 1]?.correct
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {sessions[sessions.length - 1]?.correct ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span
                          className={
                            sessions[sessions.length - 1]?.correct
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {sessions[sessions.length - 1]?.correct
                            ? "Правильно!"
                            : "Неправильно"}
                        </span>
                      </div>
                      <p className="font-medium">
                        Правильный ответ: {currentPhrase.russian}
                      </p>
                      {userAnswer && userAnswer !== currentPhrase.russian && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Твой ответ: {userAnswer}
                        </p>
                      )}
                    </div>

                    <Button className="w-full" onClick={handleNext}>
                      {currentIndex < phrases.length - 1 ? (
                        <>
                          Дальше <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        "Завершить"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
