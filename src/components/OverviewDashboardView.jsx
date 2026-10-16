import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Building2,
  FlaskConical,
  Globe2,
  Sparkles,
  RefreshCw,
  Plus,
  ChevronRight,
  Map,
} from 'lucide-react'
import { fetchDashboardOverview } from '@/lib/api'
import { toast } from 'sonner'

export default function OverviewDashboardView({ onNavigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadOverview = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await fetchDashboardOverview()
      setData(res)
      if (isManual) {
        toast.success('Data overview berhasil diperbarui')
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Memuat ringkasan dashboard terpadu...</p>
      </div>
    )
  }

  const stats = data?.stats || {
    total_lokasi: 0,
    total_jenis_kawasan: 0,
    total_fokus_riset: 0,
    total_provinsi: 0,
    total_kabupaten_kota: 0,
  }

  const jkDist = data?.distribution_by_jenis_kawasan || []
  const wilDist = data?.distribution_by_wilayah || []

  const statCards = [
    {
      title: 'Total Lokasi Terdaftar',
      value: stats.total_lokasi,
      label: 'Kawasan & Lokasi Terpetakan',
      icon: MapPin,
      gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-500/20',
      action: () => onNavigate('data-peta-lokasi'),
    },
    {
      title: 'Pilar Jenis Kawasan',
      value: stats.total_jenis_kawasan,
      label: 'Kawasan, BRIDA, Kebun Raya',
      icon: Building2,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/20',
      action: () => onNavigate('jenis-kawasan'),
    },
    {
      title: 'Fokus & Tema Riset',
      value: stats.total_fokus_riset,
      label: 'Kluster Riset BRIN Aktif',
      icon: FlaskConical,
      gradient: 'from-violet-500/10 via-violet-500/5 to-transparent',
      textColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-500/20',
      action: () => onNavigate('fokus-riset'),
    },
    {
      title: 'Cakupan Wilayah',
      value: `${stats.total_provinsi} Prov`,
      subValue: `${stats.total_kabupaten_kota} Kab/Kota`,
      label: 'Seluruh Wilayah Indonesia',
      icon: Globe2,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/20',
      action: () => onNavigate('wilayah'),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white p-6 sm:p-8 shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground border border-primary/30 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Informasi Terpadu Kawasan BRIN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Dashboard Overview
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Ringkasan menyeluruh persebaran kawasan riset sains dan teknologi, ekosistem BRIDA, kebun raya, dan cakupan wilayah Indonesia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadOverview(true)}
              disabled={refreshing}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onNavigate('data-peta-lokasi/new')}
              className="gap-2 text-xs font-semibold shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Lokasi Baru</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('data-peta-lokasi')}
              className="gap-2 text-xs font-semibold"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Data Peta Lokasi</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, idx) => {
          const Icon = c.icon
          return (
            <Card
              key={idx}
              onClick={c.action}
              className={`p-4 rounded-xl border ${c.borderColor} bg-gradient-to-br ${c.gradient} hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{c.title}</span>
                <div className={`p-2 rounded-lg bg-background/80 shadow-xs ${c.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-1.5">
                  <span>{c.value}</span>
                  {c.subValue && <span className="text-xs font-normal text-muted-foreground">({c.subValue})</span>}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>{c.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 2-Column: Sebaran Regional & Sebaran Jenis Kawasan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sebaran Regional Wilayah Indonesia */}
        <Card className="p-5 rounded-xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Sebaran Regional Wilayah Indonesia</h3>
                <p className="text-xs text-muted-foreground">Distribusi lokasi kawasan berdasarkan gugus kepulauan</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('wilayah')}
              className="text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <span>Master Wilayah</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-3 pt-1">
            {wilDist.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.wilayah}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-muted-foreground">{item.count} lokasi</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                      {item.percentage}%
                    </Badge>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sebaran Menurut Jenis Kawasan */}
        <Card className="p-5 rounded-xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Sebaran Menurut Jenis Kawasan</h3>
                <p className="text-xs text-muted-foreground">Komposisi lokasi berdasarkan kategori & sub-kategori pilar</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('jenis-kawasan')}
              className="text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <span>Master Pilar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-3 pt-1 max-h-[300px] overflow-y-auto pr-1">
            {jkDist.slice(0, 7).map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground truncate max-w-[240px]" title={item.nama}>
                    {item.nama}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-muted-foreground">{item.count} lokasi</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                      {item.percentage}%
                    </Badge>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
