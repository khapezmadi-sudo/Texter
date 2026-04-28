import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Trash2,
} from "lucide-react";
import { getTexts, deleteText } from "@/lib/texts";
import type { Text } from "@/types/database";

export function Texts() {
  const [texts, setTexts] = useState<Text[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<
    "all" | "important" | "drafts" | "completed"
  >("all");

  useEffect(() => {
    const loadTexts = async () => {
      try {
        const data = await getTexts();
        setTexts(data);
      } catch (error) {
        console.error("Error loading texts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTexts();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Удалить этот текст?")) return;
    try {
      await deleteText(id);
      const data = await getTexts();
      setTexts(data);
    } catch (error) {
      console.error("Error deleting text:", error);
    }
  };

  const filteredTexts = texts.filter((text) => {
    const matchesSearch =
      text.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      text.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    if (!matchesSearch) return false;

    if (filter === "all") return true;
    if (filter === "important") return text.status === "needs_retry";
    if (filter === "drafts") return text.status === "draft";
    if (filter === "completed") return text.status === "completed";
    return true;
  });

  const getStatusBadge = (status: Text["status"]) => {
    switch (status) {
      case "needs_retry":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Важный
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Завершён
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Черновик
          </Badge>
        );
      default:
        return <Badge variant="outline">В работе</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: Text["difficulty"]) => {
    const colors = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-red-100 text-red-800",
    };
    const labels = { easy: "Лёгкий", medium: "Средний", hard: "Сложный" };
    return (
      <span className={`text-xs px-2 py-0.5 rounded ${colors[difficulty]}`}>
        {labels[difficulty]}
      </span>
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-3xl font-bold">Мои тексты</h1>
              <p className="text-muted-foreground mt-1">
                Переводи тексты и анализируй ошибки
              </p>
            </div>
            <Link to="/texts/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить текст
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или содержимому..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={filter === "all" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Все
              </Button>
              <Button
                variant={filter === "important" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter("important")}
              >
                Важные
              </Button>
              <Button
                variant={filter === "drafts" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter("drafts")}
              >
                Черновики
              </Button>
              <Button
                variant={filter === "completed" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
              >
                Завершённые
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : filteredTexts.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Нет текстов. Добавь первый!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTexts.map((text) => (
                <Link key={text.id} to={`/texts/${text.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(text.status)}
                            {getDifficultyBadge(text.difficulty)}
                          </div>
                          <h3 className="text-lg font-semibold">
                            {text.title}
                          </h3>
                          {text.source && (
                            <p className="text-sm text-muted-foreground">
                              {text.source}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDelete(e, text.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 flex-wrap">
                        {text.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(text.created_at).toLocaleDateString(
                            "ru-RU",
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
