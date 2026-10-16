import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import OverviewDashboardView from './OverviewDashboardView'
import QuickFilterManagementView from './QuickFilterManagementView'
import LocationManagementView from './LocationManagementView'
import LocationFormPage from './LocationFormPage'
import CategoryManagementView from './CategoryManagementView'
import WilayahManagementView from './WilayahManagementView'
import {
  fetchKSTLocations,
  createKST,
  updateKST,
  deleteKST,
  fetchThemes,
  fetchProvinces,
  fetchJenisKawasan,
  fetchQuickFiltersAdmin,
  SWAGGER_URL,
} from '@/lib/api'
import { useTheme } from '@/lib/theme'
import { Toaster, toast } from 'sonner'
import {
  Building2,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
  Globe2,
  BookOpen,
  ExternalLink,
  Map,
  FlaskConical,
  LayoutDashboard,
  SlidersHorizontal,
} from 'lucide-react'

export default function Dashboard({ username, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Derive currentView from URL path
  const currentView = useMemo(() => {
    const path = location.pathname.replace(/^\//, '')
    if (path === '' || path === 'dashboard' || path === 'overview') return 'overview'
    if (path === 'quick-filter' || path === 'quick-filters') return 'quick-filter'
    if (
      path === 'data-peta-lokasi/new' || path.startsWith('data-peta-lokasi/edit') ||
      path === 'data-peta-kawasan/new' || path.startsWith('data-peta-kawasan/edit') ||
      path === 'peta-kawasan/new' || path.startsWith('peta-kawasan/edit') ||
      path === 'kst/new' || path.startsWith('kst/edit')
    ) return 'kst-form'
    if (path === 'jenis-kawasan' || path === 'kawasan' || path === 'instansi') return 'jenis-kawasan'
    if (path === 'fokus-riset' || path === 'tema-riset' || path === 'riset') return 'fokus-riset'
    if (path === 'wilayah') return 'wilayah'
    if (path === 'data-peta-lokasi' || path === 'data-peta-kawasan' || path === 'peta-kawasan' || path === 'kst') return 'data-peta-lokasi'
    return 'overview'
  }, [location.pathname])

  const setCurrentView = useCallback((view) => {
    navigate(`/${view}`)
  }, [navigate])

  const [kstLocations, setKstLocations] = useState([])
  const [fokusRisetCount, setFokusRisetCount] = useState(6)
  const [wilayahCount, setWilayahCount] = useState(38)
  const [jenisKawasanCount, setJenisKawasanCount] = useState(4)
  const [quickFilterCount, setQuickFilterCount] = useState(4)

  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { isDark, toggleTheme } = useTheme()
  const isFetchingRef = useRef(false)

  const viewTitles = {
    overview: 'Dashboard Overview & Statistik',
    'quick-filter': 'Manajemen Quick Filter',
    'data-peta-lokasi': 'Data Peta Lokasi',
    'data-peta-kawasan': 'Data Peta Lokasi',
    kst: 'Data Peta Lokasi',
    'kst-form': 'Form Data Peta Lokasi',
    'jenis-kawasan': 'Master Data — Jenis Kawasan',
    'fokus-riset': 'Master Data — Fokus Riset',
    wilayah: 'Master Data — Wilayah (Provinsi & Kab/Kota)',
  }

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    if (isManualRefresh) setLoading(true)

    try {
      const [kstRes, provRes, jenisKawasanRes, themesRes, qfRes] = await Promise.all([
        fetchKSTLocations().catch(() => []),
        fetchProvinces().catch(() => []),
        fetchJenisKawasan().catch(() => []),
        fetchThemes(true).catch(() => []),
        fetchQuickFiltersAdmin().catch(() => []),
      ])

      if (Array.isArray(kstRes)) setKstLocations(kstRes)
      if (Array.isArray(provRes)) setWilayahCount(provRes.length)
      if (Array.isArray(jenisKawasanRes)) setJenisKawasanCount(jenisKawasanRes.length)
      if (Array.isArray(themesRes)) setFokusRisetCount(themesRes.length)
      if (Array.isArray(qfRes)) setQuickFilterCount(qfRes.length)

      if (Array.isArray(kstRes)) setKstLocations(kstRes)
      if (Array.isArray(provRes)) setWilayahCount(provRes.length)
      if (Array.isArray(jenisKawasanRes)) setJenisKawasanCount(jenisKawasanRes.length)
      if (Array.isArray(themesRes)) setFokusRisetCount(themesRes.length)

      if (isManualRefresh) {
        toast.success('Data berhasil diperbarui')
      }
    } catch (err) {
      if (isManualRefresh) {
        toast.error(err.message || 'Gagal memuat data')
      }
    } finally {
      setLoading(false)

      isFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // --- KST HANDLERS ---
  const handleCreateKST = async (payload) => {
    await createKST(payload)
    loadData()
  }

  const handleUpdateKST = async (id, payload) => {
    await updateKST(id, payload)
    loadData()
  }

  const handleDeleteKST = async (id) => {
    await deleteKST(id)
    loadData()
  }

  // --- PARTNER HANDLERS ---
  const handleCreatePartner = async (payload) => {
    await createRegionalPartner(payload)
    loadData()
  }

  const handleUpdatePartner = async (id, payload) => {
    await updateRegionalPartner(id, payload)
    loadData()
  }

  const handleDeletePartner = async (id) => {
    await deleteRegionalPartner(id)
    loadData()
  }

  const navSections = [
    {
      title: 'Menu Utama',
      items: [
        {
          id: 'overview',
          label: 'Dashboard Overview',
          icon: LayoutDashboard,
        },
        {
          id: 'data-peta-lokasi',
          label: 'Data Peta Lokasi',
          icon: Map,
          count: kstLocations.length,
        },
        {
          id: 'quick-filter',
          label: 'Quick Filter',
          icon: SlidersHorizontal,
          count: quickFilterCount,
        },
      ],
    },
    {
      title: 'Master Data',
      items: [
        {
          id: 'jenis-kawasan',
          label: 'Jenis Kawasan',
          icon: Building2,
          count: jenisKawasanCount,
        },
        {
          id: 'fokus-riset',
          label: 'Fokus Riset',
          icon: FlaskConical,
          count: fokusRisetCount,
        },
        {
          id: 'wilayah',
          label: 'Wilayah',
          icon: Globe2,
          count: wilayahCount,
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      <Toaster position="bottom-right" richColors theme={isDark ? 'dark' : 'light'} />

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Left Sidebar Dashboard */}
      <aside
        className={`w-64 fixed inset-y-0 left-0 z-40 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Logo & Brand Header */}
          <div className="h-14 px-5 flex items-center justify-between border-b border-sidebar-border bg-sidebar flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center font-bold text-[10px] text-primary-foreground shadow-sm flex-shrink-0">
                BRIN
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                  Jelajahi Kawasan Terpadu BRIN
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5 leading-none">ADMIN CMS</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-mono font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                  {section.title}
                </div>
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active =
                      currentView === item.id ||
                      (item.id === 'data-peta-lokasi' && currentView === 'kst-form')

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id)
                          setSidebarOpen(false)
                        }}
                        className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          active
                            ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold shadow-xs ring-1 ring-zinc-300 dark:ring-zinc-700/60'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        {/* Active vertical pill indicator */}
                        {active && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
                        )}

                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              active
                                ? 'text-primary'
                                : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && (
                          <Badge
                            variant={active ? 'default' : 'secondary'}
                            className={`text-[10px] h-4 px-1.5 font-mono ${
                              active
                                ? 'bg-primary text-primary-foreground'
                                : 'text-zinc-500 dark:text-zinc-400'
                            }`}
                          >
                            {item.count}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout Section */}
        <div className="p-3 border-t border-sidebar-border flex items-center justify-between bg-sidebar flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300 flex-shrink-0">
              {username ? username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{username}</div>
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono leading-none">ADMINISTRATOR</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Keluar (Logout)"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-14 px-5 sm:px-8 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-400 dark:text-zinc-500 font-mono text-xs">Jelajahi Kawasan Terpadu BRIN</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-700" />
              <span className="font-medium text-zinc-800 dark:text-zinc-200 text-sm">{viewTitles[currentView]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Swagger API Docs Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(SWAGGER_URL, '_blank')}
              className="gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
              <span>API Docs</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>

            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              title={isDark ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* View Router Render */}
        <div className="p-5 sm:p-8 space-y-6 flex-1">
          {/* 0. Dashboard Overview (Primary Overview) */}
          {currentView === 'overview' && (
            <OverviewDashboardView
              onNavigate={setCurrentView}
            />
          )}

          {/* 1. Manajemen Quick Filter */}
          {currentView === 'quick-filter' && (
            <QuickFilterManagementView />
          )}

          {/* 2. Data Peta Lokasi Management */}
          {(currentView === 'data-peta-lokasi' || currentView === 'data-peta-kawasan' || currentView === 'kst') && (
            <LocationManagementView
              locations={kstLocations}
              loading={loading}
              onCreate={handleCreateKST}
              onUpdate={handleUpdateKST}
              onDelete={handleDeleteKST}
              onRefresh={() => loadData(true)}
            />
          )}

          {/* 2. Dedicated Location Form Page (Create / Edit 6 Tabs) */}
          {currentView === 'kst-form' && (
            <LocationFormPage
              onSaveSuccess={() => loadData(true)}
            />
          )}

          {/* Master Data: Jenis Kawasan */}
          {currentView === 'jenis-kawasan' && (
            <CategoryManagementView
              activeType="jenis_kawasan"
              onCategoriesChanged={() => loadData()}
            />
          )}

          {/* Master Data: Fokus Riset */}
          {currentView === 'fokus-riset' && (
            <CategoryManagementView
              activeType="fokus_riset"
              onCategoriesChanged={() => loadData()}
            />
          )}

          {/* 8. Master Data: Wilayah (Provinsi & Kabupaten/Kota) */}
          {currentView === 'wilayah' && (
            <WilayahManagementView
              onWilayahChanged={() => loadData()}
            />
          )}
        </div>
      </main>
    </div>
  )
}
