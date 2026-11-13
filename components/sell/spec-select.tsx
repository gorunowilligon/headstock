export function SpecSelect({ label, name, options, defaultValue }: { label: string, name?: string, options: string[], defaultValue?: string | number }) {
  const atual = defaultValue === undefined ? '' : String(defaultValue)
  // Um valor salvo que não está mais na lista continua selecionável, para não se perder na edição.
  const opcoes = atual && !options.includes(atual) ? [atual, ...options] : options
  return (
    <label className="block text-sm font-semibold">
      {label}
      <select name={name} defaultValue={atual} className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal">
        <option value="">Selecione</option>
        {opcoes.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}
