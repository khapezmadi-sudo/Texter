import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";
import { createText } from "@/lib/texts";

const SUGGESTED_TAGS = [
  "Наука",
  "Технологии",
  "Бизнес",
  "Худлит",
  "Новости",
  "Повседневное",
  "Путешествия",
  "История",
];

export function NewText() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [source, setSource] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      await createText({
        title: title.trim(),
        content: content.trim(),
        tags,
        source: source.trim() || undefined,
        difficulty,
        status: "draft",
      });
      navigate("/texts");
    } catch (error) {
      console.error("Error creating text:", error);
    } finally {
      setSaving(false);
    }
  };

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/texts")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к текстам
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Новый текст для перевода</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    placeholder="Например: Статья про ИИ из Хабра"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Темы / Теги</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Добавить тег..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag())
                      }
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SUGGESTED_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => addSuggestedTag(tag)}
                      >
                        + {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Источник (опционально)</Label>
                  <Input
                    id="source"
                    placeholder="https://... или название книги"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Уровень сложности</Label>
                  <div className="flex gap-4">
                    {(["easy", "medium", "hard"] as const).map((d) => (
                      <label
                        key={d}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="difficulty"
                          checked={difficulty === d}
                          onChange={() => setDifficulty(d)}
                        />
                        <span
                          className={
                            d === "easy"
                              ? "text-green-600"
                              : d === "medium"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }
                        >
                          {d === "easy" && "Лёгкий"}
                          {d === "medium" && "Средний"}
                          {d === "hard" && "Сложный"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Текст на русском</Label>
                  <Textarea
                    id="content"
                    placeholder="Вставь текст для перевода..."
                    className="min-h-[200px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {wordCount} слов
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={saving || !title.trim() || !content.trim()}
                  >
                    {saving ? "Сохранение..." : "Сохранить и начать перевод"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/texts")}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
