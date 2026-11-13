export function SpecBlock({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-gray-50 p-5">
      <h3 className="mb-4 font-bold">{title}</h3>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  )
}
