'use client'

import { useSpecValue } from '@/components/sell/spec-values'

export function SpecSelect({ label, name, options }: { label: string, name?: string, options: string[] }) {
  const valorInicial = useSpecValue(name)

  return (
    <label className="block text-sm font-semibold">
      {label}
      <select name={name} defaultValue={valorInicial} className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal">
        <option value="">Selecione</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}
