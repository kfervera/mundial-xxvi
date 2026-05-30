'use client'

import { usePartidos } from '@/hooks/usePartidos'
import MatchCard from './MatchCard'

const GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function GruposView() {
  const { partidos, loading, error } = usePartidos('Primera fase')

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">Cargando partidos...</div>
  }
  if (error) {
    return <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      {GRUPOS.map((grupo) => {
        const partidosGrupo = partidos.filter((p) => p.grupo === grupo)
        if (partidosGrupo.length === 0) return null
        return (
          <section key={grupo}>
            <h2 className="px-4 py-2 text-xs font-bold tracking-widest uppercase text-zinc-500 bg-zinc-100 sticky top-0 z-10">
              Grupo {grupo}
            </h2>
            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {partidosGrupo.map((partido) => (
                <MatchCard key={partido.num} partido={partido} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
