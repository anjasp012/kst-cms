import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Users,
  Compass,
  Layers,
  Clock,
  TrendingUp,
  Award,
  Sparkles,
  MessageSquare
} from 'lucide-react'

export default function ModuleUsageView({ moduleUsage, loading }) {
  const {
    summary = {},
    persona_stats = [],
    zone_stats = [],
    top_combinations = [],
    recent_logs = []
  } = moduleUsage || {}

  // Find max usage for progress calculation
  const maxPersonaUsage = Math.max(...persona_stats.map(p => p.usage_count), 1)
  const maxZoneUsage = Math.max(...zone_stats.map(z => z.usage_count), 1)

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Banner */}
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Statistik interaksi pengunjung pameran: frekuensi pemilihan Modul Pengguna, Token Tantangan, dan kombinasi terpopuler.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Modul Pengguna
              </span>
              <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono animate-counter">
                {summary.total_persona_types || 8}
              </div>
              <span className="text-[11px] text-zinc-400 font-mono block">
                Modul Pengguna Aktif
              </span>
            </div>
            <div className="p-2.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Token Tantangan
              </span>
              <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono animate-counter">
                {summary.total_zone_types || 9}
              </div>
              <span className="text-[11px] text-zinc-400 font-mono block">
                Zona Riset BRIN
              </span>
            </div>
            <div className="p-2.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <Compass className="w-4 h-4" />
            </div>
          </div>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Usulan Riset Masuk
              </span>
              <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono animate-counter">
                {summary.total_suggestions_submitted || 0}
              </div>
              <span className="text-[11px] text-zinc-400 font-mono block">
                Dari pengunjung meja
              </span>
            </div>
            <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </div>

      {/* 2 Column Grid: Persona Usage vs Zone Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Modul Pengguna Usage List */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <div>
                <CardTitle className="text-sm font-semibold">
                  Histori Pemakaian Modul Pengguna
                </CardTitle>
                <CardDescription className="text-xs">
                  Berapa kali modul pengguna dipilih pengunjung
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {persona_stats.map((p, idx) => {
              const pct = Math.round((p.usage_count / maxPersonaUsage) * 100)
              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 text-[11px]">#{idx + 1}</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200 font-sans">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400">{p.suggestion_count} usulan</span>
                      <Badge variant="default" className="font-mono">
                        {p.usage_count}x dipakai
                      </Badge>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Token Tantangan (Zona Riset) Usage List */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <div>
                <CardTitle className="text-sm font-semibold">
                  Histori Pemakaian Token Tantangan
                </CardTitle>
                <CardDescription className="text-xs">
                  Berapa kali token tantangan dipilih pengunjung
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {zone_stats.map((z, idx) => {
              const pct = Math.round((z.usage_count / maxZoneUsage) * 100)
              return (
                <div key={z.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded text-[10px] text-white flex items-center justify-center font-bold bg-blue-500"
                      >
                        {z.name.charAt(0)}
                      </span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200 font-sans">{z.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400">{z.suggestion_count} usulan</span>
                      <Badge variant="approved" className="font-mono">
                        {z.usage_count}x dipakai
                      </Badge>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-blue-500"
                      style={{
                        width: `${Math.max(pct, 5)}%`
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Top Combinations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Combinations */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <CardTitle className="text-sm font-semibold">
                Kombinasi Modul Paling Populer
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Pasangan Modul Pengguna + Token Tantangan yang paling diminati pengunjung
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {top_combinations.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                Belum ada data kombinasi yang tercatat.
              </div>
            ) : (
              <div className="space-y-2">
                {top_combinations.map((comb, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400">#{idx + 1}</span>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        <strong className="text-zinc-900 dark:text-zinc-100">{comb.persona}</strong>
                        <span className="text-zinc-400 mx-1.5">+</span>
                        <strong className="text-blue-600 dark:text-blue-400">{comb.zone}</strong>
                      </div>
                    </div>
                    <Badge variant="default" className="font-mono">
                      {comb.count} kali
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Session Logs */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <CardTitle className="text-sm font-semibold">
                Log Interaksi Layar Sentuh Terkini
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Aktivitas real-time pemilihan modul di meja interaktif
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {recent_logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                Belum ada log interaksi terbaru.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {recent_logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        Modul: <span className="font-mono text-zinc-600 dark:text-zinc-300">{log.persona}</span> &bull; Zona: <span className="font-mono text-blue-500">{log.zone}</span>
                        {log.innovation_title && (
                          <span className="text-zinc-500 dark:text-zinc-400 font-normal"> &bull; Riset: <span className="font-mono text-emerald-600 dark:text-emerald-400">{log.innovation_title}</span></span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-2">
                        <span>Event: {log.event}</span>
                        {(log.description || log.keterangan) && (
                          <span className="text-zinc-500 dark:text-zinc-400 italic font-sans">&bull; {log.description || log.keterangan}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono flex-shrink-0">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
