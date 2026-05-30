'use client'

import { useScores } from '@/context/ScoresContext'
import type { PartidoCompleto } from '@/lib/types'

interface ScoreInputProps {
  partido: PartidoCompleto
}

export default function ScoreInput({ partido }: ScoreInputProps) {
  const { getDisplayScore, setLocalScore } = useScores()
  const { marcador, bloqueado } = getDisplayScore(partido)

  if (bloqueado) {
    return (
      <div className="flex flex-col items-center gap-0.5 min-w-[64px]">
        <div className="flex items-center gap-1.5 text-2xl font-bold tabular-nums">
          <span>{marcador?.goles_local ?? 0}</span>
          <span className="text-zinc-300">–</span>
          <span>{marcador?.goles_visitante ?? 0}</span>
        </div>
        {marcador?.penales_local != null && (
          <span className="text-[11px] text-zinc-400 whitespace-nowrap">
            ({marcador.penales_local}–{marcador.penales_visitante} pen.)
          </span>
        )}
      </div>
    )
  }

  function handleChange(side: 'local' | 'visitante', raw: string) {
    const val = raw === '' ? 0 : parseInt(raw, 10)
    if (isNaN(val) || val < 0) return
    const gl = marcador?.goles_local ?? 0
    const gv = marcador?.goles_visitante ?? 0
    if (side === 'local') setLocalScore(partido.num, val, gv)
    else setLocalScore(partido.num, gl, val)
  }

  return (
    <div className="flex items-center gap-1.5 min-w-[64px] justify-center">
      <input
        type="number"
        min="0"
        value={marcador?.goles_local ?? ''}
        onChange={(e) => handleChange('local', e.target.value)}
        placeholder="–"
        className="w-9 h-9 text-center text-lg font-bold border-2 border-zinc-200 rounded focus:outline-none focus:border-zinc-400 bg-zinc-50"
      />
      <span className="text-zinc-300 font-bold text-lg">–</span>
      <input
        type="number"
        min="0"
        value={marcador?.goles_visitante ?? ''}
        onChange={(e) => handleChange('visitante', e.target.value)}
        placeholder="–"
        className="w-9 h-9 text-center text-lg font-bold border-2 border-zinc-200 rounded focus:outline-none focus:border-zinc-400 bg-zinc-50"
      />
    </div>
  )
}
