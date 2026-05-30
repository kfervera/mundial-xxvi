'use client'

import { Grid3X3, Trophy, GitFork } from 'lucide-react'

export type Tab = 'grupos' | 'fixture' | 'bracket'

interface TabNavigatorProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'grupos', label: 'Fase de grupos', Icon: Grid3X3 },
  { id: 'fixture', label: 'Fixture final', Icon: Trophy },
  { id: 'bracket', label: 'Cuadrangular', Icon: GitFork },
]

export default function TabNavigator({ activeTab, onTabChange }: TabNavigatorProps) {
  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-zinc-200 flex">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex flex-1 flex-col sm:flex-row items-center justify-center gap-1 py-3 px-2 transition-colors text-xs font-medium ${
            activeTab === id ? 'text-[#2B54FE]' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 1.8} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </nav>
  )
}
