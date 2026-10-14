export function Spec({ name, value }: { name: string, value: string }) {
  return (
    <div className="bg-white p-4">
      <p className="text-xs text-gray-500">{name}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}
