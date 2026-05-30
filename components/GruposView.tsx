'use client'

import { useState } from 'react'
import { LayoutList, Clock } from 'lucide-react'
import { usePartidos } from '@/hooks/usePartidos'
import MatchCard from './MatchCard'

const GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

type ViewMode = 'grupos' | 'timeline'

export default function GruposView() {
  const { partidos, loading, error } = usePartidos('Primera fase')
  const [viewMode, setViewMode] = useState<ViewMode>('grupos')

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">Cargando partidos...</div>
  }
  if (error) {
    return <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-center gap-1 px-4 py-2 bg-white border-b border-zinc-100">
        <button
          onClick={() => setViewMode('grupos')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            viewMode === 'grupos'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <LayoutList size={13} />
          Por grupos
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            viewMode === 'timeline'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Clock size={13} />
          Timeline
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {viewMode === 'grupos' ? (
          GRUPOS.map((grupo) => {
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
          })
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...partidos]
              .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
              .map((partido) => (
                <MatchCard key={partido.num} partido={partido} showGroup />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
