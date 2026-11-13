import type { ReactNode } from 'react'
import { X } from 'lucide-react'

/** Janela modal simples: fecha ao clicar fora, no X ou com Esc. */
export function Modal({ titulo, icone, onClose, children, largura = 'max-w-md' }: { titulo: string, icone?: ReactNode, onClose: () => void, children: ReactNode, largura?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-5"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="modal-titulo" className={`w-full ${largura} rounded-2xl border bg-white p-6 shadow-xl`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {icone && <span className="grid size-10 place-items-center rounded-full bg-red-100 text-red-600">{icone}</span>}
            <h2 id="modal-titulo" className="text-lg font-bold">{titulo}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar"><X className="size-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
