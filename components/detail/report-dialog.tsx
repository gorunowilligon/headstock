import type { FormEvent } from 'react'
import { Flag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ReportDialog({ open, motivo, onMotivoChange, onClose, onSubmit }: { open: boolean, motivo: string, onMotivoChange: (value: string) => void, onClose: () => void, onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-5"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <form onSubmit={onSubmit} role="dialog" aria-modal="true" aria-labelledby="report-title" className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-red-100 text-red-600"><Flag className="size-5" /></span>
            <h2 id="report-title" className="text-lg font-bold">Denunciar anúncio</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar"><X className="size-5" /></button>
        </div>
        <label className="mt-5 block text-sm font-semibold">
          Motivo da denúncia
          <textarea
            value={motivo}
            onChange={(e) => onMotivoChange(e.target.value)}
            required
            autoFocus
            rows={4}
            className="mt-2 w-full resize-none rounded-lg border px-3 py-3 font-normal outline-none focus:border-red-600"
            placeholder="Descreva o problema com este anúncio..."
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={!motivo.trim()} className="bg-red-600 hover:bg-red-700">Enviar Denúncia</Button>
        </div>
      </form>
    </div>
  )
}
