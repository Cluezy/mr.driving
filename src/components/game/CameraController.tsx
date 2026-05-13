'use client'
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/useGameStore'
import { carBodyRef } from '@/utils/carRef'

const _carPos = new THREE.Vector3()
const _targetPos = new THREE.Vector3()
const _lookAt = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _forward = new THREE.Vector3()
const _offset = new THREE.Vector3()
const _up = new THREE.Vector3(0, 1, 0)

export default function CameraController() {
  const cameraMode = useGameStore((s) => s.cameraMode)
  const yaw = useRef(0)
  const pitch = useRef(0)
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      dragging.current = true
      lastPos.current = { x: event.clientX, y: event.clientY }
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging.current) return
      const dx = event.clientX - lastPos.current.x
      const dy = event.clientY - lastPos.current.y
      lastPos.current = { x: event.clientX, y: event.clientY }
      yaw.current -= dx * 0.003
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.0025, -0.35, 0.5)
    }

    const stopDragging = () => {
      dragging.current = false
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointerleave', stopDragging)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointerleave', stopDragging)
    }
  }, [])

  useFrame((state, delta) => {
    const body = carBodyRef.current
    if (!body) return

    const translation = body.translation()
    const rotation = body.rotation()

    _carPos.set(translation.x, translation.y, translation.z)
    _quat.set(rotation.x, rotation.y, rotation.z, rotation.w)

    // Car forward direction (local +Z mapped to world)
    _forward.set(0, 0, 1).applyQuaternion(_quat).normalize()

    switch (cameraMode) {
      case 'chase': {
        // Camera 10 units behind car with mouse orbit support
        const heading = Math.atan2(_forward.x, _forward.z)
        const camYaw = heading + Math.PI + yaw.current
        _offset.set(Math.sin(camYaw), 0, Math.cos(camYaw)).multiplyScalar(10)
        _offset.y = 5 + pitch.current * 6
        _targetPos.copy(_carPos).add(_offset)

        state.camera.position.lerp(_targetPos, Math.min(1, 5 * delta))

        _lookAt.set(_carPos.x, _carPos.y + 1.5, _carPos.z)
        state.camera.lookAt(_lookAt)
        break
      }

      case 'firstperson': {
        // Inside car, slightly above and forward with mouse look support
        _offset.copy(_forward).multiplyScalar(0.8).add(new THREE.Vector3(0, 1.1, 0))
        _targetPos.copy(_carPos).add(_offset)

        state.camera.position.lerp(_targetPos, Math.min(1, 10 * delta))

        const lookDir = _forward.clone().applyAxisAngle(_up, yaw.current)
        _lookAt.copy(_carPos)
          .add(lookDir.multiplyScalar(15))
          .add(new THREE.Vector3(0, pitch.current * 5 + 0.3, 0))
        state.camera.lookAt(_lookAt)
        break
      }

      case 'topdown': {
        _targetPos.set(_carPos.x, _carPos.y + 35, _carPos.z + 12)
        state.camera.position.lerp(_targetPos, Math.min(1, 5 * delta))

        _lookAt.set(_carPos.x, _carPos.y, _carPos.z)
        state.camera.lookAt(_lookAt)
        break
      }
    }
  })

  return null
}
