'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { PronosticoState } from '@/lib/types'

const STORAGE_KEY = 'mundial-xxvi-pronostico'

const DEFAULT_STATE: PronosticoState = {
  grupos: {},
  gruposCompleted: false,
  mejoresTerceros: [],
  tercerosCompleted: false,
  knockout: {},
  dieciseisavosCompleted: false,
  octavosCompleted: false,
  cuartosCompleted: false,
  semifinalCompleted: false,
  campeon: null,
}

interface PronosticoContextValue {
  state: PronosticoState
  setGrupoOrder: (grupo: string, order: string[]) => void
  completeGrupos: () => void
  toggleTercero: (codigo: string) => void
  completeTerceros: () => void
  setKnockoutWinner: (partidoNum: number, winnerCode: string) => void
  completeKnockoutPhase: (fase: 'dieciseisavos' | 'octavos' | 'cuartos' | 'semifinal') => void
  setCampeon: (codigo: string | null) => void
  reset: () => void
}

const PronosticoContext = createContext<PronosticoContextValue | null>(null)

export function PronosticoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PronosticoState>(DEFAULT_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as PronosticoState
        setState({ ...DEFAULT_STATE, ...parsed })
      }
    } catch {
      // ignore corrupt data
    }
    setHydrated(true)
  }, [])

  const persist = useCallback((next: PronosticoState) => {
    setState(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore storage errors
    }
  }, [])

  const setGrupoOrder = useCallback((grupo: string, order: string[]) => {
    setState(prev => {
      const next = { ...prev, grupos: { ...prev.grupos, [grupo]: order } }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const completeGrupos = useCallback(() => {
    setState(prev => {
      const next = { ...prev, gruposCompleted: true }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const toggleTercero = useCallback((codigo: string) => {
    setState(prev => {
      const selected = prev.mejoresTerceros
      const isSelected = selected.includes(codigo)
      const next = isSelected
        ? { ...prev, mejoresTerceros: selected.filter(c => c !== codigo) }
        : selected.length < 8
          ? { ...prev, mejoresTerceros: [...selected, codigo] }
          : prev
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const completeTerceros = useCallback(() => {
    setState(prev => {
      const next = { ...prev, tercerosCompleted: true }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const setKnockoutWinner = useCallback((partidoNum: number, winnerCode: string) => {
    setState(prev => {
      const next = { ...prev, knockout: { ...prev.knockout, [partidoNum]: winnerCode } }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const completeKnockoutPhase = useCallback((fase: 'dieciseisavos' | 'octavos' | 'cuartos' | 'semifinal') => {
    const key = `${fase}Completed` as keyof PronosticoState
    setState(prev => {
      const next = { ...prev, [key]: true }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const setCampeon = useCallback((codigo: string | null) => {
    setState(prev => {
      const next = { ...prev, campeon: codigo }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const reset = useCallback(() => {
    persist(DEFAULT_STATE)
  }, [persist])

  if (!hydrated) return null

  return (
    <PronosticoContext.Provider value={{
      state,
      setGrupoOrder,
      completeGrupos,
      toggleTercero,
      completeTerceros,
      setKnockoutWinner,
      completeKnockoutPhase,
      setCampeon,
      reset,
    }}>
      {children}
    </PronosticoContext.Provider>
  )
}

export function usePronostico() {
  const ctx = useContext(PronosticoContext)
  if (!ctx) throw new Error('usePronostico must be used within PronosticoProvider')
  return ctx
}
