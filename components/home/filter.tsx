import { ChevronDown } from 'lucide-react'

export function Filter({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="border-t pt-4">
      <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">{title}<ChevronDown className="size-4" /></h3>
      <div className="flex flex-col gap-3 text-sm text-gray-600">{children}</div>
    </section>
  )
}
