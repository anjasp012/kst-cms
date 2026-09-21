import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  FlaskConical, 
  Sparkles, 
  Award, 
  Users, 
  Image as ImageIcon,
  MapPin
} from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

export default function KSTDetailModal({ kst, open, onClose }) {
  const [activeTab, setActiveTab] = useState('profil')

  if (!kst) return null

  const tabs = [
    { id: 'profil', label: 'Profil', icon: Building2 },
    { id: 'fasilitas', label: 'Fasilitas', icon: FlaskConical },
    { id: 'riset', label: 'Riset', icon: Sparkles },
    { id: 'dampak', label: 'Dampak', icon: Award },
    { id: 'kolaborasi', label: 'Kolaborasi', icon: Users },
    { id: 'galeri', label: 'Galeri', icon: ImageIcon },
  ]

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto p-0 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl shadow-lg">
        
        {/* Simple Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start gap-4 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="w-14 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0">
            {kst.thumbnail_url ? (
              <img 
                src={getImageUrl(kst.thumbnail_url)} 
                alt={kst.nama} 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <Building2 className="w-6 h-6 text-zinc-400" />
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">
                {kst.wilayah}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
              <span className="text-[11px] font-mono text-zinc-500">
                {kst.pengelola || 'BRIN'}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
              {kst.nama}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-mono pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {kst.kota_provinsi}
              </span>
              <span>&bull;</span>
              <span>Tahun: {kst.tahun_operasi || 2021}</span>
              <span>&bull;</span>
              <span className="text-zinc-700 dark:text-zinc-300">Status: {kst.status || 'Aktif'}</span>
            </div>
          </div>
        </div>

        {/* Clean Neutral Tabs */}
        <div className="flex items-center gap-1 px-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5">
          {/* TAB 1: PROFIL */}
          {activeTab === 'profil' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono uppercase text-zinc-400">Deskripsi Kawasan</h4>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {kst.deskripsi_profil || 'Belum ada deskripsi profil untuk kawasan ini.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Peran Kawasan */}
                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Peran Kawasan
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {kst.peran_kawasan || 'Mendukung pengembangan riset dan teknologi wilayah.'}
                  </p>
                </div>

                {/* Fokus Utama */}
                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Fokus Utama
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {kst.fokus_utama && kst.fokus_utama.length > 0 ? (
                      kst.fokus_utama.map((f, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                        >
                          {f}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400">-</span>
                    )}
                  </div>
                </div>

                {/* Terhubung Dengan */}
                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Terhubung dengan
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {kst.terhubung_dengan || 'Peneliti, industri, pemerintah, dan akademisi.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div className="space-y-3">
              {kst.fasilitas && kst.fasilitas.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {kst.fasilitas.map((f, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{f.nama || f}</span>
                        {f.tipe && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            {f.tipe}
                          </span>
                        )}
                      </div>
                      {f.deskripsi && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{f.deskripsi}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  Belum ada fasilitas terdaftar.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RISET */}
          {activeTab === 'riset' && (
            <div className="space-y-2.5">
              {kst.riset && kst.riset.length > 0 ? (
                kst.riset.map((r, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{r.judul || r}</span>
                      {r.bidang && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800">
                          {r.bidang}
                        </span>
                      )}
                    </div>
                    {r.deskripsi && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{r.deskripsi}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  Belum ada data riset terdaftar.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DAMPAK */}
          {activeTab === 'dampak' && (
            <div className="space-y-2.5">
              {kst.dampak && kst.dampak.length > 0 ? (
                kst.dampak.map((d, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{d.judul || d}</div>
                    {d.keterangan && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{d.keterangan}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  Belum ada data dampak.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: KOLABORASI */}
          {activeTab === 'kolaborasi' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase text-zinc-400">Potensi Kolaborasi</span>
                <div className="flex flex-wrap gap-1.5">
                  {kst.potensi_kolaborasi && kst.potensi_kolaborasi.length > 0 ? (
                    kst.potensi_kolaborasi.map((k, i) => (
                      <span key={i} className="px-2.5 py-1 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {k}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400">-</span>
                  )}
                </div>
              </div>

              {kst.daftar_kolaborasi && kst.daftar_kolaborasi.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-mono uppercase text-zinc-400">Daftar Kerjasama</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {kst.daftar_kolaborasi.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{item.mitra || item}</div>
                        {item.tipe && <span className="text-[10px] font-mono text-zinc-400">{item.tipe}</span>}
                        {item.deskripsi && <p className="text-xs text-zinc-500 mt-1">{item.deskripsi}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: GALERI */}
          {activeTab === 'galeri' && (
            <div>
              {kst.galeri && kst.galeri.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {kst.galeri.map((imgUrl, idx) => (
                    <div key={idx} className="h-28 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                      <img 
                        src={getImageUrl(imgUrl)} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  Belum ada foto galeri.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
