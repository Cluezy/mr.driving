'use client'
import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/useGameStore'

// Speedometer SVG gauge
function Speedometer({ speed }: { speed: number }) {
  const maxSpeed = 300
  const angle = (speed / maxSpeed) * 240 - 120 // -120° to +120°
  const rad = (angle * Math.PI) / 180

  const needleX = 50 + 35 * Math.sin(rad)
  const needleY = 50 - 35 * Math.cos(rad)

  const speedColor =
    speed < 100 ? '#22c55e' : speed < 200 ? '#f59e0b' : '#ef4444'

  // Arc path for gauge background
  const polarToCart = (deg: number, r: number) => {
    const r2 = (deg * Math.PI) / 180
    return { x: 50 + r * Math.sin(r2), y: 50 - r * Math.cos(r2) }
  }

  const start = polarToCart(-120, 40)
  const end = polarToCart(120, 40)

  return (
    <div className="relative w-40 h-40">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="rgba(0,0,0,0.75)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Track arc */}
        <path
          d={`M ${start.x} ${start.y} A 40 40 0 1 1 ${end.x} ${end.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Speed arc fill */}
        {speed > 0 && (
          <path
            d={`M ${start.x} ${start.y} A 40 40 0 ${speed > 150 ? 1 : 0} 1 ${needleX} ${needleY}`}
            fill="none"
            stroke={speedColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}

        {/* Tick marks */}
        {Array.from({ length: 13 }, (_, i) => {
          const tickAngle = -120 + i * 20
          const isMajor = i % 4 === 0
          const inner = isMajor ? 34 : 37
          const outer = 42
          const p1 = polarToCart(tickAngle, inner)
          const p2 = polarToCart(tickAngle, outer)
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={isMajor ? 1.5 : 0.8}
            />
          )
        })}

        {/* Needle */}
        <line
          x1="50"
          y1="50"
          x2={needleX}
          y2={needleY}
          stroke={speedColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="4" fill={speedColor} />
        <circle cx="50" cy="50" r="2" fill="#fff" />

        {/* Speed number */}
        <text x="50" y="68" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui">
          {Math.round(speed)}
        </text>
        <text x="50" y="76" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6" fontFamily="system-ui">
          KM/H
        </text>
      </svg>
    </div>
  )
}

// Nitro bar
function NitroBar({ nitro, active }: { nitro: number; active: boolean }) {
  return (
    <div className="w-40 mt-2">
      <div className="flex justify-between items-center mb-1">
        <span
          className="text-xs font-bold tracking-widest"
          style={{ color: active ? '#a78bfa' : '#6d28d9', textShadow: active ? '0 0 8px #a78bfa' : 'none' }}
        >
          ⚡ NITRO
        </span>
        <span className="text-xs text-purple-300">{Math.round(nitro)}%</span>
      </div>
      <div className="h-3 rounded-full bg-black/60 border border-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{
            width: `${nitro}%`,
            background: active
              ? 'linear-gradient(90deg, #7c3aed, #a78bfa, #ffffff)'
              : 'linear-gradient(90deg, #4c1d95, #7c3aed)',
            boxShadow: active ? '0 0 12px #a78bfa' : 'none',
            transition: 'box-shadow 0.1s',
          }}
        />
      </div>
    </div>
  )
}

// Damage meter
function DamageMeter({ damage }: { damage: number }) {
  const color = damage < 30 ? '#22c55e' : damage < 70 ? '#f59e0b' : '#ef4444'
  return (
    <div className="w-40 mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold tracking-widest" style={{ color }}>
          🚗 HEALTH
        </span>
        <span className="text-xs" style={{ color }}>{100 - Math.round(damage)}%</span>
      </div>
      <div className="h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${100 - damage}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>
    </div>
  )
}

// Mini map
function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const carState = useGameStore((s) => s.carState)
  const frameRef = useRef(0)

  useEffect(() => {
    let animId: number

    const draw = () => {
      animId = requestAnimationFrame(draw)
      frameRef.current++
      if (frameRef.current % 3 !== 0) return

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const scale = 0.35 // world units per pixel

      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = 'rgba(0,0,0,0.75)'
      ctx.beginPath()
      ctx.arc(cx, cy, cx, 0, Math.PI * 2)
      ctx.fill()

      // Clip to circle
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2)
      ctx.clip()

      // Draw roads
      ctx.fillStyle = '#444'
      // Main highway (vertical)
      ctx.fillRect(cx - 11 * scale, 0, 22 * scale, h)
      // Cross road (horizontal at world z=80)
      const crossZ = cy - 80 * scale
      ctx.fillRect(0, crossZ - 11 * scale, w, 22 * scale)

      // Car position (from store — approximate from speed/state)
      // We'll center the car on the map
      ctx.fillStyle = '#22c55e'
      ctx.shadowColor = '#22c55e'
      ctx.shadowBlur = 6
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Border
      ctx.restore()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, cx - 1, 0, Math.PI * 2)
      ctx.stroke()
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={150}
        height={150}
        className="rounded-full"
        style={{ imageRendering: 'pixelated' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-white/30 font-mono pointer-events-none"
        style={{ marginTop: 55 }}
      >
        MAP
      </div>
    </div>
  )
}

// Score display
function ScoreDisplay() {
  const { carState } = useGameStore()

  return (
    <div className="flex flex-col gap-1">
      <div className="text-right">
        <div className="text-xs text-white/40 font-mono">SCORE</div>
        <div className="text-2xl font-bold text-white font-mono tabular-nums">
          {Math.floor(carState.totalScore).toLocaleString()}
        </div>
      </div>
    </div>
  )
}

// Camera mode buttons
function CameraModeButtons() {
  const { cameraMode, setCameraMode } = useGameStore()

  const modes: Array<{ id: 'chase' | 'firstperson' | 'topdown'; label: string }> = [
    { id: 'chase', label: 'CHASE' },
    { id: 'firstperson', label: 'FP' },
    { id: 'topdown', label: 'TOP' },
  ]

  return (
    <div className="flex gap-1">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => setCameraMode(m.id)}
          className="px-3 py-1 text-xs font-bold rounded transition-all"
          style={{
            background: cameraMode === m.id ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.6)',
            color: cameraMode === m.id ? '#000' : 'rgba(255,255,255,0.7)',
            border: `1px solid ${cameraMode === m.id ? 'white' : 'rgba(255,255,255,0.2)'}`,
            pointerEvents: 'auto',
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

// Day/Night button
function DayNightButton() {
  const { settings, toggleDayNight } = useGameStore()

  return (
    <button
      onClick={toggleDayNight}
      className="px-3 py-1 text-xs font-bold rounded transition-all"
      style={{
        background: 'rgba(0,0,0,0.6)',
        color: 'rgba(255,255,255,0.8)',
        border: '1px solid rgba(255,255,255,0.2)',
        pointerEvents: 'auto',
      }}
    >
      {settings.dayNight === 'day' ? '🌙 NIGHT' : '☀️ DAY'}
    </button>
  )
}

// Controls hint
function ControlsHint() {
  return (
    <div
      className="rounded-lg p-2 text-[10px] leading-5 font-mono"
      style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="text-white/80 font-bold mb-1 text-xs">CONTROLS</div>
      <div className="text-white/50">W/↑ — Accelerate</div>
      <div className="text-white/50">S/↓ — Brake / Rev</div>
      <div className="text-white/50">A/← D/→ — Steer</div>
      <div className="text-white/50">SPACE — Handbrake</div>
      <div className="text-white/50">Drag mouse — Rotate view</div>
      <div className="text-white/50">N — Nitro ⚡</div>
      <div className="text-white/50">R — Reset car</div>
      <div className="text-white/50">P/ESC — Pause</div>
      <div className="text-white/50">C — Camera</div>
    </div>
  )
}

export default function HUD() {
  const { carState, settings, gameState, setGameState } = useGameStore()
  const isPlaying = gameState === 'playing'

  if (!isPlaying) return null

  return (
    <>
      <style>{`
        @keyframes pulse {
          from { opacity: 0.7; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1.02); }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes speedPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-10 pointer-events-none select-none"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4">
          {/* Top-left: Score / Drift */}
          <div>
            <ScoreDisplay />
          </div>

          {/* Top-center: Camera buttons + Day/Night */}
          <div className="flex flex-col items-center gap-2">
            <CameraModeButtons />
            {/* <DayNightButton /> */}
          </div>

          {/* Top-right: Pause button */}
          <button
            className="text-xs font-bold px-3 py-1 rounded"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.8)',
              pointerEvents: 'auto',
            }}
            onClick={() => setGameState('paused')}
          >
            ⏸ PAUSE
          </button>
        </div>

        {/* Speed lines overlay when going very fast */}
        {carState.speed > 150 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, transparent 30%, rgba(255,255,255,${Math.min(0.12, (carState.speed - 150) / 1500)
                }) 100%)`,
              animation: 'speedPulse 0.15s ease-in-out infinite',
            }}
          />
        )}

        {/* Bottom layout */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4">
          {/* Bottom-left: Mini map + Controls */}
          <div className="flex flex-col gap-3 items-start">
            <ControlsHint />
            <MiniMap />
          </div>

          {/* Bottom-right: Speedometer + Nitro + Health */}
          <div className="flex flex-col items-center gap-1">
            <Speedometer speed={carState.speed} />
            <NitroBar nitro={carState.nitro} active={carState.isNitroActive} />
            <DamageMeter damage={carState.damage} />
          </div>
        </div>

        {/* Nitro active glow */}
        {carState.isNitroActive && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 80px rgba(124,58,237,0.25)',
              animation: 'pulse 0.2s ease-in-out infinite alternate',
            }}
          />
        )}

      </div>
    </>
  )
}
