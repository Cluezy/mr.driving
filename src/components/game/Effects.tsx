'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/useGameStore'
import { carBodyRef } from '@/utils/carRef'

// Simple tire track points system
function TireTracks() {
  const pointsRef = useRef<THREE.Points | null>(null)
  const positions = useRef<number[]>([])
  const maxPoints = 2000
  const frameCount = useRef(0)
  const carState = useGameStore((s) => s.carState)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(maxPoints * 3)
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setDrawRange(0, 0)
    return geo
  }, [])

  useFrame(() => {
    const body = carBodyRef.current
    if (!body) return

    const shouldDrop = carState.speed > 20
    if (!shouldDrop) return

    frameCount.current++
    if (frameCount.current % 3 !== 0) return

    const t = body.translation()
    const rot = body.rotation()
    const q = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q)

    // Drop 2 tracks (left and right wheels)
    const offsets = [-1.1, 1.1]
    for (const ox of offsets) {
      positions.current.push(
        t.x + right.x * ox,
        t.y - 0.25,
        t.z + right.z * ox
      )
    }

    // Keep buffer bounded
    if (positions.current.length > maxPoints * 3) {
      positions.current.splice(0, 6)
    }

    const posAttr = geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array
    const count = Math.min(positions.current.length, maxPoints * 3)
    for (let i = 0; i < count; i++) {
      arr[i] = positions.current[positions.current.length - count + i]
    }
    posAttr.needsUpdate = true
    geometry.setDrawRange(0, count / 3)
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial color="#111111" size={0.15} opacity={0.6} transparent depthWrite={false} />
    </points>
  )
}

// Speed lines (in-canvas radial effect at high speed)
function SpeedLines() {
  const groupRef = useRef<THREE.Group | null>(null)
  const carState = useGameStore((s) => s.carState)

  const lines = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2
      const r = 1.5
      return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        angle,
      }
    })
  }, [])

  useFrame((state) => {
    const body = carBodyRef.current
    if (!body || !groupRef.current) return

    const speed = carState.speed
    const intensity = Math.max(0, (speed - 120) / 180)

    groupRef.current.visible = intensity > 0

    if (intensity > 0) {
      const t = body.translation()
      const cam = state.camera
      // Position lines in front of camera
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion)
      groupRef.current.position.copy(cam.position).add(dir.multiplyScalar(3))
      groupRef.current.quaternion.copy(cam.quaternion)

      groupRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        const mat = mesh.material as THREE.MeshBasicMaterial
        mat.opacity = intensity * (0.3 + Math.sin(Date.now() * 0.01 + i) * 0.15)
      })
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      {lines.map((l, i) => (
        <mesh key={i} position={[l.x * 4, l.y * 3, 0]}>
          <planeGeometry args={[0.04, 2.5 + Math.random()]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function Effects() {
  return (
    <>
      <TireTracks />
      <SpeedLines />
    </>
  )
}
