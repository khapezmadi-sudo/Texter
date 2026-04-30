import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Flame,
  Quote,
  Library,
  BookOpen,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getStreakInfo } from "@/lib/words";

export function Sidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadStreak = async () => {
      try {
        const info = await getStreakInfo();
        setStreak(info.currentStreak);
      } catch (error) {
        console.error("Error loading streak:", error);
      }
    };
    loadStreak();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Главная" },
    { path: "/texts", icon: FileText, label: "Переводы" },
    { path: "/reading", icon: BookOpen, label: "Чтение" },
    { path: "/phrases", icon: Quote, label: "Фразы" },
    { path: "/words", icon: Library, label: "Слова" },
    { path: "/stats", icon: BarChart3, label: "Статистика" },
    { path: "/settings", icon: Settings, label: "Настройки" },
  ];

  return (
    <div className="hidden lg:flex w-64 h-screen border-r bg-card flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold tracking-tight">TEXTER</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Переводи. Анализируй. Улучшайся.
        </p>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        <Separator className="my-4" />

        {streak > 0 && (
          <div className="px-3">
            <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-500 p-3 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-medium">Серия</span>
              </div>
              <p className="text-2xl font-bold">{streak} дней</p>
              <p className="text-xs opacity-80">Продолжай в том же духе!</p>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </Button>
      </div>
    </div>
  );
}
