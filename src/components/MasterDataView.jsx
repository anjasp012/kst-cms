import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Compass, 
  Edit, 
  Check, 
  Loader2 
} from 'lucide-react'

export default function MasterDataView({
  personas,
  zones,
  onUpdatePersona,
  onUpdateZone,
  loading
}) {
  const [activeTab, setActiveTab] = useState('personas')
  const [editingPersona, setEditingPersona] = useState(null)
  const [editingZone, setEditingZone] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSavePersona = async (e) => {
    e.preventDefault()
    if (!editingPersona) return
    setSaving(true)
    try {
      await onUpdatePersona(editingPersona.id, {
        name: editingPersona.name,
        tagline: editingPersona.tagline,
        order_index: parseInt(editingPersona.order_index),
      })
      setEditingPersona(null)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveZone = async (e) => {
    e.preventDefault()
    if (!editingZone) return
    setSaving(true)
    try {
      await onUpdateZone(editingZone.id, {
        name: editingZone.name,
        description: editingZone.description,
      })
      setEditingZone(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Sub tabs */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={activeTab === 'personas' ? 'default' : 'outline'}
          onClick={() => setActiveTab('personas')}
          className="text-xs h-8"
        >
          <Users className="w-3.5 h-3.5 mr-1.5" />
          8 Modul Pengguna (Slot 1)
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'zones' ? 'default' : 'outline'}
          onClick={() => setActiveTab('zones')}
          className="text-xs h-8"
        >
          <Compass className="w-3.5 h-3.5 mr-1.5" />
          9 Zona Riset (Slot 2)
        </Button>
      </div>

      {/* Tab 1: 8 Personas */}
      {activeTab === 'personas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {personas.map((p) => {
            const isEditing = editingPersona?.id === p.id
            return (
              <Card
                key={p.id}
                className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm"
              >
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        #{p.order_index}
                      </span>
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {p.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingPersona(isEditing ? null : { ...p })}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSavePersona} className="space-y-2 pt-1 text-xs">
                      <Input
                        value={editingPersona.name}
                        onChange={(e) => setEditingPersona({ ...editingPersona, name: e.target.value })}
                        className="h-7 text-xs"
                      />
                      <textarea
                        value={editingPersona.tagline}
                        onChange={(e) => setEditingPersona({ ...editingPersona, tagline: e.target.value })}
                        rows={2}
                        className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 resize-none"
                      />
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPersona(null)}
                          className="h-6 text-[11px] px-2"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={saving}
                          className="h-6 text-[11px] px-2"
                        >
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {p.tagline}
                    </p>
                  )}

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>/{p.slug}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Slot 1</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Tab 2: 9 Zones */}
      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {zones.map((z) => {
            const isEditing = editingZone?.id === z.id
            return (
              <Card
                key={z.id}
                className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm"
              >
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 flex items-center justify-center font-mono text-xs font-bold">
                        {z.name.charAt(0)}
                      </span>
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        Zona {z.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingZone(isEditing ? null : { ...z })}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSaveZone} className="space-y-2 pt-1 text-xs">
                      <Input
                        value={editingZone.name}
                        onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                        className="h-7 text-xs"
                      />
                      <textarea
                        value={editingZone.description}
                        onChange={(e) => setEditingZone({ ...editingZone, description: e.target.value })}
                        rows={2}
                        className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 resize-none"
                      />
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingZone(null)}
                          className="h-6 text-[11px] px-2"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={saving}
                          className="h-6 text-[11px] px-2"
                        >
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {z.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>/{z.slug}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Slot 2</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
