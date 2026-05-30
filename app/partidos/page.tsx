'use client'

import { useState } from 'react'
import TabNavigator, { type Tab } from '@/components/TabNavigator'
import GruposView from '@/components/GruposView'
import FixtureView from '@/components/FixtureView'
import BracketView from '@/components/BracketView'

export default function PartidosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('grupos')

  return (
    <div className="flex flex-col flex-1">
      {activeTab === 'grupos' && <GruposView />}
      {activeTab === 'fixture' && <FixtureView />}
      {activeTab === 'bracket' && <BracketView />}
      <TabNavigator activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
