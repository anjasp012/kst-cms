import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { login, saveTokens, SWAGGER_URL } from '@/lib/api'
import { useTheme } from '@/lib/theme'
import { 
  Loader2, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Sun, 
  Moon, 
  BookOpen, 
  ExternalLink 
} from 'lucide-react'

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
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-[#09090b] flex flex-col text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors duration-200">
      {/* Background Subtle Tech Grid & Ambient Radial Glow */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#71717a 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/5 dark:bg-primary/5 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-6 sm:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
            BRIN
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              Kawasan Terpadu BRIN
            </div>
            <div className="text-[11px] text-zinc-500 font-normal">
              Portal Manajemen Kawasan & Data Spasial
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Swagger API Docs Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(SWAGGER_URL, '_blank')}
            className="h-8 text-xs font-medium border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-zinc-500 dark:text-zinc-400" />
            API Docs
            <ExternalLink className="w-3 h-3 ml-1 text-zinc-400 dark:text-zinc-500" />
          </Button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-zinc-600 dark:text-zinc-400"
            title="Ganti Tema"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Center Login Card: flex-1 ensures it is perfectly centered vertically & horizontally */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 pb-12">
        <Card className="w-full max-w-[420px] border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl rounded-2xl transition-all">
          <CardContent className="p-7 sm:p-8 space-y-6">
            {/* Header / Logo Icon */}
            <div className="space-y-3 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm ring-4 ring-primary/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Login CMS Admin
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Masuk untuk mengelola data kawasan, peta, dan master data
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5 text-xs text-destructive animate-in fade-in">
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
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9 h-10 rounded-xl"
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
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-10 rounded-xl"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full h-10 rounded-xl text-xs font-semibold gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <span className="text-[11px] text-zinc-400 font-mono">
                Default: <strong className="text-zinc-600 dark:text-zinc-300">admin</strong> / <strong className="text-zinc-600 dark:text-zinc-300">admin123</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
