import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import KSTManagementView from './KSTManagementView'
import KSTFormPage from './KSTFormPage'
import PartnersView from './PartnersView'
import {
  fetchKSTLocations,
  createKST,
  updateKST,
  deleteKST,
  fetchRegionalPartners,
  createRegionalPartner,
  updateRegionalPartner,
  deleteRegionalPartner
} from '@/lib/api'
import { useTheme } from '@/lib/theme'
import { Toaster, toast } from 'sonner'
import {
  Building2,
  MapPin,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'

export default function Dashboard({ username, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Derive currentView from URL path
  const currentView = useMemo(() => {
    const path = location.pathname.replace(/^\//, '')
    if (path === 'partners') return 'partners'
    if (path === 'kst/new' || path.startsWith('kst/edit')) return 'kst-form'
    return 'kst'
  }, [location.pathname])

  const setCurrentView = useCallback((view) => {
    navigate(view === 'partners' ? '/partners' : '/kst')
  }, [navigate])

  const [kstLocations, setKstLocations] = useState([])
  const [partners, setPartners] = useState([])

  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { isDark, toggleTheme } = useTheme()
  const isFetchingRef = useRef(false)

  const viewTitles = {
    kst: 'Kawasan Sains dan Teknologi (KST) BRIN',
    'kst-form': 'Form Kawasan Sains dan Teknologi (6 Tab)',
    partners: 'Direktori Mitra Riset Daerah (BRIDA / BAPPERIDA / BAPPEDA)',
  }

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    if (isManualRefresh) setLoading(true)

    try {
      const [kstRes, partnersRes] = await Promise.all([
        fetchKSTLocations().catch(() => []),
        fetchRegionalPartners().catch(() => []),
      ])

      if (Array.isArray(kstRes)) setKstLocations(kstRes)
      if (Array.isArray(partnersRes)) setPartners(partnersRes)

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

  const navItems = [
    {
      id: 'kst',
      label: 'Kawasan Sains (KST)',
      icon: Building2,
      count: kstLocations.length,
    },
    {
      id: 'partners',
      label: 'Mitra Daerah (BRIDA)',
      icon: MapPin,
      count: partners.length,
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Toaster position="bottom-right" richColors theme={isDark ? 'dark' : 'light'} />

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Left Sidebar Dashboard (RT / DW Exact Format) */}
      <aside
        className={`w-64 fixed inset-y-0 left-0 z-40 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Brand Header (Aligned to exact h-14 height with right navbar) */}
          <div className="h-14 px-5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-100 dark:text-zinc-900 shadow-sm flex-shrink-0">
                KST
              </div>
              <div>
                <div className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
                  KST BRIN
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

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                    active
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Profile & Logout Section (RT / DW Exact Format) */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950">
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
            className="h-8 w-8 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar (RT / DW Exact Format) */}
        <header className="h-14 px-5 sm:px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-400 dark:text-zinc-500 font-mono text-xs">KST BRIN</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-700" />
              <span className="font-medium text-zinc-800 dark:text-zinc-200 text-sm">{viewTitles[currentView]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              title={isDark ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
              className="h-9 w-9 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </Button>
          </div>
        </header>

        {/* View Router Render */}
        <div className="p-5 sm:p-8 space-y-6 flex-1">
          {/* 1. KST Management (Primary) */}
          {currentView === 'kst' && (
            <KSTManagementView
              locations={kstLocations}
              loading={loading}
              onCreate={handleCreateKST}
              onUpdate={handleUpdateKST}
              onDelete={handleDeleteKST}
            />
          )}

          {/* 2. KST Dedicated Form Page (Create / Edit 6 Tabs) */}
          {currentView === 'kst-form' && (
            <KSTFormPage
              onSaveSuccess={() => loadData(true)}
            />
          )}

          {/* 3. Regional Partners (BAPPEDA/BAPPERIDA/BRIDA) */}
          {currentView === 'partners' && (
            <PartnersView
              partners={partners}
              loading={loading}
              onCreate={handleCreatePartner}
              onUpdate={handleUpdatePartner}
              onDelete={handleDeletePartner}
            />
          )}
        </div>

        {/* Global Footer */}
        <footer className="px-8 py-4 border-t border-zinc-200 dark:border-zinc-800/60 text-xs text-zinc-400 dark:text-zinc-600 flex items-center justify-between font-mono">
          <div>&copy; 2026 BRIN &bull; Kawasan Sains dan Teknologi</div>
          <div></div>
        </footer>
      </main>
    </div>
  )
}
