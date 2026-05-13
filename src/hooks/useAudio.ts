'use client'
import { useRef } from 'react'

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const initialized = useRef(false)

  const init = () => {
    if (initialized.current) return
    initialized.current = true

    try {
      audioCtxRef.current = new AudioContext()
      oscillatorRef.current = audioCtxRef.current.createOscillator()
      gainNodeRef.current = audioCtxRef.current.createGain()

      oscillatorRef.current.type = 'sawtooth'
      oscillatorRef.current.frequency.value = 80
      oscillatorRef.current.connect(gainNodeRef.current)
      gainNodeRef.current.connect(audioCtxRef.current.destination)
      gainNodeRef.current.gain.value = 0
      oscillatorRef.current.start()
    } catch (err) {
      console.warn('Audio init failed:', err)
    }
  }

  const updateEngineSound = (speed: number, enabled: boolean) => {
    if (!oscillatorRef.current || !gainNodeRef.current) return
    if (!enabled) {
      gainNodeRef.current.gain.value = 0
      return
    }
    // frequency scales with speed: 80 Hz idle → ~320 Hz at max speed
    oscillatorRef.current.frequency.value = 80 + speed * 0.8
    gainNodeRef.current.gain.value = 0.04
  }

  const stop = () => {
    try {
      gainNodeRef.current?.disconnect()
      oscillatorRef.current?.stop()
      audioCtxRef.current?.close()
    } catch (_) {
      // ignore
    }
    initialized.current = false
  }

  return { init, updateEngineSound, stop }
}
