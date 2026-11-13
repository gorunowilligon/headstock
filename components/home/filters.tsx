'use client'

import { Filter } from '@/components/home/filter'
import { estadoDaLocalizacao, grupoDaCondicao, opcoesDoFiltro, type FiltrosBusca, type OpcaoFiltro } from '@/lib/busca'
import type { Anuncio } from '@/lib/models'

type GrupoFiltro = 'categorias' | 'marcas' | 'tiposCaptacao' | 'condicoes' | 'localizacoes'

function Opcoes({ opcoes, selecionados, onToggle }: { opcoes: OpcaoFiltro[], selecionados: string[], onToggle: (valor: string) => void }) {
  // Uma opção marcada continua visível mesmo sem anúncios para o termo atual, para que possa ser desmarcada.
  const visiveis = [...opcoes, ...selecionados.filter((valor) => !opcoes.some((o) => o.valor === valor)).map((valor) => ({ valor, quantidade: 0 }))]
  if (visiveis.length === 0) return <p className="text-xs text-gray-400">Nenhuma opção disponível.</p>
  return (
    <>
      {visiveis.map((opcao) => (
        <label key={opcao.valor} className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={selecionados.includes(opcao.valor)} onChange={() => onToggle(opcao.valor)} />
          <span className="flex-1">{opcao.valor}</span>
          <span className="text-xs text-gray-400">{opcao.quantidade}</span>
        </label>
      ))}
    </>
  )
}

// anuncios: anúncios que correspondem ao termo de busca; as opções e quantidades são calculadas a partir deles.
export function Filters({ anuncios, filtros, onChange, onLimpar, erroPreco, aberto }: { anuncios: Anuncio[], filtros: FiltrosBusca, onChange: (filtros: FiltrosBusca) => void, onLimpar: () => void, erroPreco: string, aberto: boolean }) {
  const alternar = (grupo: GrupoFiltro, valor: string) => {
    const atuais = filtros[grupo]
    onChange({ ...filtros, [grupo]: atuais.includes(valor) ? atuais.filter((v) => v !== valor) : [...atuais, valor] })
  }

  const grupos: { titulo: string, grupo: GrupoFiltro, opcoes: OpcaoFiltro[] }[] = [
    { titulo: 'Categorias', grupo: 'categorias', opcoes: opcoesDoFiltro(anuncios, (a) => a.instrumento.categoria) },
    { titulo: 'Marca', grupo: 'marcas', opcoes: opcoesDoFiltro(anuncios, (a) => a.instrumento.marca) },
    { titulo: 'Tipo de captação', grupo: 'tiposCaptacao', opcoes: opcoesDoFiltro(anuncios, (a) => a.instrumento.tipoCaptacao) },
    { titulo: 'Condição', grupo: 'condicoes', opcoes: opcoesDoFiltro(anuncios, (a) => grupoDaCondicao(a.condicao)) },
    { titulo: 'Localização', grupo: 'localizacoes', opcoes: opcoesDoFiltro(anuncios, (a) => estadoDaLocalizacao(a.localizacao)) },
  ]

  return (
    <aside className={`w-full shrink-0 lg:block lg:w-64 ${aberto ? 'block' : 'hidden'}`} aria-label="Filtros de busca">
      <div className="flex flex-col gap-6 lg:sticky lg:top-28">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Filtros</h2>
          <button type="button" onClick={onLimpar} className="text-xs font-semibold text-red-600">Limpar tudo</button>
        </div>
        {grupos.map(({ titulo, grupo, opcoes }) => (
          <Filter key={grupo} title={titulo}>
            <Opcoes opcoes={opcoes} selecionados={filtros[grupo]} onToggle={(valor) => alternar(grupo, valor)} />
          </Filter>
        ))}
        <Filter title="Faixa de preço">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              value={filtros.precoMinimo}
              onChange={(e) => onChange({ ...filtros, precoMinimo: e.target.value })}
              className={`rounded-lg border px-2 py-2 text-xs ${erroPreco ? 'border-red-500' : ''}`}
              placeholder="Mínimo"
              aria-label="Preço mínimo"
            />
            <input
              type="number"
              min={0}
              value={filtros.precoMaximo}
              onChange={(e) => onChange({ ...filtros, precoMaximo: e.target.value })}
              className={`rounded-lg border px-2 py-2 text-xs ${erroPreco ? 'border-red-500' : ''}`}
              placeholder="Máximo"
              aria-label="Preço máximo"
            />
          </div>
          {erroPreco && <p role="alert" className="text-xs font-semibold text-red-600">{erroPreco} O filtro de preço não foi aplicado.</p>}
        </Filter>
      </div>
    </aside>
  )
}
