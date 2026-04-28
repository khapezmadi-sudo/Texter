import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import {
  User,
  Mail,
  Key,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sun,
  Moon,
  Palette,
} from "lucide-react";

const themes = [
  { id: "light", label: "Светлая", icon: Sun },
  { id: "dark", label: "Темная", icon: Moon },
  { id: "blue", label: "Синяя", icon: Palette },
  { id: "green", label: "Зеленая", icon: Palette },
  { id: "purple", label: "Фиолетовая", icon: Palette },
] as const;

export function Settings() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [message, setMessage] = useState("");

  const handleChangePassword = async () => {
    setMessage("Функция смены пароля будет доступна позже");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Вы уверены? Это удалит все ваши данные безвозвратно."))
      return;
    if (!confirm("Точно? Все тексты, фразы и слова будут удалены навсегда."))
      return;

    setMessage("Для удаления аккаунта обратитесь к администратору");
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Настройки</h1>
            <p className="text-muted-foreground mt-1">Управление аккаунтом</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800">{message}</p>
            </div>
          )}

          {/* Profile Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Профиль
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input value={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">
                  Email нельзя изменить
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  ID пользователя
                </Label>
                <Input value={user?.id || ""} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Theme Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Тема оформления
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {themes.map((t) => (
                  <Button
                    key={t.id}
                    variant={theme === t.id ? "secondary" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setTheme(t.id)}
                  >
                    <t.icon className="h-4 w-4 mr-2" />
                    {t.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Безопасность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={handleChangePassword}
                className="w-full"
              >
                <Key className="h-4 w-4 mr-2" />
                Сменить пароль
              </Button>
            </CardContent>
          </Card>

          {/* Logout Card */}
          <Card className="mb-6 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <LogOut className="h-5 w-5" />
                Выход
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={signOut}
                className="w-full border-orange-200 hover:bg-orange-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выйти из аккаунта
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Опасная зона
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Удаление аккаунта приведёт к безвозвратной потере всех данных:
                  текстов, фраз, слов и истории переводов.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить аккаунт
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>TEXTER v1.0</p>
            <p>Английский язык через практику</p>
          </div>
        </div>
      </div>
    </div>
  );
}
