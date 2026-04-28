import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Home() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Texter</h1>
            <p className="text-gray-600">Изучай английский язык</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" onClick={signOut}>
              Выйти
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Мой прогресс</h2>
            <p className="text-gray-600">Начни учить слова уже сегодня!</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Упражнения</h2>
            <p className="text-gray-600">Практикуйся с интерактивными заданиями</p>
          </div>
        </div>
      </div>
    </div>
  )
}
