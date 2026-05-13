'use client'
import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/useGameStore'

export default function StartMenu() {
  const { setGameState, gameState } = useGameStore()
  const [mounted, setMounted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (gameState !== 'menu') return null

  const handleStart = () => {
    setGameState('playing')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%)',
      }}
    >
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'gridMove 8s linear infinite',
        }}
      />

      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 20px #e63946, 0 0 60px #e63946, 0 0 100px #e63946; }
          50% { text-shadow: 0 0 30px #ff6b6b, 0 0 80px #e63946, 0 0 120px #c1121f; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .start-btn {
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .start-btn:hover {
          transform: scale(1.03) translateY(-2px);
          box-shadow: 0 8px 32px rgba(230,57,70,0.5), 0 0 0 1px rgba(255,255,255,0.1);
        }
        .start-btn:active {
          transform: scale(0.98) translateY(0);
        }
        .secondary-btn {
          transition: all 0.15s;
        }
        .secondary-btn:hover {
          background: rgba(255,255,255,0.12) !important;
          border-color: rgba(255,255,255,0.3) !important;
        }
      `}</style>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8">
        {/* Title */}
        <div
          style={{
            animation: mounted ? 'slideDown 0.7s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
            opacity: 0,
          }}
          className="text-center"
        >
          <div
            className="text-[100px] font-black tracking-tighter leading-none select-none"
            style={{
              color: '#e63946',
              animation: 'titleGlow 2s ease-in-out infinite',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            VELOCITY
          </div>
          <div
            className="text-2xl font-semibold tracking-[0.4em] uppercase mt-2"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Open World Racing
          </div>
        </div>

        {/* Car silhouette divider */}
        <div
          className="flex items-center gap-4 w-full max-w-sm"
          style={{
            animation: mounted ? 'fadeUp 0.7s 0.2s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
            opacity: 0,
          }}
        >
          <div className="flex-1 h-px bg-white/10" />
          <div className="text-white/30 text-sm">🚗</div>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Controls reference */}
        <div
          className="grid grid-cols-2 gap-3 text-sm max-w-sm w-full"
          style={{
            animation: mounted ? 'fadeUp 0.7s 0.3s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
            opacity: 0,
          }}
        >
          {[
            ['W/↑', 'Accelerate'],
            ['S/↓', 'Brake / Reverse'],
            ['A ← D →', 'Steer'],
            ['SPACE', 'Handbrake'],
            ['N', 'Nitro Boost ⚡'],
            ['C', 'Switch Camera'],
            ['R', 'Reset Car'],
            ['P / ESC', 'Pause'],
          ].map(([key, action]) => (
            <div
              key={key}
              className="flex items-center gap-2"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <span
                className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
              >
                {key}
              </span>
              <span className="text-xs">{action}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div
          className="flex flex-col items-center gap-3 w-full max-w-xs"
          style={{
            animation: mounted ? 'fadeUp 0.7s 0.45s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
            opacity: 0,
          }}
        >
          <button
            onClick={handleStart}
            className="start-btn w-full py-4 rounded-xl font-black text-xl tracking-widest text-white"
            style={{
              background: 'linear-gradient(135deg, #e63946, #c1121f)',
              boxShadow: '0 4px 24px rgba(230,57,70,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            START GAME
          </button>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => setGameState('settings')}
              className="secondary-btn flex-1 py-2.5 rounded-lg text-sm font-semibold"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              ⚙ Settings
            </button>
          </div>
        </div>

        {/* Version tag */}
        <div
          className="text-xs"
          style={{
            color: 'rgba(255,255,255,0.2)',
            animation: mounted ? 'fadeUp 0.7s 0.6s forwards' : 'none',
            opacity: 0,
          }}
        >
          v1.0.0 · Browser Racing
        </div>
      </div>

      {/* Decorative speed lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: '1px',
              height: `${80 + i * 30}px`,
              background: 'linear-gradient(to bottom, transparent, rgba(230,57,70,0.3), transparent)',
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              animation: `subtlePulse ${1.5 + i * 0.3}s ease-in-out infinite`,
              transform: `rotate(${-20 + i * 5}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
