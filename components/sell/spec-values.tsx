'use client'

import { createContext, useContext } from 'react'

// Valores iniciais dos campos de especificação, indexados pelo atributo "name".
// Usado na edição de anúncio (RF04) para preencher o formulário com os dados salvos.
const SpecValuesContext = createContext<Record<string, string>>({})

export const SpecValuesProvider = SpecValuesContext.Provider

export function useSpecValue(name?: string) {
  const valores = useContext(SpecValuesContext)
  return name ? valores[name] ?? '' : ''
}
