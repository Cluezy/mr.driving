'use client'
import { useEffect, useRef } from 'react'

export interface Controls {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  handbrake: boolean
  nitro: boolean
  reset: boolean
  pause: boolean
  cameraSwitch: boolean
}

export function useCarControls() {
  const keys = useRef<Controls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
    nitro: false,
    reset: false,
    pause: false,
    cameraSwitch: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true
          break
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true
          break
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true
          break
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true
          break
        case 'Space':
          e.preventDefault()
          keys.current.handbrake = true
          break
        case 'KeyN':
          keys.current.nitro = true
          break
        case 'KeyR':
          keys.current.reset = true
          break
        case 'KeyP':
        case 'Escape':
          keys.current.pause = true
          break
        case 'KeyC':
          keys.current.cameraSwitch = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false
          break
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false
          break
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false
          break
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false
          break
        case 'Space':
          keys.current.handbrake = false
          break
        case 'KeyN':
          keys.current.nitro = false
          break
        case 'KeyR':
          keys.current.reset = false
          break
        case 'KeyP':
        case 'Escape':
          keys.current.pause = false
          break
        case 'KeyC':
          keys.current.cameraSwitch = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return keys
}
