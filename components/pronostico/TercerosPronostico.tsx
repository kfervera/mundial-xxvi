'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import { Check } from 'lucide-react'
import { usePaises } from '@/hooks/usePaises'
import { usePronostico } from '@/context/PronosticoContext'
import type { Pais } from '@/lib/types'

const GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function TercerosPronostico({ onComplete }: { onComplete?: () => void }) {
  const { paises } = usePaises()
  const { state, toggleTercero, completeTerceros } = usePronostico()

  const terceros = useMemo(() => {
    return GRUPOS.map(grupo => {
      const orden = state.grupos[grupo] ?? []
      const codigoTercero = orden[2]
      return paises.find(p => p.codigo === codigoTercero) ?? null
    }).filter(Boolean) as Pais[]
  }, [paises, state.grupos])

  const selected = state.mejoresTerceros
  const count = selected.length
  const canContinue = count === 8

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <p className="text-xs text-zinc-500">Seleccioná los 8 mejores terceros que clasifican.</p>
        <span
          className={`text-sm font-bold px-2 py-0.5 rounded-full ${
            count === 8 ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'
          }`}
        >
          Seleccionados: {count}/8
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-4 space-y-2 pt-2">
          {terceros.map(pais => {
            const isSelected = selected.includes(pais.codigo)
            const isDisabled = !isSelected && count >= 8

            return (
              <button
                key={pais.codigo}
                onClick={() => !isDisabled && toggleTercero(pais.codigo)}
                disabled={isDisabled}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: isDisabled ? '#f4f4f5' : isSelected ? pais.background_color : '#ffffff',
                  color: isDisabled ? '#a1a1aa' : isSelected ? pais.text_color : '#18181b',
                  border: isSelected ? `2px solid ${pais.background_color}` : '2px solid #e4e4e7',
                  opacity: isDisabled ? 0.5 : 1,
                }}
              >
                <Image
                  src={pais.url_flag}
                  alt={pais.nombre_largo}
                  width={32}
                  height={22}
                  className="object-contain rounded-sm shrink-0"
                />
                <span className="flex-1 text-sm font-semibold">{pais.nombre_largo}</span>
                <span className="text-xs text-zinc-400 mr-1">3° Grupo {pais.grupo}</span>
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    backgroundColor: isSelected ? '#16a34a' : 'transparent',
                    borderColor: isSelected ? '#16a34a' : '#d4d4d8',
                  }}
                >
                  {isSelected && <Check size={13} color="white" strokeWidth={3} />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-zinc-100">
        <button
          onClick={() => { completeTerceros(); onComplete?.() }}
          disabled={!canContinue}
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
