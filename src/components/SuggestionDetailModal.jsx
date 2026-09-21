import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  Check, 
  Copy, 
  Clock, 
  User, 
  Compass, 
  Layers,
  MessageSquare
} from 'lucide-react'

export default function SuggestionDetailModal({ suggestion, open, onOpenChange }) {
  const [copied, setCopied] = useState(false)

  if (!suggestion) return null

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Disalin ke clipboard')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
        <DialogHeader className="p-0 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <DialogTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            <span>Detail Usulan Riset Pengunjung</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Context Info Box */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-md bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 font-mono">
            <div>
              <span className="text-[11px] text-zinc-400 block">Pengunjung:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {suggestion.visitor_name || 'Anonim'} {suggestion.age_range ? `(${suggestion.age_range})` : ''}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 block">Modul & Token Pilihan:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {suggestion.persona_name || '-'} &bull; <span className="text-blue-600 dark:text-blue-400">{suggestion.zone_name || '-'}</span>
              </span>
            </div>
          </div>

          {/* Topic Wanted Box with Copy */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-mono text-zinc-500">Pesan Usulan Riset yang Dicari</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] px-2 text-zinc-400 hover:text-zinc-200"
                onClick={() => copyText(suggestion.topic_wanted)}
              >
                {copied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Tersalin' : 'Salin'}
              </Button>
            </div>
            <div className="p-3.5 rounded-md bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed font-sans select-text">
              {suggestion.topic_wanted}
            </div>
          </div>

          {/* Feedback */}
          {suggestion.feedback && (
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">Masukan / Ide Tambahan</Label>
              <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 italic">
                "{suggestion.feedback}"
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono pt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Waktu Pengajuan: {formatDate(suggestion.created_at)}</span>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
