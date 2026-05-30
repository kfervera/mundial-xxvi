'use client'

import { useState } from 'react'
import { useScores } from '@/context/ScoresContext'
import type { PartidoCompleto } from '@/lib/types'

interface ScoreInputProps {
  partido: PartidoCompleto
}

export default function ScoreInput({ partido }: ScoreInputProps) {
  const { getDisplayScore, setLocalScore } = useScores()
  const { marcador, bloqueado } = getDisplayScore(partido)

  const [localRaw, setLocalRaw] = useState<string | null>(null)
  const [visitanteRaw, setVisitanteRaw] = useState<string | null>(null)

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

  const localDisplay =
    localRaw !== null
      ? localRaw
      : marcador?.goles_local != null
        ? String(marcador.goles_local)
        : ''

  const visitanteDisplay =
    visitanteRaw !== null
      ? visitanteRaw
      : marcador?.goles_visitante != null
        ? String(marcador.goles_visitante)
        : ''

  function commitLocal(raw: string) {
    if (raw === '') return
    const val = parseInt(raw, 10)
    if (isNaN(val) || val < 0) return
    const gv = marcador?.goles_visitante ?? 0
    setLocalScore(partido.num, val, gv)
  }

  function commitVisitante(raw: string) {
    if (raw === '') return
    const val = parseInt(raw, 10)
    if (isNaN(val) || val < 0) return
    const gl = marcador?.goles_local ?? 0
    setLocalScore(partido.num, gl, val)
  }

  const inputClass =
    'w-9 h-9 text-center text-lg font-bold text-zinc-900 border-2 border-zinc-200 rounded focus:outline-none focus:border-zinc-400 bg-zinc-50'

  return (
    <div className="flex items-center gap-1.5 min-w-[64px] justify-center">
      <input
        type="number"
        min="0"
        value={localDisplay}
        placeholder="–"
        className={inputClass}
        onFocus={() => setLocalRaw('')}
        onChange={(e) => setLocalRaw(e.target.value)}
        onBlur={() => {
          commitLocal(localRaw ?? '')
          setLocalRaw(null)
        }}
      />
      <span className="text-zinc-300 font-bold text-lg">–</span>
      <input
        type="number"
        min="0"
        value={visitanteDisplay}
        placeholder="–"
        className={inputClass}
        onFocus={() => setVisitanteRaw('')}
        onChange={(e) => setVisitanteRaw(e.target.value)}
        onBlur={() => {
          commitVisitante(visitanteRaw ?? '')
          setVisitanteRaw(null)
        }}
      />
    </div>
  )
}
