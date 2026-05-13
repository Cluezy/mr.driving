'use client'
import { useGameStore } from '@/store/useGameStore'

export default function SettingsMenu() {
  const { gameState, setGameState, settings, toggleSound, toggleShadows, toggleDayNight } = useGameStore()

  if (gameState !== 'settings') return null

  const goBack = () => setGameState('menu')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
    >
      <style>{`
        .toggle-track {
          width: 48px;
          height: 26px;
          border-radius: 999px;
          position: relative;
          transition: background 0.2s;
          cursor: pointer;
          border: none;
          outline: none;
        }
        .toggle-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          position: absolute;
          top: 3px;
          transition: left 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          transition: background 0.15s;
        }
        .settings-row:hover {
          background: rgba(255,255,255,0.07);
        }
        .back-btn {
          transition: all 0.15s;
          cursor: pointer;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.8);
          font-weight: 700;
          font-size: 14px;
          width: 100%;
        }
        .back-btn:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-1px);
        }
      `}</style>

      <div
        className="flex flex-col gap-5 p-8 rounded-2xl w-96"
        style={{
          background: 'rgba(12,12,22,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
        }}
      >
        {/* Title */}
        <div
          className="text-3xl font-black tracking-widest text-center"
          style={{ color: '#e63946' }}
        >
          SETTINGS
        </div>

        {/* Settings rows */}
        <div className="flex flex-col gap-2">
          {/* Sound */}
          <div className="settings-row">
            <div>
              <div className="text-white font-semibold text-sm">Engine Sound</div>
              <div className="text-white/40 text-xs mt-0.5">Procedural audio engine</div>
            </div>
            <button
              className="toggle-track"
              style={{ background: settings.soundEnabled ? '#e63946' : 'rgba(255,255,255,0.15)' }}
              onClick={toggleSound}
              aria-label="Toggle sound"
            >
              <div
                className="toggle-thumb"
                style={{ left: settings.soundEnabled ? '25px' : '3px' }}
              />
            </button>
          </div>

          {/* Shadows */}
          <div className="settings-row">
            <div>
              <div className="text-white font-semibold text-sm">Dynamic Shadows</div>
              <div className="text-white/40 text-xs mt-0.5">Real-time shadow casting</div>
            </div>
            <button
              className="toggle-track"
              style={{ background: settings.shadowsEnabled ? '#e63946' : 'rgba(255,255,255,0.15)' }}
              onClick={toggleShadows}
              aria-label="Toggle shadows"
            >
              <div
                className="toggle-thumb"
                style={{ left: settings.shadowsEnabled ? '25px' : '3px' }}
              />
            </button>
          </div>

          {/* Day/Night */}
          <div className="settings-row">
            <div>
              <div className="text-white font-semibold text-sm">Time of Day</div>
              <div className="text-white/40 text-xs mt-0.5">
                Currently: {settings.dayNight === 'day' ? '☀️ Daytime' : '🌙 Nighttime'}
              </div>
            </div>
            <button
              className="toggle-track"
              style={{ background: settings.dayNight === 'night' ? '#4c1d95' : 'rgba(255,255,255,0.15)' }}
              onClick={toggleDayNight}
              aria-label="Toggle day/night"
            >
              <div
                className="toggle-thumb"
                style={{ left: settings.dayNight === 'night' ? '25px' : '3px' }}
              />
            </button>
          </div>

          {/* Graphics Quality (display only) */}
          <div className="settings-row">
            <div>
              <div className="text-white font-semibold text-sm">Graphics Quality</div>
              <div className="text-white/40 text-xs mt-0.5">Auto-detected from GPU</div>
            </div>
            <div className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
              HIGH
            </div>
          </div>

          {/* Physics (display only) */}
          <div className="settings-row">
            <div>
              <div className="text-white font-semibold text-sm">Physics Engine</div>
              <div className="text-white/40 text-xs mt-0.5">Rapier · Real-time</div>
            </div>
            <div className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
              RAPIER
            </div>
          </div>
        </div>

        {/* Back button */}
        <button className="back-btn" onClick={goBack}>
          ← BACK TO MENU
        </button>
      </div>
    </div>
  )
}
