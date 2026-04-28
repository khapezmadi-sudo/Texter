import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Plus,
  TrendingUp,
  Calendar,
  Quote,
  Library,
} from "lucide-react";
import { getTexts } from "@/lib/texts";
import { getPhrases } from "@/lib/phrases";
import { getWords, getStreakInfo } from "@/lib/words";
import type { Text } from "@/types/database";
import type { Phrase } from "@/types/phrases";
import type { Word } from "@/types/words";

export function Home() {
  const [texts, setTexts] = useState<Text[]>([]);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [streak, setStreak] = useState(0);
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

    // Load streak separately so it doesn't break main data
    const loadStreak = async () => {
      try {
        const streakInfo = await getStreakInfo();
        setStreak(streakInfo.currentStreak);
      } catch (error) {
        console.error("Error loading streak:", error);
      }
    };
    loadStreak();
  }, []);

  const stats = {
    texts: {
      total: texts.length,
      inProgress: texts.filter((t) => t.status === "pending_review").length,
      important: texts.filter((t) => t.status === "needs_retry").length,
      completed: texts.filter((t) => t.status === "completed").length,
    },
    phrases: {
      total: phrases.length,
      known: phrases.filter((p) => p.status === "known").length,
      learning: phrases.filter((p) => p.status === "learning").length,
    },
    words: {
      total: words.length,
      known: words.filter((w) => w.status === "known").length,
      learning: words.filter((w) => w.status === "learning").length,
    },
  };

  const recentTexts = texts.slice(0, 5);

  const getStatusBadge = (status: Text["status"]) => {
    switch (status) {
      case "needs_retry":
        return <Badge variant="destructive">Важный</Badge>;
      case "completed":
        return <Badge variant="secondary">Завершён</Badge>;
      case "draft":
        return <Badge variant="outline">Черновик</Badge>;
      default:
        return <Badge variant="outline">В работе</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <MobileNav streak={streak} />
        <div className="flex-1 flex items-center justify-center pt-14 lg:pt-0">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MobileNav streak={streak} />
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Главная</h1>
            <p className="text-muted-foreground mt-1">
              Твой прогресс и быстрые действия
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Текстов</p>
                    <p className="text-3xl font-bold">{stats.texts.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Фраз</p>
                    <p className="text-3xl font-bold">{stats.phrases.total}</p>
                  </div>
                  <Quote className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Слов</p>
                    <p className="text-3xl font-bold">{stats.words.total}</p>
                  </div>
                  <Library className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Изучено</p>
                    <p className="text-3xl font-bold">
                      {stats.texts.completed +
                        stats.phrases.known +
                        stats.words.known}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Прогресс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Тексты</span>
                      <span className="text-muted-foreground">
                        {stats.texts.completed}/{stats.texts.total}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{
                          width: stats.texts.total
                            ? `${(stats.texts.completed / stats.texts.total) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Фразы</span>
                      <span className="text-muted-foreground">
                        {stats.phrases.known}/{stats.phrases.total}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{
                          width: stats.phrases.total
                            ? `${(stats.phrases.known / stats.phrases.total) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Слова</span>
                      <span className="text-muted-foreground">
                        {stats.words.known}/{stats.words.total}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{
                          width: stats.words.total
                            ? `${(stats.words.known / stats.words.total) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Быстрые действия
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/texts/new">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить текст
                  </Button>
                </Link>
                <Link to="/phrases">
                  <Button className="w-full justify-start" variant="outline">
                    <Quote className="h-4 w-4 mr-2" />
                    Практиковать фразы
                  </Button>
                </Link>
                <Link to="/words">
                  <Button className="w-full justify-start" variant="outline">
                    <Library className="h-4 w-4 mr-2" />
                    Учить слова
                  </Button>
                </Link>
                {stats.texts.important > 0 && (
                  <Link to="/texts?filter=important">
                    <Button className="w-full justify-start" variant="outline">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                      Повторить важные ({stats.texts.important})
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Texts */}
          {recentTexts.length > 0 && (
            <Card className="mt-4 lg:mt-6">
              <CardHeader>
                <CardTitle>Недавние тексты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTexts.map((text) => (
                    <Link key={text.id} to={`/texts/${text.id}`}>
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{text.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(text.status)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(text.created_at).toLocaleDateString(
                              "ru-RU",
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
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
