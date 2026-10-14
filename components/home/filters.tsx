import { Filter } from '@/components/home/filter'

export function Filters() {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-28 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Filtros</h2>
          <button className="text-xs font-semibold text-red-600">Limpar tudo</button>
        </div>
        <Filter title="Categorias">
          <label><input type="checkbox" defaultChecked /> Guitarras <span>128</span></label>
          <label><input type="checkbox" /> Baixos <span>62</span></label>
          <label><input type="checkbox" /> Violões <span>45</span></label>
          <label><input type="checkbox" /> Pedais/Efeitos <span>89</span></label>
        </Filter>
        <Filter title="Marca">
          <label><input type="checkbox" /> Fender</label>
          <label><input type="checkbox" /> Gibson</label>
          <label><input type="checkbox" /> Ibanez</label>
          <label><input type="checkbox" /> Boss</label>
          <label><input type="checkbox" /> Martin</label>
        </Filter>
        <Filter title="Condição">
          <label><input type="checkbox" /> Novo</label>
          <label><input type="checkbox" /> Seminovo</label>
          <label><input type="checkbox" defaultChecked /> Usado</label>
        </Filter>
        <Filter title="Faixa de preço">
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-lg border px-2 py-2 text-xs" placeholder="Mínimo" />
            <input className="rounded-lg border px-2 py-2 text-xs" placeholder="Máximo" />
          </div>
        </Filter>
      </div>
    </aside>
  )
}
