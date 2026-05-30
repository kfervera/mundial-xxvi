'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { calcularMarcador } from '@/lib/marcador'
import type { PartidoCompleto, MarcadorCalculado } from '@/lib/types'

interface LocalScore {
  goles_local: number
  goles_visitante: number
}

interface ScoresContextValue {
  localScores: Record<number, LocalScore>
  setLocalScore: (partidoNum: number, golesLocal: number, golesVisitante: number) => void
  getDisplayScore: (partido: PartidoCompleto) => {
    marcador: MarcadorCalculado | null
    bloqueado: boolean
  }
}

const ScoresContext = createContext<ScoresContextValue | null>(null)

const STORAGE_KEY = 'mundial-xxvi-local-scores'

export function ScoresProvider({ children }: { children: React.ReactNode }) {
  const [localScores, setLocalScores] = useState<Record<number, LocalScore>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localScores))
  }, [localScores])

  function setLocalScore(partidoNum: number, golesLocal: number, golesVisitante: number) {
    setLocalScores((prev) => ({
      ...prev,
      [partidoNum]: { goles_local: golesLocal, goles_visitante: golesVisitante },
    }))
  }

  function getDisplayScore(partido: PartidoCompleto) {
    if (partido.jugado) {
      return { marcador: calcularMarcador(partido), bloqueado: true }
    }
    const local = localScores[partido.num]
    if (!local) return { marcador: null, bloqueado: false }
    return {
      marcador: { goles_local: local.goles_local, goles_visitante: local.goles_visitante },
      bloqueado: false,
    }
  }

  return (
    <ScoresContext value={{ localScores, setLocalScore, getDisplayScore }}>
      {children}
    </ScoresContext>
  )
}

export function useScores() {
  const ctx = useContext(ScoresContext)
  if (!ctx) throw new Error('useScores must be used within ScoresProvider')
  return ctx
}
