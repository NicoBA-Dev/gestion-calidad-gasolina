export function Header({ title = 'El Surtidor Cochabambino' }) {
  return (
    <header className="bg-brand-red text-white px-6 py-4 flex items-center justify-between">
      <h2 className="font-semibold">{title}</h2>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar..."
          className="bg-white/10 placeholder-white/60 text-sm px-3 py-1.5 rounded-md border border-white/20 focus:outline-none"
        />
      </div>
    </header>
  )
}