'use client'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Sky, Stars, Environment } from '@react-three/drei'
import { useGameStore } from '@/store/useGameStore'
import Car from './Car'
import CameraController from './CameraController'
import GameMap from './GameMap'
import HUD from './HUD'
import Effects from './Effects'

function SceneLighting({ dayNight }: { dayNight: 'day' | 'night' }) {
  if (dayNight === 'day') {
    return (
      <>
        <Sky sunPosition={[100, 50, 100]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          castShadow
          position={[100, 100, 50]}
          intensity={1.5}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={1}
          shadow-camera-far={500}
          shadow-camera-left={-200}
          shadow-camera-right={200}
          shadow-camera-top={200}
          shadow-camera-bottom={-200}
        />
        <hemisphereLight args={['#87ceeb', '#4a7c59', 0.4]} />
      </>
    )
  }

  return (
    <>
      <Stars radius={200} depth={60} count={5000} factor={4} saturation={0} />
      <ambientLight intensity={0.08} color="#223366" />
      <pointLight position={[0, 50, 0]} intensity={0.8} color="#4466ff" distance={300} />
      <pointLight position={[-50, 20, 80]} intensity={0.5} color="#ff6644" distance={150} />
      <pointLight position={[50, 20, -80]} intensity={0.5} color="#44ff88" distance={150} />
    </>
  )
}

export default function GameScene() {
  const { settings, gameState } = useGameStore()
  const dayNight = settings.dayNight

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        shadows={settings.shadowsEnabled}
        camera={{ fov: 75, near: 0.1, far: 2000, position: [0, 8, 20] }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.2]}
      >
        <Suspense fallback={null}>
          <SceneLighting dayNight={dayNight} />

          <Physics
            gravity={[0, -30, 0]}
            timeStep={1 / 60}
          >
            <GameMap />
            <Car />
          </Physics>

          <CameraController />
          <Effects />
        </Suspense>
      </Canvas>

      {/* HUD is HTML overlay — rendered outside Canvas */}
      <HUD />
    </div>
  )
}
