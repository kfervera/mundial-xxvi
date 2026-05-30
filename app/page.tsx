'use client'

import { usePartidos } from '@/hooks/usePartidos'
import { useTournamentStats } from '@/hooks/useTournamentStats'
import { calcularMarcador } from '@/lib/marcador'
import TournamentProgressChart from '@/components/dashboard/TournamentProgressChart'
import ResultsDistributionChart from '@/components/dashboard/ResultsDistributionChart'
import GoalsBarChart from '@/components/dashboard/GoalsBarChart'
import TopScorers from '@/components/dashboard/TopScorers'
import MiPronosticoCard from '@/components/dashboard/MiPronosticoCard'

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-1">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-bold text-zinc-800">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { partidos, loading } = usePartidos()
  const stats = useTournamentStats(partidos)

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400 text-sm">
        Cargando...
      </div>
    )
  }

  const maxGoles = stats.maxGolesPartido
  const maxGolesLabel = maxGoles
    ? (() => {
        const p = maxGoles.partido
        const m = calcularMarcador(p)
        const local = p.local?.nombre_corto ?? p.pais_local
        const visitante = p.visitante?.nombre_corto ?? p.pais_visitante
        const score = m ? `${m.goles_local}–${m.goles_visitante}` : '?'
        return `${local} ${score} ${visitante} (${maxGoles.total})`
      })()
    : '—'

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        <MiPronosticoCard />

        {/* Stats visibles siempre */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatPill label="Goles" value={stats.totalGoles} />
          <StatPill label="Partidos" value={`${stats.partidosJugados}/${stats.totalPartidos}`} />
          <div className="col-span-2 sm:col-span-1 flex justify-center">
            <TournamentProgressChart jugados={stats.partidosJugados} total={stats.totalPartidos} />
          </div>
        </div>

        {/* Top goleadores */}
        <TopScorers scorers={stats.topScorers} />

        {/* Stats adicionales — visibles siempre (scroll en mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatPill label="Promedio goles/partido" value={stats.promedioGolesPorPartido} />
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Partido con más goles</p>
            <p className="text-sm font-bold text-zinc-700 mt-1">{maxGolesLabel}</p>
          </div>
        </div>

        <ResultsDistributionChart
          local={stats.victoriaLocal}
          visitante={stats.victoriaVisitante}
          empates={stats.empates}
        />

        <GoalsBarChart data={stats.goalesPorFase} />

      </div>
    </div>
  )
}
