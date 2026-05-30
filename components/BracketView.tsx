'use client'

import Image from 'next/image'
import { usePartidos } from '@/hooks/usePartidos'
import { calcularMarcador } from '@/lib/marcador'
import type { PartidoCompleto } from '@/lib/types'

const BRACKET_PHASES = [
  { fase: 'Dieciseisavos de final', label: 'R32', count: 16 },
  { fase: 'Octavos de final', label: 'R16', count: 8 },
  { fase: 'Cuartos de final', label: 'QF', count: 4 },
  { fase: 'Semifinal', label: 'SF', count: 2 },
  { fase: 'Final', label: 'Final', count: 1 },
]

function BracketMiniCard({ partido }: { partido: PartidoCompleto }) {
  const marcador = partido.jugado ? calcularMarcador(partido) : null
  const flagSize = 18

  function TeamRow({ pais, code, isLocal }: { pais: PartidoCompleto['local']; code: string; isLocal: boolean }) {
    const score = isLocal ? marcador?.goles_local : marcador?.goles_visitante
    return (
      <div className="flex items-center gap-1.5 px-2 py-1">
        {pais ? (
          <Image
            src={pais.url_flag}
            alt={pais.nombre_largo}
            width={flagSize}
            height={flagSize}
            className="object-contain rounded-sm shrink-0"
          />
        ) : (
          <div className="w-[18px] h-[18px] rounded bg-zinc-200 shrink-0" />
        )}
        <span className="text-[11px] font-medium text-zinc-700 truncate flex-1 min-w-0">
          {pais ? pais.nombre_corto : code}
        </span>
        {marcador != null && (
          <span className="text-[11px] font-bold tabular-nums text-zinc-800 ml-auto pl-1">{score}</span>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-zinc-200 rounded shadow-sm overflow-hidden w-[140px] shrink-0">
      <TeamRow pais={partido.local} code={partido.pais_local} isLocal={true} />
      <div className="border-t border-zinc-100" />
      <TeamRow pais={partido.visitante} code={partido.pais_visitante} isLocal={false} />
      {marcador?.penales_local != null && (
        <div className="text-center text-[10px] text-zinc-400 pb-1">
          ({marcador.penales_local}–{marcador.penales_visitante} pen.)
        </div>
      )}
    </div>
  )
}

function BracketColumn({
  fase,
  label,
  count,
  partidos,
}: {
  fase: string
  label: string
  count: number
  partidos: PartidoCompleto[]
}) {
  const items = partidos.filter((p) => p.fase === fase).slice(0, count)

  return (
    <div className="flex flex-col" style={{ width: 152 }}>
      <div className="text-center text-[11px] font-bold tracking-widest uppercase text-zinc-400 pb-2">{label}</div>
      <div className="flex flex-col flex-1 gap-0">
        {Array.from({ length: count }).map((_, i) => {
          const partido = items[i]
          return (
            <div key={i} className="flex flex-1 items-center justify-center px-1">
              {partido ? (
                <BracketMiniCard partido={partido} />
              ) : (
                <div className="w-[140px] h-10 bg-zinc-100 rounded border border-dashed border-zinc-200" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function BracketView() {
  const { partidos, loading, error } = usePartidos()

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">Cargando bracket...</div>
  }
  if (error) {
    return <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>
  }

  const tercerPuesto = partidos.find((p) => p.fase === 'Partido por el tercer puesto')

  return (
    <div className="flex-1 overflow-auto pb-20 pt-4">
      <div className="flex items-stretch gap-2 px-4" style={{ minWidth: BRACKET_PHASES.length * 160, height: 16 * 72 }}>
        {BRACKET_PHASES.map(({ fase, label, count }) => (
          <BracketColumn
            key={fase}
            fase={fase}
            label={label}
            count={count}
            partidos={partidos}
          />
        ))}
      </div>

      {tercerPuesto && (
        <div className="px-4 mt-6">
          <p className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mb-2 text-center">
            3.er Puesto
          </p>
          <div className="flex justify-center">
            <BracketMiniCard partido={tercerPuesto} />
          </div>
        </div>
      )}
    </div>
  )
}
