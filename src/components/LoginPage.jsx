import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { login, saveTokens, SWAGGER_URL } from '@/lib/api'
import { useTheme } from '@/lib/theme'
import { Loader2, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sun, Moon, BookOpen, ExternalLink } from 'lucide-react'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { isDark, toggleTheme } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    setError('')
    setLoading(true)

    try {
      const res = await login(username, password)
      const jwtToken = res.data?.jwt
      const refreshToken = res.data?.refresh_token
      saveTokens(jwtToken, refreshToken, username)
      onLogin(username)
    } catch (err) {
      setError(err.message || 'Kredensial tidak valid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-[#09090b] flex flex-col justify-between text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors duration-200">
      {/* Background Subtle Tech Grid */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#52525b 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-zinc-400/10 dark:bg-zinc-800/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-6 sm:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-100 dark:text-zinc-900 shadow-sm">
            BRIN
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              Jelajahi Kawasan Terpadu BRIN
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Swagger API Docs Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(SWAGGER_URL, '_blank')}
            className="h-9 text-xs font-medium border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-zinc-500 dark:text-zinc-400" />
            API Docs
            <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-zinc-400 dark:text-zinc-500" />
          </Button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-zinc-600 dark:text-zinc-400"
            title="Ganti Tema"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Center Login Card */}
      <main className="relative z-10 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md shadow-xl rounded-xl">
          <CardContent className="p-7 space-y-6">
            <div className="space-y-1.5 text-center">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Login Admin
              </h1>
              <p className="text-xs text-zinc-500">
                Gunakan kredensial admin untuk mengelola Jelajahi Kawasan Terpadu BRIN
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Username
                </Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9 h-9 text-xs"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-9 text-xs"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full h-9 text-xs font-medium gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
              <span className="text-[11px] text-zinc-400 font-mono">
                Default: <strong className="text-zinc-600 dark:text-zinc-300">admin</strong> / <strong className="text-zinc-600 dark:text-zinc-300">admin123</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-xs text-zinc-500 font-mono">
        &copy; 2026 BRIN &bull; Kawasan Terpadu BRIN
      </footer>
    </div>
  )
}
