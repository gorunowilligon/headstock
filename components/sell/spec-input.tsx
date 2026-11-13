export function SpecInput({ label, name, type = 'text', placeholder, min, max, required }: { label: string, name?: string, type?: 'text' | 'number', placeholder?: string, min?: number, max?: number, required?: boolean }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input name={name} type={type} min={min} max={max} placeholder={placeholder} required={required} className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal" />
    </label>
  )
}
