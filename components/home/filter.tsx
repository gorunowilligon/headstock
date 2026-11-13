'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function Filter({ title, children }: { title: string, children: React.ReactNode }) {
  const [aberto, setAberto] = useState(true)

  return (
    <section className="border-t pt-4">
      <h3>
        <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} className="mb-3 flex w-full items-center justify-between text-sm font-semibold">
          {title}
          <ChevronDown className={`size-4 transition-transform ${aberto ? '' : '-rotate-90'}`} />
        </button>
      </h3>
      {aberto && <div className="flex flex-col gap-3 text-sm text-gray-600">{children}</div>}
    </section>
  )
}
