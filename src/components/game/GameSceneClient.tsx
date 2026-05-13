'use client'

import dynamic from 'next/dynamic'

const GameScene = dynamic(() => import('./GameScene'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-white/40 text-sm font-mono animate-pulse">Loading physics engine...</div>
    </div>
  ),
})

export default function GameSceneClient() {
  return <GameScene />
}
