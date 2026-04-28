import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Quote,
  Library,
  TrendingUp,
  Target,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { getTexts } from "@/lib/texts";
import { getPhrases } from "@/lib/phrases";
import { getWords } from "@/lib/words";
import type { Text } from "@/types/database";
import type { Phrase } from "@/types/phrases";
import type { Word } from "@/types/words";

export function Stats() {
  const [texts, setTexts] = useState<Text[]>([]);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [textsData, phrasesData, wordsData] = await Promise.all([
          getTexts(),
          getPhrases(),
          getWords(),
        ]);
        setTexts(textsData);
        setPhrases(phrasesData);
        setWords(wordsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Texts stats
  const textStats = {
    total: texts.length,
    completed: texts.filter((t) => t.status === "completed").length,
    needsRetry: texts.filter((t) => t.status === "needs_retry").length,
    draft: texts.filter((t) => t.status === "draft").length,
    pending: texts.filter((t) => t.status === "pending_review").length,
  };

  // Phrases stats
  const phraseStats = {
    total: phrases.length,
    known: phrases.filter((p) => p.status === "known").length,
    learning: phrases.filter((p) => p.status === "learning").length,
    new: phrases.filter((p) => p.status === "new").length,
    totalReviews: phrases.reduce((sum, p) => sum + p.review_count, 0),
  };

  // Words stats
  const wordStats = {
    total: words.length,
    known: words.filter((w) => w.status === "known").length,
    learning: words.filter((w) => w.status === "learning").length,
    new: words.filter((w) => w.status === "new").length,
    totalReviews: words.reduce((sum, w) => sum + w.review_count, 0),
  };

  // Calculate streaks
  const today = new Date().toISOString().split("T")[0];
  const todayTexts = texts.filter(
    (t) => t.updated_at && t.updated_at.split("T")[0] === today,
  ).length;

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

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Статистика</h1>
            <p className="text-muted-foreground mt-1">
              Отслеживай свой прогресс
            </p>
          </div>

          {/* Overall progress */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Всего материалов
                    </p>
                    <p className="text-3xl font-bold">
                      {texts.length + phrases.length + words.length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Изучено сегодня
                    </p>
                    <p className="text-3xl font-bold">{todayTexts}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Повторений</p>
                    <p className="text-3xl font-bold">
                      {phraseStats.totalReviews + wordStats.totalReviews}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Достижения</p>
                    <p className="text-3xl font-bold">
                      {textStats.completed +
                        phraseStats.known +
                        wordStats.known}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Texts Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Тексты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{textStats.total}</p>
                  <p className="text-sm text-muted-foreground">Всего</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {textStats.completed}
                  </p>
                  <p className="text-sm text-green-600">Завершено</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {textStats.needsRetry}
                  </p>
                  <p className="text-sm text-red-600">На повторение</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {textStats.pending}
                  </p>
                  <p className="text-sm text-yellow-600">В работе</p>
                </div>
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <p className="text-2xl font-bold">{textStats.draft}</p>
                  <p className="text-sm text-muted-foreground">Черновики</p>
                </div>
              </div>
              {textStats.total > 0 && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{
                        width: `${(textStats.completed / textStats.total) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {Math.round((textStats.completed / textStats.total) * 100)}%
                    завершено
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Phrases Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5" />
                Фразы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{phraseStats.total}</p>
                  <p className="text-sm text-muted-foreground">Всего</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {phraseStats.known}
                  </p>
                  <p className="text-sm text-green-600">Знаю</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {phraseStats.learning}
                  </p>
                  <p className="text-sm text-yellow-600">Изучаю</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {phraseStats.new}
                  </p>
                  <p className="text-sm text-purple-600">Новые</p>
                </div>
              </div>
              {phraseStats.total > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {Math.round((phraseStats.known / phraseStats.total) * 100)}%
                    фраз изучено
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Words Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5" />
                Слова
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{wordStats.total}</p>
                  <p className="text-sm text-muted-foreground">Всего</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {wordStats.known}
                  </p>
                  <p className="text-sm text-green-600">Знаю</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {wordStats.learning}
                  </p>
                  <p className="text-sm text-yellow-600">Изучаю</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {wordStats.new}
                  </p>
                  <p className="text-sm text-purple-600">Новые</p>
                </div>
              </div>
              {wordStats.total > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {Math.round((wordStats.known / wordStats.total) * 100)}%
                    слов изучено
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {texts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Последние тексты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {texts.slice(0, 5).map((text) => (
                    <div
                      key={text.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{text.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(text.created_at).toLocaleDateString(
                            "ru-RU",
                          )}
                        </p>
                      </div>
                      <Badge
                        variant={
                          text.status === "completed"
                            ? "secondary"
                            : text.status === "needs_retry"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {text.status === "completed" && (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        {text.status === "needs_retry" && (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {text.status === "draft" && (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {text.status === "completed"
                          ? "Завершён"
                          : text.status === "needs_retry"
                            ? "На повторение"
                            : text.status === "pending_review"
                              ? "В работе"
                              : "Черновик"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
