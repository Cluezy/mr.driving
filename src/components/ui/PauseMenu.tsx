'use client'
import { useGameStore } from '@/store/useGameStore'

export default function PauseMenu() {
  const { gameState, setGameState, resetCar, carState } = useGameStore()

  if (gameState !== 'paused') return null

  const resume = () => setGameState('playing')
  const restart = () => {
    resetCar()
    setGameState('playing')
  }
  const quit = () => setGameState('menu')
  const settings = () => setGameState('settings')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <style>{`
        .pause-btn {
          transition: all 0.15s;
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.05em;
          cursor: pointer;
        }
        .pause-btn:hover {
          transform: translateX(4px);
        }
        .pause-btn-primary {
          background: linear-gradient(135deg, #e63946, #c1121f);
          color: white;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .pause-btn-secondary {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .pause-btn-secondary:hover {
          background: rgba(255,255,255,0.12);
        }
        .pause-btn-danger {
          background: rgba(239,68,68,0.15);
          color: #ef4444;
          border: 1px solid rgba(239,68,68,0.3);
        }
        .pause-btn-danger:hover {
          background: rgba(239,68,68,0.25);
        }
      `}</style>

      <div
        className="flex flex-col items-center gap-6 p-10 rounded-2xl w-80"
        style={{
          background: 'rgba(15,15,25,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Title */}
        <div className="text-center">
          <div
            className="text-5xl font-black tracking-widest"
            style={{ color: '#e63946', textShadow: '0 0 30px rgba(230,57,70,0.5)' }}
          >
            PAUSED
          </div>
        </div>

        {/* Stats */}
        <div
          className="w-full rounded-xl p-4 grid grid-cols-2 gap-3 text-sm"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-center">
            <div className="text-white/40 text-xs font-mono">SPEED</div>
            <div className="text-white font-bold text-lg">{Math.round(carState.speed)}</div>
            <div className="text-white/30 text-xs">km/h</div>
          </div>
          <div className="text-center">
            <div className="text-white/40 text-xs font-mono">SCORE</div>
            <div className="text-white font-bold text-lg">{Math.floor(carState.totalScore).toLocaleString()}</div>
            <div className="text-white/30 text-xs">pts</div>
          </div>
          <div className="text-center">
            <div className="text-white/40 text-xs font-mono">NITRO</div>
            <div className="text-purple-400 font-bold text-lg">{Math.round(carState.nitro)}%</div>
          </div>
          <div className="text-center">
            <div className="text-white/40 text-xs font-mono">HEALTH</div>
            <div className="text-green-400 font-bold text-lg">{100 - Math.round(carState.damage)}%</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 w-full">
          <button className="pause-btn pause-btn-primary" onClick={resume}>
            ▶ RESUME
          </button>
          <button className="pause-btn pause-btn-secondary" onClick={settings}>
            ⚙ SETTINGS
          </button>
          <button className="pause-btn pause-btn-secondary" onClick={restart}>
            ↺ RESTART
          </button>
          <button className="pause-btn pause-btn-danger" onClick={quit}>
            ✕ QUIT TO MENU
          </button>
        </div>

        <div className="text-xs text-white/20">Press P or ESC to resume</div>
      </div>
    </div>
  )
}
