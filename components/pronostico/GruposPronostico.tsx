'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { usePaises } from '@/hooks/usePaises'
import { usePronostico } from '@/context/PronosticoContext'
import type { Pais } from '@/lib/types'

const GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

function SortableTeamItem({ pais, position }: { pais: Pais; position: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pais.codigo })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? '#f4f4f5' : pais.background_color,
    color: isDragging ? '#52525b' : pais.text_color,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  const positionLabel = ['1°', '2°', '3°', '4°'][position]
  const positionColors = ['#16a34a', '#2563eb', '#d97706', '#dc2626']

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing touch-none select-none"
    >
      <span
        className="text-[11px] font-bold w-5 text-center shrink-0 rounded"
        style={{ color: positionColors[position] ?? '#71717a', backgroundColor: 'rgba(255,255,255,0.7)', padding: '1px 2px' }}
      >
        {positionLabel}
      </span>
      <Image
        src={pais.url_flag}
        alt={pais.nombre_largo}
        width={28}
        height={20}
        className="object-contain rounded-sm shrink-0"
      />
      <span className="flex-1 text-sm font-semibold truncate">{pais.nombre_largo}</span>
      <div
        className="shrink-0 opacity-50"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </div>
    </div>
  )
}

function GrupoBlock({
  grupo,
  teams,
  order,
  onReorder,
}: {
  grupo: string
  teams: Pais[]
  order: string[]
  onReorder: (newOrder: string[]) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const orderedTeams = useMemo(() => {
    return order.map(code => teams.find(t => t.codigo === code)).filter(Boolean) as Pais[]
  }, [order, teams])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = order.indexOf(active.id as string)
    const newIndex = order.indexOf(over.id as string)
    onReorder(arrayMove(order, oldIndex, newIndex))
  }

  return (
    <section className="mb-6">
      <h3 className="px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-zinc-500 bg-zinc-100 sticky top-0 z-10">
        Grupo {grupo}
      </h3>
      <div className="px-4 pt-3 space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            {orderedTeams.map((pais, i) => (
              <SortableTeamItem key={pais.codigo} pais={pais} position={i} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </section>
  )
}

export default function GruposPronostico({ onComplete }: { onComplete?: () => void }) {
  const { paises, loading } = usePaises()
  const { state, setGrupoOrder, completeGrupos } = usePronostico()

  function handleContinue() {
    // Persist orders for any group not yet explicitly saved
    GRUPOS.forEach(grupo => {
      if (!state.grupos[grupo]) {
        const defaultOrder = paisesPerGrupo[grupo]?.map(p => p.codigo) ?? []
        if (defaultOrder.length > 0) setGrupoOrder(grupo, defaultOrder)
      }
    })
    completeGrupos()
    onComplete?.()
  }

  const paisesPerGrupo = useMemo(() => {
    const map: Record<string, Pais[]> = {}
    for (const p of paises) {
      if (!map[p.grupo]) map[p.grupo] = []
      map[p.grupo].push(p)
    }
    return map
  }, [paises])

  const getOrder = (grupo: string): string[] => {
    if (state.grupos[grupo]) return state.grupos[grupo]
    return paisesPerGrupo[grupo]?.map(p => p.codigo) ?? []
  }

  const allGroupsDone = GRUPOS.every(g => {
    const teams = paisesPerGrupo[g]
    return teams && getOrder(g).length === teams.length
  })

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">Cargando equipos...</div>
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-4">
        <p className="px-4 pt-4 pb-2 text-xs text-zinc-500">
          Arrastrá los equipos para ordenarlos según tu pronóstico de clasificación.
        </p>
        {GRUPOS.filter(g => paisesPerGrupo[g]?.length > 0).map(grupo => (
          <GrupoBlock
            key={grupo}
            grupo={grupo}
            teams={paisesPerGrupo[grupo]}
            order={getOrder(grupo)}
            onReorder={(newOrder) => setGrupoOrder(grupo, newOrder)}
          />
        ))}
      </div>

      <div className="px-4 py-3 bg-white border-t border-zinc-100">
        <button
          onClick={handleContinue}
          disabled={!allGroupsDone}
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
