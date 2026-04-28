import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Home,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  AlertCircle,
  CheckCircle2,
  Clock,
  Quote,
  Library,
  Flame,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface MobileNavProps {
  streak?: number;
}

export function MobileNav({ streak = 0 }: MobileNavProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Главная" },
    { path: "/texts", icon: FileText, label: "Тексты" },
    { path: "/phrases", icon: Quote, label: "Фразы" },
    { path: "/words", icon: Library, label: "Слова" },
    { path: "/stats", icon: BarChart3, label: "Статистика" },
    { path: "/settings", icon: Settings, label: "Настройки" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">TEXTER</h1>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-bold">{streak}</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-card border-l flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-bold">Меню</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto py-4">
              <div className="px-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                  >
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

              <div className="px-3 mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                  ФИЛЬТРЫ ТЕКСТОВ
                </p>
                <Link
                  to="/texts?filter=important"
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Важные
                  </Button>
                </Link>
                <Link
                  to="/texts?filter=drafts"
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                  >
                    <Clock className="h-4 w-4" />
                    Черновики
                  </Button>
                </Link>
                <Link
                  to="/texts?filter=completed"
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Завершённые
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
