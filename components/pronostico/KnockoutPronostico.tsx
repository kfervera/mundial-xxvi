'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import { Trophy } from 'lucide-react'
import { usePartidos } from '@/hooks/usePartidos'
import { usePaises } from '@/hooks/usePaises'
import { usePronostico } from '@/context/PronosticoContext'
import type { Pais, PronosticoState } from '@/lib/types'

export type KnockoutFase = 'dieciseisavos' | 'octavos' | 'cuartos' | 'semifinal' | 'final'

const FASE_DB: Record<KnockoutFase, string> = {
  dieciseisavos: 'Dieciseisavos de final',
  octavos: 'Octavos de final',
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinal',
  final: 'Final',
}

function resolveTeam(code: string, paises: Pais[], state: PronosticoState): Pais | null {
  if (!code) return null
  const direct = paises.find(p => p.codigo === code)
  if (direct) return direct

  // Position in group: "1A", "2B", "3L"
  const groupPos = code.match(/^([1-4])([A-L])$/)
  if (groupPos) {
    const pos = parseInt(groupPos[1]) - 1
    const grupo = groupPos[2]
    const cp = state.grupos[grupo]?.[pos]
    if (cp) return paises.find(p => p.codigo === cp) ?? null
  }

  // Best third: "T1" through "T12"
  const bestThird = code.match(/^T(\d+)$/)
  if (bestThird) {
    const idx = parseInt(bestThird[1]) - 1
    const cp = state.mejoresTerceros[idx]
    if (cp) return paises.find(p => p.codigo === cp) ?? null
  }

  // Winner of match: "W49"
  const win = code.match(/^W(\d+)$/)
  if (win) {
    const matchNum = parseInt(win[1])
    const cp = state.knockout[matchNum]
    if (cp) return paises.find(p => p.codigo === cp) ?? null
  }

  return null
}

function TeamOption({
  pais,
  code,
  isWinner,
  isLoser,
  onSelect,
}: {
  pais: Pais | null
  code: string
  isWinner: boolean
  isLoser: boolean
  onSelect: () => void
}) {
  const bg = isLoser ? '#e4e4e7' : isWinner && pais ? pais.background_color : pais?.background_color ?? '#f4f4f5'
  const textColor = isLoser ? '#71717a' : isWinner && pais ? pais.text_color : pais?.text_color ?? '#18181b'

  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-3.5 w-full text-left transition-all active:scale-[0.99]"
      style={{ backgroundColor: bg, color: textColor }}
    >
      {pais ? (
        <Image
          src={pais.url_flag}
          alt={pais.nombre_largo}
          width={36}
          height={26}
          className="object-contain rounded-sm shrink-0"
        />
      ) : (
        <div className="w-9 h-6 bg-zinc-300 rounded shrink-0 flex items-center justify-center text-[10px] text-zinc-500 font-bold">
          {code}
        </div>
      )}
      <span className="flex-1 text-sm font-bold">
        {pais ? pais.nombre_largo : code}
      </span>
      {isWinner && (
        <span className="text-xs font-bold uppercase tracking-wide opacity-80">✓</span>
      )}
    </button>
  )
}

function MatchCard({
  partidoNum,
  localCode,
  visitanteCode,
  paises,
  state,
  onPickWinner,
}: {
  partidoNum: number
  localCode: string
  visitanteCode: string
  paises: Pais[]
  state: PronosticoState
  onPickWinner: (code: string) => void
}) {
  const localPais = resolveTeam(localCode, paises, state)
  const visitantePais = resolveTeam(visitanteCode, paises, state)
  const winner = state.knockout[partidoNum]

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-zinc-200 mb-4">
      <TeamOption
        pais={localPais}
        code={localCode}
        isWinner={winner === (localPais?.codigo ?? localCode)}
        isLoser={!!winner && winner !== (localPais?.codigo ?? localCode)}
        onSelect={() => onPickWinner(localPais?.codigo ?? localCode)}
      />
      <div className="flex items-center justify-center h-7 bg-white">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">VS</span>
      </div>
      <TeamOption
        pais={visitantePais}
        code={visitanteCode}
        isWinner={winner === (visitantePais?.codigo ?? visitanteCode)}
        isLoser={!!winner && winner !== (visitantePais?.codigo ?? visitanteCode)}
        onSelect={() => onPickWinner(visitantePais?.codigo ?? visitanteCode)}
      />
    </div>
  )
}

function CampeonDisplay({ campeonCode, paises, onCambiar }: { campeonCode: string; paises: Pais[]; onCambiar: () => void }) {
  const campeon = paises.find(p => p.codigo === campeonCode)
  if (!campeon) return null

  return (
    <div
      className="flex flex-col items-center justify-center flex-1 min-h-0 px-6 py-10 gap-6"
      style={{ backgroundColor: campeon.background_color, color: campeon.text_color }}
    >
      <div className="text-center space-y-1">
        <p className="text-sm font-bold tracking-widest uppercase opacity-70">¡CAMPEÓN!</p>
        <p className="text-4xl font-black tracking-tight">{campeon.nombre_largo}</p>
      </div>
      <Image
        src={campeon.url_flag}
        alt={campeon.nombre_largo}
        width={160}
        height={110}
        className="object-contain rounded-xl shadow-xl"
      />
      <Trophy size={48} strokeWidth={1.5} className="opacity-60" />
      <button
        onClick={onCambiar}
        className="mt-2 text-xs underline opacity-60"
      >
        Cambiar selección
      </button>
    </div>
  )
}

interface KnockoutPronosticoProps {
  fase: KnockoutFase
  onComplete?: () => void
}

export default function KnockoutPronostico({ fase, onComplete }: KnockoutPronosticoProps) {
  const { partidos, loading } = usePartidos(FASE_DB[fase])
  const { paises } = usePaises()
  const { state, setKnockoutWinner, completeKnockoutPhase, setCampeon } = usePronostico()

  const isFinal = fase === 'final'
  const allPicked = partidos.length > 0 && partidos.every(p => !!state.knockout[p.num])

  function handlePickWinner(partidoNum: number, winnerCode: string) {
    setKnockoutWinner(partidoNum, winnerCode)
    if (isFinal) setCampeon(winnerCode)
  }

  function handleContinue() {
    completeKnockoutPhase(fase as Exclude<KnockoutFase, 'final'>)
    onComplete?.()
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">Cargando partidos...</div>
  }

  if (isFinal && state.campeon) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <CampeonDisplay
          campeonCode={state.campeon}
          paises={paises}
          onCambiar={() => {
            const finalPartido = partidos[0]
            if (finalPartido) {
              setKnockoutWinner(finalPartido.num, '')
            }
            setCampeon(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <p className="px-4 pt-4 pb-2 text-xs text-zinc-500">
        Seleccioná el equipo ganador de cada partido.
      </p>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {partidos.map(partido => (
          <MatchCard
            key={partido.num}
            partidoNum={partido.num}
            localCode={partido.pais_local}
            visitanteCode={partido.pais_visitante}
            paises={paises}
            state={state}
            onPickWinner={(code) => handlePickWinner(partido.num, code)}
          />
        ))}
      </div>

      {!isFinal && (
        <div className="px-4 py-3 bg-white border-t border-zinc-100">
          <button
            onClick={handleContinue}
            disabled={!allPicked}
            className="w-full py-3 rounded-xl font-bold text-sm text-white bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            Continuar →
          </button>
        </div>
      )}
    </div>
  )
}
