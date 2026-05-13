import StartMenu from '@/components/ui/StartMenu'
import PauseMenu from '@/components/ui/PauseMenu'
import SettingsMenu from '@/components/ui/SettingsMenu'
import MobileWarning from '@/components/ui/MobileWarning'
import GameSceneClient from '@/components/game/GameSceneClient'

export default function Page() {
  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D game scene — always mounted for performance */}
      <GameSceneClient />

      {/* UI overlays */}
      <StartMenu />
      <PauseMenu />
      <SettingsMenu />

      {/* Mobile warning */}
      <MobileWarning />
    </main>
  )
}
