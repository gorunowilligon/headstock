'use client'

import { useEffect, useState } from 'react'
import { buscarCidadesPorUf, ESTADOS_BRASIL, extrairCidadeUf } from '@/lib/localidades'

const selectClass = 'mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal disabled:bg-gray-100 disabled:text-gray-400'

export function LocationFields({ valorInicial }: { valorInicial?: string }) {
  const inicial = extrairCidadeUf(valorInicial)
  const [uf, setUf] = useState(inicial.uf)
  const [cidade, setCidade] = useState(inicial.cidade)
  const [cidades, setCidades] = useState<string[]>(() => (inicial.cidade ? [inicial.cidade] : []))
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!uf) {
      setCidades([])
      setCidade('')
      return
    }
    let ativo = true
    setCarregando(true)
    buscarCidadesPorUf(uf).then((lista) => {
      if (!ativo) return
      setCidades(lista)
      setCidade((atual) => {
        if (!atual) return ''
        const encontrada = lista.find((c) => c.toLowerCase() === atual.toLowerCase())
        return encontrada ?? ''
      })
      setCarregando(false)
    })
    return () => { ativo = false }
  }, [uf])

  const trocarUf = (novaUf: string) => {
    setUf(novaUf)
    setCidade('')
  }

  return (
    <div className="mt-5 grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="localizacao" value={uf && cidade ? `${cidade}, ${uf}` : ''} />
      <label className="block text-sm font-semibold">
        Estado (UF)
        <select name="uf" value={uf} onChange={(e) => trocarUf(e.target.value)} required className={selectClass}>
          <option value="">Selecione o estado</option>
          {ESTADOS_BRASIL.map((estado) => (
            <option key={estado.sigla} value={estado.sigla}>{estado.nome} ({estado.sigla})</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold">
        Cidade
        <select name="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required disabled={!uf || carregando} className={selectClass}>
          <option value="">
            {!uf ? 'Selecione primeiro o estado' : carregando ? 'Carregando cidades...' : 'Selecione a cidade'}
          </option>
          {cidades.map((nome) => (
            <option key={nome} value={nome}>{nome}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
