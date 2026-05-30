'use client'

import { usePartidos } from '@/hooks/usePartidos'
import MatchCard from './MatchCard'

const FASES_ELIMINACION = [
  'Dieciseisavos de final',
  'Octavos de final',
  'Cuartos de final',
  'Semifinal',
  'Partido por el tercer puesto',
  'Final',
]

export default function FixtureView() {
  const { partidos, loading, error } = usePartidos()

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">Cargando partidos...</div>
  }
  if (error) {
    return <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      {FASES_ELIMINACION.map((fase) => {
        const partidosFase = partidos.filter((p) => p.fase === fase)
        if (partidosFase.length === 0) return null
        return (
          <section key={fase}>
            <h2 className="px-4 py-2 text-xs font-bold tracking-widest uppercase text-zinc-500 bg-zinc-100 sticky top-0 z-10">
              {fase}
            </h2>
            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {partidosFase.map((partido) => (
                <MatchCard key={partido.num} partido={partido} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
