import type { PartidoCompleto, Goleador } from '@/lib/types'
import CountryDisplay from './CountryDisplay'
import ScoreInput from './ScoreInput'

interface MatchCardProps {
  partido: PartidoCompleto
}

function formatDate(fechaStr: string): string {
  const date = new Date(fechaStr)
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${dias[date.getDay()]} ${date.getDate()} ${meses[date.getMonth()]} · ${hh}:${mm}`
}

function formatMinuto(g: Goleador): string {
  let m = `${g.minuto}'`
  if (g.es_penal) m += ' (P)'
  if (g.es_autogol) m += ' (AG)'
  return m
}

interface GoalRow {
  label: string
  minutes: string[]
}

function buildGoalRows(
  partido: PartidoCompleto,
  side: 'local' | 'visitante',
): GoalRow[] {
  const teamCode = side === 'local' ? partido.pais_local : partido.pais_visitante
  const opponentCode = side === 'local' ? partido.pais_visitante : partido.pais_local

  const mine = partido.goleadores.filter(
    (g) => g.pais_jugador === teamCode && !g.es_autogol,
  )
  const theirOwn = partido.goleadores.filter(
    (g) => g.pais_jugador === opponentCode && g.es_autogol,
  )

  const all = [...mine, ...theirOwn].sort((a, b) => a.minuto - b.minuto)

  const map: Record<string, GoalRow> = {}
  for (const g of all) {
    const key = `${g.nombre_jugador ?? '?'}-${g.numero_jugador ?? ''}`
    const nameLabel = g.nombre_jugador
      ? `${g.numero_jugador ? `(${g.numero_jugador}) ` : ''}${g.nombre_jugador}`
      : g.numero_jugador
        ? `(${g.numero_jugador})`
        : '?'
    if (!map[key]) map[key] = { label: nameLabel, minutes: [] }
    map[key].minutes.push(formatMinuto(g))
  }

  return Object.values(map)
}

export default function MatchCard({ partido }: MatchCardProps) {
  const localColor = partido.local?.background_color ?? '#94a3b8'
  const visitanteColor = partido.visitante?.background_color ?? '#94a3b8'
  const hasGoleadores = partido.goleadores.length > 0 && partido.jugado

  const localRows = buildGoalRows(partido, 'local')
  const visitanteRows = buildGoalRows(partido, 'visitante')

  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden"
      style={{ borderLeft: `4px solid ${localColor}`, borderRight: `4px solid ${visitanteColor}` }}
    >
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[11px] font-semibold text-zinc-500 truncate">
          {partido.estadio} · {partido.lugar}
        </p>
        <p className="text-[11px] text-zinc-400">{formatDate(partido.fecha)}</p>
      </div>

      <div className="flex items-center justify-between px-2 py-2 gap-2">
        <CountryDisplay pais={partido.local} placeholder={partido.pais_local} />
        <ScoreInput partido={partido} />
        <CountryDisplay pais={partido.visitante} placeholder={partido.pais_visitante} />
      </div>

      {hasGoleadores && (
        <div className="border-t border-zinc-100 px-3 py-2 space-y-1">
          {localRows.map((row) => (
            <div key={row.label} className="flex items-baseline gap-1 text-[11px] text-zinc-600">
              <span className="font-medium truncate max-w-[120px]">{row.label}</span>
              <span className="text-zinc-400">{row.minutes.join(', ')}</span>
            </div>
          ))}
          {localRows.length > 0 && visitanteRows.length > 0 && (
            <div className="border-t border-zinc-100 my-1" />
          )}
          {visitanteRows.map((row) => (
            <div key={row.label} className="flex items-baseline gap-1 text-[11px] text-zinc-600">
              <span className="font-medium truncate max-w-[120px]">{row.label}</span>
              <span className="text-zinc-400">{row.minutes.join(', ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
