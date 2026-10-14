export function SpecSelect({ label, options }: { label: string, options: string[] }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <select defaultValue="" className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal">
        <option value="">Selecione</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}
