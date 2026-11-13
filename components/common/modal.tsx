'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Janela modal: fecha ao clicar fora, no X ou com Esc (de qualquer lugar).
 * Ao abrir, o foco vai para dentro do diálogo (primeiro campo com autoFocus ou o próprio diálogo),
 * o Tab fica preso dentro dele e, ao fechar, o foco volta para o botão que o abriu.
 */
export function Modal({ titulo, icone, onClose, children, largura = 'max-w-md' }: { titulo: string, icone?: ReactNode, onClose: () => void, children: ReactNode, largura?: string }) {
  const dialogo = useRef<HTMLDivElement>(null)
  const idTitulo = useId()
  // Guarda a versão mais recente do onClose sem reexecutar o efeito a cada renderização.
  const fechar = useRef(onClose)
  fechar.current = onClose

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    const el = dialogo.current
    // Se algum campo já pegou o foco (autoFocus), respeita; senão, foca o próprio diálogo.
    if (el && !el.contains(document.activeElement)) el.focus()

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        fechar.current()
        return
      }
      if (e.key !== 'Tab' || !el) return
      // Só o que o navegador realmente foca: os botões desabilitados desta biblioteca não usam o atributo
      // "disabled" (ficam com tabIndex -1), então o seletor sozinho contaria botões que o Tab pula.
      const itens = [...el.querySelectorAll<HTMLElement>(FOCAVEIS)]
        .filter((i) => i.tabIndex >= 0 && i.offsetParent !== null && i.getAttribute('aria-disabled') !== 'true')
      if (itens.length === 0) { e.preventDefault(); return }
      const posicao = itens.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && posicao <= 0) { e.preventDefault(); itens[itens.length - 1].focus() }
      else if (!e.shiftKey && (posicao === -1 || posicao === itens.length - 1)) { e.preventDefault(); itens[0].focus() }
    }
    document.addEventListener('keydown', aoTeclar)
    // Impede a página de trás de rolar enquanto o diálogo está aberto.
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflowAnterior
      if (anterior && document.contains(anterior)) anterior.focus()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-5"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div ref={dialogo} role="dialog" aria-modal="true" aria-labelledby={idTitulo} tabIndex={-1} className={`w-full ${largura} rounded-2xl border bg-white p-6 shadow-xl outline-none`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {icone && <span className="grid size-10 place-items-center rounded-full bg-red-100 text-red-700">{icone}</span>}
            <h2 id={idTitulo} className="text-lg font-bold">{titulo}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Fechar"><X className="size-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
