'use client'

import { useEffect, useState } from 'react'

export default function MobileWarning() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center text-center p-6"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
    >
      <div className="text-5xl mb-4">🖥️</div>
      <div className="text-white font-bold text-xl mb-2">Desktop Recommended</div>
      <div className="text-white/50 text-sm max-w-xs">
        VELOCITY is best experienced on a desktop with a keyboard. Mobile touch controls are not
        yet supported.
      </div>
      <button
        className="mt-6 px-6 py-2 rounded-lg text-sm font-bold"
        style={{ background: '#e63946', color: 'white' }}
        onClick={() => setShow(false)}
      >
        Play Anyway
      </button>
    </div>
  )
}
