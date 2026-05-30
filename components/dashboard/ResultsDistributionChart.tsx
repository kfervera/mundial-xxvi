'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ResultsDistributionChartProps {
  local: number
  visitante: number
  empates: number
}

const COLORS = ['#2B54FE', '#E70D01', '#B494FF']

export default function ResultsDistributionChart({ local, visitante, empates }: ResultsDistributionChartProps) {
  const data = [
    { name: 'Local', value: local },
    { name: 'Visitante', value: visitante },
    { name: 'Empate', value: empates },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center gap-2 min-h-[160px]">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Resultados</p>
        <p className="text-xs text-zinc-400">Sin datos aún</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Distribución de resultados</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={60} dataKey="value" strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => [`${v} partidos`]} />
          <Legend iconSize={10} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
