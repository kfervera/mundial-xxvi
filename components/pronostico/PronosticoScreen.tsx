'use client'

import { useState } from 'react'
import { Grid3X3, Award, Trophy } from 'lucide-react'
import { RotateCcw } from 'lucide-react'
import { usePronostico } from '@/context/PronosticoContext'
import GruposPronostico from './GruposPronostico'
import TercerosPronostico from './TercerosPronostico'
import KnockoutPronostico, { type KnockoutFase } from './KnockoutPronostico'

type Phase =
  | 'grupos'
  | 'terceros'
  | 'dieciseisavos'
  | 'octavos'
  | 'cuartos'
  | 'semifinal'
  | 'final'

interface PhaseConfig {
  id: Phase
  label: string
  shortLabel: string
  Icon: React.ElementType | null
  isUnlocked: (state: ReturnType<typeof usePronostico>['state']) => boolean
}

const PHASES: PhaseConfig[] = [
  {
    id: 'grupos',
    label: 'Grupos',
    shortLabel: 'Grupos',
    Icon: Grid3X3,
    isUnlocked: () => true,
  },
  {
    id: 'terceros',
    label: 'Mejores 3ros',
    shortLabel: '3ros',
    Icon: Award,
    isUnlocked: s => s.gruposCompleted,
  },
  {
    id: 'dieciseisavos',
    label: '16avos',
    shortLabel: '16avos',
    Icon: null,
    isUnlocked: s => s.tercerosCompleted,
  },
  {
    id: 'octavos',
    label: '8avos',
    shortLabel: '8avos',
    Icon: null,
    isUnlocked: s => s.dieciseisavosCompleted,
  },
  {
    id: 'cuartos',
    label: '4tos',
    shortLabel: '4tos',
    Icon: null,
    isUnlocked: s => s.octavosCompleted,
  },
  {
    id: 'semifinal',
    label: 'Semifinal',
    shortLabel: 'Semi',
    Icon: null,
    isUnlocked: s => s.cuartosCompleted,
  },
  {
    id: 'final',
    label: 'Final',
    shortLabel: 'Final',
    Icon: Trophy,
    isUnlocked: s => s.semifinalCompleted,
  },
]

const PHASE_TITLES: Record<Phase, string> = {
  grupos: 'Fase de Grupos',
  terceros: 'Mejores Terceros',
  dieciseisavos: 'Dieciseisavos de Final',
  octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final',
  semifinal: 'Semifinal',
  final: 'Final',
}

export default function PronosticoScreen() {
  const { state, reset } = usePronostico()
  const [activePhase, setActivePhase] = useState<Phase>('grupos')

  function handlePhaseClick(phase: Phase) {
    const config = PHASES.find(p => p.id === phase)
    if (config?.isUnlocked(state)) setActivePhase(phase)
  }

  function handleReset() {
    reset()
    setActivePhase('grupos')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 h-12 bg-white border-b border-zinc-100 shrink-0">
        <h1 className="text-sm font-bold text-zinc-800">{PHASE_TITLES[activePhase]}</h1>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
        >
          <RotateCcw size={13} />
          Limpiar
        </button>
      </div>

      {/* Phase content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {activePhase === 'grupos' && <GruposPronostico onComplete={() => setActivePhase('terceros')} />}
        {activePhase === 'terceros' && <TercerosPronostico onComplete={() => setActivePhase('dieciseisavos')} />}
        {(activePhase === 'dieciseisavos' ||
          activePhase === 'octavos' ||
          activePhase === 'cuartos' ||
          activePhase === 'semifinal' ||
          activePhase === 'final') && (
          <KnockoutPronostico
            fase={activePhase as KnockoutFase}
            onComplete={() => {
              const next: Record<string, Phase> = {
                dieciseisavos: 'octavos',
                octavos: 'cuartos',
                cuartos: 'semifinal',
                semifinal: 'final',
              }
              const nextPhase = next[activePhase]
              if (nextPhase) setActivePhase(nextPhase)
            }}
          />
        )}
      </div>

      {/* Footer phase navigator */}
      <nav className="sticky bottom-0 z-30 bg-white border-t border-zinc-200 flex overflow-x-auto shrink-0 scrollbar-hide">
        {PHASES.map(({ id, shortLabel, Icon, isUnlocked }) => {
          const unlocked = isUnlocked(state)
          const isActive = activePhase === id

          return (
            <button
              key={id}
              onClick={() => handlePhaseClick(id)}
              disabled={!unlocked}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 min-w-[52px] flex-1 transition-colors ${
                isActive
                  ? 'text-zinc-900'
                  : unlocked
                    ? 'text-zinc-400 hover:text-zinc-600'
                    : 'text-zinc-200 cursor-not-allowed'
              }`}
            >
              {Icon ? (
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              ) : (
                <span className={`text-sm font-black leading-none ${isActive ? 'text-zinc-900' : ''}`}>
                  {shortLabel}
                </span>
              )}
              {Icon && (
                <span className="text-[10px] font-medium leading-none mt-0.5">{shortLabel}</span>
              )}
              {!Icon && (
                <div className={`h-0.5 w-4 rounded-full mt-0.5 ${isActive ? 'bg-zinc-900' : 'bg-transparent'}`} />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
