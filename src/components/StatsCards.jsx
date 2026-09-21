import { Card, CardContent } from '@/components/ui/card'
import { Lightbulb, Users, Compass, MessageSquare, Award, CheckCircle2, Clock, Inbox } from 'lucide-react'

export default function StatsCards({ analytics, showFullCharts = false }) {
  const {
    total_innovations = 0,
    total_personas = 8,
    total_zones = 9,
    total_suggestions = 0,
    new_suggestions = 0,
    reviewed_suggestions = 0,
    top_zones = [],
    top_personas = [],
    trl_distribution = {}
  } = analytics || {}

  const stats = [
    {
      title: 'Total Inovasi',
      value: total_innovations,
      description: 'Katalog riset terdaftar',
      icon: Lightbulb,
      textColor: 'text-zinc-900 dark:text-zinc-100',
    },
    {
      title: 'Usulan Masuk',
      value: total_suggestions,
      description: `${new_suggestions} baru, ${reviewed_suggestions} ditinjau`,
      icon: MessageSquare,
      textColor: 'text-zinc-900 dark:text-zinc-100',
    },
    {
      title: 'Modul Pengguna (Slot 1)',
      value: total_personas,
      description: '8 Persona terdaftar',
      icon: Users,
      textColor: 'text-zinc-900 dark:text-zinc-100',
    },
    {
      title: 'Zona Riset (Slot 2)',
      value: total_zones,
      description: '9 Token tantangan BRIN',
      icon: Compass,
      textColor: 'text-zinc-900 dark:text-zinc-100',
    },
  ]

  // Calculate TRL tiers
  let trlConcept = 0      // TRL 1-3
  let trlPrototype = 0    // TRL 4-6
  let trlCommercial = 0   // TRL 7-9

  Object.entries(trl_distribution).forEach(([key, count]) => {
    const num = parseInt(key.replace('TRL ', ''))
    if (num <= 3) trlConcept += count
    else if (num <= 6) trlPrototype += count
    else trlCommercial += count
  })

  return (
    <div className="space-y-4">
      {/* 4 Metric Cards (DREAMWALL style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card
              key={idx}
              className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm"
            >
              <div className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.title}
                  </span>
                  <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono animate-counter">
                    {stat.value}
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono block">
                    {stat.description}
                  </span>
                </div>
                <div className="p-2.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* TRL Distribution & Top Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* TRL Meter */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Kesiapan Teknologi (TRL 1–9)
                </h4>
              </div>
              <span className="text-xs font-mono text-zinc-400">{total_innovations} Total</span>
            </div>

            <div className="space-y-2.5 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-zinc-600 dark:text-zinc-300">TRL 7–9 (Siap Terap)</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{trlCommercial}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${total_innovations ? (trlCommercial / total_innovations) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-zinc-600 dark:text-zinc-300">TRL 4–6 (Prototipe)</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{trlPrototype}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${total_innovations ? (trlPrototype / total_innovations) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-zinc-600 dark:text-zinc-300">TRL 1–3 (Riset Dasar)</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{trlConcept}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${total_innovations ? (trlConcept / total_innovations) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Top 5 Research Zones */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Token Tantangan Terpopuler
              </h4>
            </div>

            <div className="space-y-1.5 pt-1">
              {top_zones && top_zones.length > 0 ? (
                top_zones.map((tz, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[170px]">
                      {i + 1}. {tz.zone}
                    </span>
                    <span className="font-mono font-medium text-zinc-500">{tz.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 py-3 text-center">Belum ada data</p>
              )}
            </div>
          </div>
        </Card>

        {/* Top 5 Personas */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Modul Pengguna Terpopuler
              </h4>
            </div>

            <div className="space-y-1.5 pt-1">
              {top_personas && top_personas.length > 0 ? (
                top_personas.map((tp, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[170px]">
                      {i + 1}. {tp.persona}
                    </span>
                    <span className="font-mono font-medium text-zinc-500">{tp.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 py-3 text-center">Belum ada data</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
