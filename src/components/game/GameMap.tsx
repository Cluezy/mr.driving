'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { generateBuildings, generateTrees, generateStreetlights } from '@/utils/mapGenerator'

// Road marking component
function RoadMarkings() {
  // Center line dashes on main highway
  const dashes = useMemo(() => {
    const items = []
    for (let z = -240; z < 240; z += 20) {
      items.push(z)
    }
    return items
  }, [])

  // Cross road positions
  const crossRoads = useMemo(() => [80, -100, 180, -220], [])

  // Side street positions
  const sideStreets = useMemo(() => [80, -80, 160, -160], [])

  return (
    <group>
      {dashes.map((z) => (
        <mesh key={`highway-${z}`} position={[0, 0.06, z]} receiveShadow>
          <boxGeometry args={[0.4, 0.02, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      {crossRoads.map((z) =>
        Array.from({ length: 24 }, (_, i) => (
          <mesh key={`cross-${z}-${i}`} position={[-240 + i * 20, 0.06, z]} receiveShadow>
            <boxGeometry args={[18, 0.02, 0.4]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))
      )}
      {sideStreets.map((x) =>
        Array.from({ length: 24 }, (_, i) => (
          <mesh key={`side-${x}-${i}`} position={[x, 0.06, -240 + i * 20]} receiveShadow>
            <boxGeometry args={[0.4, 0.02, 18]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))
      )}
    </group>
  )
}

const LANE_OFFSET = 4

function getLanePositionX(car: { path: string; x: number; dir: number }) {
  if (car.path !== 'z') return car.x
  const roadCenterX = Math.abs(car.x) >= 20 ? car.x : 0
  return roadCenterX + (car.dir > 0 ? LANE_OFFSET : -LANE_OFFSET)
}

function getLanePositionZ(car: { path: string; z: number; dir: number }) {
  if (car.path !== 'x') return car.z
  const roadCenterZ = Math.abs(car.z) >= 20 ? car.z : 0
  return roadCenterZ + (car.dir > 0 ? -LANE_OFFSET : LANE_OFFSET)
}

function getVehicleColliderArgs(car: { type: string }) {
  if (car.type === 'bus') return [1.2, 0.6, 4.0]
  if (car.type === 'truck') return [1.1, 0.55, 3.8]
  return [0.9, 0.45, 2.0]
}

// Buildings component
function Buildings() {
  const buildings = useMemo(() => generateBuildings(), [])

  return (
    <group>
      {buildings.map((b, i) => (
        <RigidBody key={i} type="fixed" position={[b.x, b.height / 2 + 0.25, b.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.width, b.height, b.depth]} />
            <meshStandardMaterial color={b.color} metalness={0.2} roughness={0.7} />
          </mesh>
          {/* Windows — small emissive yellow boxes */}
          {Array.from({ length: Math.floor(b.height / 4) }).map((_, row) =>
            Array.from({ length: Math.floor(b.width / 3) }).map((_, col) => (
              <mesh
                key={`w-${row}-${col}`}
                position={[
                  -b.width / 2 + 1.5 + col * 3,
                  -b.height / 2 + 2 + row * 4,
                  b.depth / 2 + 0.05,
                ]}
              >
                <boxGeometry args={[0.7, 0.9, 0.05]} />
                <meshStandardMaterial
                  color="#ffeeaa"
                  emissive="#ffcc44"
                  emissiveIntensity={(row + col) % 3 === 0 ? 0 : 1.2}
                />
              </mesh>
            ))
          )}
        </RigidBody>
      ))}
    </group>
  )
}

// Trees component
function Trees() {
  const trees = useMemo(() => generateTrees(), [])

  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          {/* Trunk */}
          <mesh castShadow position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
            <meshStandardMaterial color="#5c4033" roughness={0.9} />
          </mesh>
          {/* Leaves */}
          <mesh castShadow position={[0, 4, 0]}>
            <sphereGeometry args={[1.8, 10, 10]} />
            <meshStandardMaterial color="#2d6a2d" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 5.5, 0]}>
            <sphereGeometry args={[1.2, 8, 8]} />
            <meshStandardMaterial color="#3a7a3a" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Streetlights component
function Streetlights() {
  const lights = useMemo(() => generateStreetlights(), [])

  return (
    <group>
      {lights.map((sl, i) => (
        <group key={i} position={[sl.x, 0, sl.z]} rotation={[0, sl.rotation, 0]}>
          {/* Pole */}
          <mesh castShadow position={[0, 4, 0]}>
            <cylinderGeometry args={[0.06, 0.1, 8, 6]} />
            <meshStandardMaterial color="#aaa" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Arm */}
          <mesh position={[0.8, 7.8, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[1.5, 0.08, 0.08]} />
            <meshStandardMaterial color="#aaa" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Light bulb */}
          <mesh position={[1.6, 7.6, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#ffffaa" emissive="#ffff66" emissiveIntensity={3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Parked cars (now moving traffic with detailed styling)
function ParkedCars() {
  const parkedCars = useMemo(
    () => [
      { path: 'z', x: 6, z: -240, speed: 8, dir: 1, color: '#3a86ff', type: 'car' },
      { path: 'z', x: -6, z: 240, speed: 9, dir: -1, color: '#ffd60a', type: 'bus' },
      { path: 'x', x: -240, z: 80, speed: 7, dir: 1, color: '#8338ec', type: 'truck' },
      { path: 'x', x: 240, z: -100, speed: 6, dir: -1, color: '#c0c0c0', type: 'car' },
      { path: 'z', x: 80, z: 180, speed: 8, dir: -1, color: '#2dc653', type: 'bus' },
      { path: 'x', x: -160, z: 80, speed: 7, dir: 1, color: '#ff6b6b', type: 'truck' },
      { path: 'z', x: -80, z: -120, speed: 7, dir: 1, color: '#ff9500', type: 'car' },
      { path: 'x', x: 160, z: -100, speed: 5, dir: -1, color: '#8b5cf6', type: 'bus' },
      // Additional cars
      { path: 'z', x: 8, z: -180, speed: 9, dir: 1, color: '#ff6b35', type: 'car' },
      { path: 'z', x: -8, z: 180, speed: 8, dir: -1, color: '#f72585', type: 'car' },
      { path: 'z', x: 4, z: -60, speed: 10, dir: 1, color: '#7209b7', type: 'car' },
      { path: 'z', x: -4, z: 60, speed: 9, dir: -1, color: '#560bad', type: 'car' },
      { path: 'z', x: 10, z: 120, speed: 8, dir: -1, color: '#480ca8', type: 'car' },
      { path: 'z', x: -10, z: -120, speed: 7, dir: 1, color: '#3a0ca3', type: 'car' },
      { path: 'x', x: -200, z: 80, speed: 6, dir: 1, color: '#3f37c9', type: 'car' },
      { path: 'x', x: 200, z: -100, speed: 8, dir: -1, color: '#4361ee', type: 'car' },
      { path: 'x', x: -180, z: 180, speed: 7, dir: 1, color: '#4895ef', type: 'car' },
      { path: 'x', x: 180, z: -220, speed: 9, dir: -1, color: '#4cc9f0', type: 'car' },
      { path: 'z', x: 80, z: -60, speed: 6, dir: 1, color: '#f77f00', type: 'car' },
      { path: 'z', x: -80, z: 60, speed: 8, dir: -1, color: '#fcbf49', type: 'car' },
      { path: 'z', x: 160, z: 0, speed: 7, dir: -1, color: '#eae2b7', type: 'car' },
      { path: 'z', x: -160, z: 0, speed: 9, dir: 1, color: '#d4a574', type: 'car' },
      { path: 'x', x: -120, z: 80, speed: 8, dir: 1, color: '#a23b72', type: 'car' },
      { path: 'x', x: 120, z: -100, speed: 7, dir: -1, color: '#c77dff', type: 'car' },
      { path: 'x', x: -80, z: 180, speed: 6, dir: 1, color: '#e63946', type: 'car' },
      { path: 'x', x: 80, z: -220, speed: 9, dir: -1, color: '#f1c40f', type: 'car' },
      { path: 'z', x: 2, z: -200, speed: 10, dir: 1, color: '#27ae60', type: 'car' },
      { path: 'z', x: -2, z: 200, speed: 9, dir: -1, color: '#2980b9', type: 'car' },
    ],
    []
  )

  const refs = useRef<Array<RapierRigidBody | null>>([])

  useFrame((state, delta) => {
    refs.current.forEach((body, index) => {
      const car = parkedCars[index]
      if (!body) return

      const pos = body.translation()
      const targetX = getLanePositionX(car)
      const targetZ = getLanePositionZ(car)
      const velocity = car.path === 'z'
        ? { x: 0, y: 0, z: car.speed * car.dir }
        : { x: car.speed * car.dir, y: 0, z: 0 }

      body.setLinvel(velocity, true)
      body.setAngvel({ x: 0, y: 0, z: 0 }, true)
      if (car.path === 'z') {
        if (pos.z > 260) body.setTranslation({ x: targetX, y: pos.y, z: -260 }, true)
        else if (pos.z < -260) body.setTranslation({ x: targetX, y: pos.y, z: 260 }, true)
        else if (Math.abs(pos.x - targetX) > 0.2) body.setTranslation({ x: targetX, y: pos.y, z: pos.z }, true)
      } else {
        if (pos.x > 260) body.setTranslation({ x: -260, y: pos.y, z: targetZ }, true)
        else if (pos.x < -260) body.setTranslation({ x: 260, y: pos.y, z: targetZ }, true)
        else if (Math.abs(pos.z - targetZ) > 0.2) body.setTranslation({ x: pos.x, y: pos.y, z: targetZ }, true)
      }
    })
  })

  return (
    <group>
      {parkedCars.map((car, i) => (
        <RigidBody
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="dynamic"
          mass={900}
          colliders="cuboid"
          args={getVehicleColliderArgs(car)}
          lockRotations
          linearDamping={0.2}
          angularDamping={1}
          friction={0.7}
          restitution={0.05}
          position={[getLanePositionX(car), car.type === 'truck' ? 0.6 : car.type === 'bus' ? 0.55 : 0.45, getLanePositionZ(car)]}
          rotation={[0, car.path === 'z' ? (car.dir > 0 ? 0 : Math.PI) : car.dir > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
        >
          <group>
          {car.type === 'car' && (
            <>
              {/* Car - Main chassis */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[2.0, 0.8, 4.5]} />
                <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.3} />
              </mesh>

              {/* Car - Hood */}
              <mesh castShadow position={[0, 0.26, 1.5]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[1.95, 0.08, 1.0]} />
                <meshStandardMaterial color={car.color} metalness={0.7} roughness={0.2} />
              </mesh>

              {/* Car - Cabin / roof */}
              <mesh castShadow position={[0, 0.65, -0.15]}>
                <boxGeometry args={[1.85, 0.58, 2.0]} />
                <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.3} />
              </mesh>

              {/* Car - Trunk */}
              <mesh castShadow position={[0, 0.26, -1.5]} rotation={[0.08, 0, 0]}>
                <boxGeometry args={[1.95, 0.08, 0.9]} />
                <meshStandardMaterial color={car.color} metalness={0.7} roughness={0.2} />
              </mesh>

              {/* Car - Windshield */}
              <mesh position={[0, 0.5, 0.9]}>
                <boxGeometry args={[1.7, 0.35, 0.05]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
              </mesh>

              {/* Car - Rear window */}
              <mesh position={[0, 0.5, -1.0]}>
                <boxGeometry args={[1.7, 0.3, 0.05]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
              </mesh>

              {/* Car - Front bumper */}
              <mesh castShadow position={[0, -0.09, 2.3]}>
                <boxGeometry args={[2.1, 0.32, 0.45]} />
                <meshStandardMaterial color="#333" metalness={0.4} roughness={0.6} />
              </mesh>

              {/* Car - Rear bumper */}
              <mesh castShadow position={[0, -0.09, -2.3]}>
                <boxGeometry args={[2.1, 0.32, 0.45]} />
                <meshStandardMaterial color="#333" metalness={0.4} roughness={0.6} />
              </mesh>

              {/* Car - Headlights */}
              <mesh position={[0.65, 0.15, 2.2]}>
                <boxGeometry args={[0.3, 0.14, 0.07]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.3} />
              </mesh>
              <mesh position={[-0.65, 0.15, 2.2]}>
                <boxGeometry args={[0.3, 0.14, 0.07]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.3} />
              </mesh>

              {/* Car - Brake lights */}
              <mesh position={[0.65, 0.15, -2.2]}>
                <boxGeometry args={[0.25, 0.12, 0.05]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
              </mesh>
              <mesh position={[-0.65, 0.15, -2.2]}>
                <boxGeometry args={[0.25, 0.12, 0.05]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
              </mesh>

              {/* Car - Wheels */}
              <mesh position={[-1.0, -0.2, 1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.28, 10]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.0, -0.2, 1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.28, 10]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[-1.0, -0.2, -1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.28, 10]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.0, -0.2, -1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.28, 10]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>

              {/* Car - Mirrors */}
              <group position={[-0.95, 0.28, 0.45]}>
                <mesh>
                  <boxGeometry args={[0.1, 0.05, 0.2]} />
                  <meshStandardMaterial color="#222" metalness={0.4} roughness={0.6} />
                </mesh>
                <mesh position={[0, -0.06, 0.14]}>
                  <boxGeometry args={[0.05, 0.05, 0.08]} />
                  <meshStandardMaterial color="#98b6c8" metalness={0.1} roughness={0.2} transparent opacity={0.8} />
                </mesh>
              </group>
              <group position={[0.95, 0.28, 0.45]}>
                <mesh>
                  <boxGeometry args={[0.1, 0.05, 0.2]} />
                  <meshStandardMaterial color="#222" metalness={0.4} roughness={0.6} />
                </mesh>
                <mesh position={[0, -0.06, 0.14]}>
                  <boxGeometry args={[0.05, 0.05, 0.08]} />
                  <meshStandardMaterial color="#98b6c8" metalness={0.1} roughness={0.2} transparent opacity={0.8} />
                </mesh>
              </group>
            </>
          )}

          {car.type === 'bus' && (
            <>
              {/* Bus - Main chassis */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[2.4, 1.2, 8.0]} />
                <meshStandardMaterial color={car.color} metalness={0.5} roughness={0.4} />
              </mesh>

              {/* Bus - Windows */}
              {Array.from({ length: 6 }, (_, i) => (
                <mesh key={`bus-window-${i}`} position={[0, 0.4, -2.5 + i * 1.2]}>
                  <boxGeometry args={[2.2, 0.6, 0.05]} />
                  <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.8} />
                </mesh>
              ))}

              {/* Bus - Front windshield */}
              <mesh position={[0, 0.3, 3.8]}>
                <boxGeometry args={[2.2, 0.8, 0.05]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
              </mesh>

              {/* Bus - Headlights */}
              <mesh position={[0.8, 0.2, 4.0]}>
                <boxGeometry args={[0.4, 0.2, 0.08]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.5} />
              </mesh>
              <mesh position={[-0.8, 0.2, 4.0]}>
                <boxGeometry args={[0.4, 0.2, 0.08]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.5} />
              </mesh>

              {/* Bus - Brake lights */}
              <mesh position={[0.8, 0.2, -4.0]}>
                <boxGeometry args={[0.35, 0.18, 0.06]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.3} />
              </mesh>
              <mesh position={[-0.8, 0.2, -4.0]}>
                <boxGeometry args={[0.35, 0.18, 0.06]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.3} />
              </mesh>

              {/* Bus - Wheels */}
              <mesh position={[-1.1, -0.3, 2.5]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 0.35, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.1, -0.3, 2.5]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 0.35, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[-1.1, -0.3, -2.5]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 0.35, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.1, -0.3, -2.5]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 0.35, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
            </>
          )}

          {car.type === 'truck' && (
            <>
              {/* Truck - Cab */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[2.2, 1.0, 3.0]} />
                <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.3} />
              </mesh>

              {/* Truck - Cargo bed */}
              <mesh castShadow receiveShadow position={[0, 0.3, -3.5]}>
                <boxGeometry args={[2.2, 0.8, 4.0]} />
                <meshStandardMaterial color="#4a4a4a" metalness={0.4} roughness={0.5} />
              </mesh>

              {/* Truck - Cargo cover */}
              <mesh castShadow position={[0, 0.9, -3.5]}>
                <boxGeometry args={[2.3, 0.1, 4.2]} />
                <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.6} />
              </mesh>

              {/* Truck - Windshield */}
              <mesh position={[0, 0.3, 1.4]}>
                <boxGeometry args={[1.8, 0.6, 0.05]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
              </mesh>

              {/* Truck - Side windows */}
              <mesh position={[0.9, 0.3, 0]}>
                <boxGeometry args={[0.05, 0.5, 1.8]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.8} />
              </mesh>
              <mesh position={[-0.9, 0.3, 0]}>
                <boxGeometry args={[0.05, 0.5, 1.8]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.8} />
              </mesh>

              {/* Truck - Headlights */}
              <mesh position={[0.7, 0.1, 1.6]}>
                <boxGeometry args={[0.35, 0.15, 0.08]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.4} />
              </mesh>
              <mesh position={[-0.7, 0.1, 1.6]}>
                <boxGeometry args={[0.35, 0.15, 0.08]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.4} />
              </mesh>

              {/* Truck - Brake lights */}
              <mesh position={[0.7, 0.1, -5.3]}>
                <boxGeometry args={[0.3, 0.13, 0.06]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
              </mesh>
              <mesh position={[-0.7, 0.1, -5.3]}>
                <boxGeometry args={[0.3, 0.13, 0.06]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
              </mesh>

              {/* Truck - Wheels */}
              <mesh position={[-1.0, -0.3, 0.8]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.0, -0.3, 0.8]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[-1.0, -0.3, -2.0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.0, -0.3, -2.0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[-1.0, -0.3, -5.0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.0, -0.3, -5.0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
            </>
          )}
        </group>
        </RigidBody>
      ))}
    </group>
  )
}

// Ramps
function Ramps() {
  return (
    <group>
      {/* Ramp 1 — launch ramp on highway */}
      <RigidBody type="fixed" position={[0, 0.8, -120]} rotation={[-0.22, 0, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[10, 0.3, 15]} />
          <meshStandardMaterial color="#888" metalness={0.4} roughness={0.6} />
        </mesh>
      </RigidBody>

      {/* Ramp 2 — off to the side */}
      <RigidBody type="fixed" position={[40, 0.8, 130]} rotation={[-0.2, Math.PI / 6, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[8, 0.3, 14]} />
          <meshStandardMaterial color="#888" metalness={0.4} roughness={0.6} />
        </mesh>
      </RigidBody>
    </group>
  )
}


// Moving traffic
function MovingTraffic() {
  const cars = useMemo(
    () => [
      { path: 'z', x: -6, z: -240, speed: 10, dir: 1, color: '#ff5247', type: 'car' },
      { path: 'z', x: 6, z: 240, speed: 9, dir: -1, color: '#1e90ff', type: 'truck' },
      { path: 'x', x: -240, z: 80, speed: 7, dir: 1, color: '#f9c74f', type: 'bus' },
      { path: 'x', x: 240, z: -100, speed: 6, dir: -1, color: '#90be6d', type: 'car' },
      { path: 'z', x: 160, z: -200, speed: 5, dir: 1, color: '#577590', type: 'truck' },
      { path: 'x', x: -160, z: 180, speed: 6, dir: -1, color: '#f28482', type: 'bus' },
      { path: 'z', x: -160, z: 100, speed: 8, dir: -1, color: '#8b5cf6', type: 'car' },
      { path: 'x', x: 80, z: -220, speed: 7, dir: 1, color: '#06d6a0', type: 'truck' },
      // Additional cars
      { path: 'z', x: 8, z: -160, speed: 11, dir: 1, color: '#e74c3c', type: 'car' },
      { path: 'z', x: -8, z: 160, speed: 10, dir: -1, color: '#9b59b6', type: 'car' },
      { path: 'z', x: 4, z: -40, speed: 12, dir: 1, color: '#3498db', type: 'car' },
      { path: 'z', x: -4, z: 40, speed: 11, dir: -1, color: '#2ecc71', type: 'car' },
      { path: 'z', x: 10, z: 80, speed: 9, dir: -1, color: '#f39c12', type: 'car' },
      { path: 'z', x: -10, z: -80, speed: 8, dir: 1, color: '#e67e22', type: 'car' },
      { path: 'x', x: -220, z: 80, speed: 7, dir: 1, color: '#1abc9c', type: 'car' },
      { path: 'x', x: 220, z: -100, speed: 9, dir: -1, color: '#34495e', type: 'car' },
      { path: 'x', x: -200, z: 180, speed: 8, dir: 1, color: '#16a085', type: 'car' },
      { path: 'x', x: 200, z: -220, speed: 10, dir: -1, color: '#27ae60', type: 'car' },
      { path: 'z', x: 80, z: -40, speed: 7, dir: 1, color: '#8e44ad', type: 'car' },
      { path: 'z', x: -80, z: 40, speed: 9, dir: -1, color: '#d35400', type: 'car' },
      { path: 'z', x: 160, z: 40, speed: 8, dir: -1, color: '#c0392b', type: 'car' },
      { path: 'z', x: -160, z: -40, speed: 10, dir: 1, color: '#7f8c8d', type: 'car' },
      { path: 'x', x: -140, z: 80, speed: 9, dir: 1, color: '#95a5a6', type: 'car' },
      { path: 'x', x: 140, z: -100, speed: 8, dir: -1, color: '#f1c40f', type: 'car' },
      { path: 'x', x: -100, z: 180, speed: 7, dir: 1, color: '#e74c3c', type: 'car' },
      { path: 'x', x: 100, z: -220, speed: 11, dir: -1, color: '#9b59b6', type: 'car' },
      { path: 'z', x: 2, z: -220, speed: 12, dir: 1, color: '#3498db', type: 'car' },
      { path: 'z', x: -2, z: 220, speed: 11, dir: -1, color: '#2ecc71', type: 'car' },
    ],
    []
  )

  const refs = useRef<Array<RapierRigidBody | null>>([])

  useFrame((state, delta) => {
    refs.current.forEach((body, index) => {
      const car = cars[index]
      if (!body) return

      const pos = body.translation()
      const velocity = car.path === 'z'
        ? { x: 0, y: 0, z: car.speed * car.dir }
        : { x: car.speed * car.dir, y: 0, z: 0 }

      body.setLinvel(velocity, true)
      body.setAngvel({ x: 0, y: 0, z: 0 }, true)

      const targetX = getLanePositionX(car)
      const targetZ = getLanePositionZ(car)

      if (car.path === 'z') {
        if (pos.z > 260) body.setTranslation({ x: targetX, y: pos.y, z: -260 }, true)
        else if (pos.z < -260) body.setTranslation({ x: targetX, y: pos.y, z: 260 }, true)
        else if (Math.abs(pos.x - targetX) > 0.2) body.setTranslation({ x: targetX, y: pos.y, z: pos.z }, true)
      } else {
        if (pos.x > 260) body.setTranslation({ x: -260, y: pos.y, z: targetZ }, true)
        else if (pos.x < -260) body.setTranslation({ x: 260, y: pos.y, z: targetZ }, true)
        else if (Math.abs(pos.z - targetZ) > 0.2) body.setTranslation({ x: pos.x, y: pos.y, z: targetZ }, true)
      }
    })
  })

  return (
    <group>
      {cars.map((car, i) => (
        <RigidBody
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="dynamic"
          mass={900}
          colliders="cuboid"
          args={getVehicleColliderArgs(car)}
          lockRotations
          linearDamping={0.2}
          angularDamping={1}
          friction={0.7}
          restitution={0.05}
          position={[getLanePositionX(car), 0.45, getLanePositionZ(car)]}
          rotation={[0, car.path === 'z' ? (car.dir > 0 ? 0 : Math.PI) : car.dir > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
        >
          <group>
          {car.type === 'car' && (
            <>
              {/* Car - Main chassis */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.75, 0.72, 4]} />
                <meshStandardMaterial color={car.color} metalness={0.5} roughness={0.3} />
              </mesh>

              {/* Car - Hood */}
              <mesh castShadow position={[0, 0.28, 1.6]} rotation={[-0.08, 0, 0]}>
                <boxGeometry args={[1.7, 0.06, 0.8]} />
                <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.25} />
              </mesh>

              {/* Car - Cabin / roof */}
              <mesh castShadow position={[0, 0.55, 0]}>
                <boxGeometry args={[1.5, 0.52, 2.0]} />
                <meshStandardMaterial color={car.color} metalness={0.5} roughness={0.3} />
              </mesh>

              {/* Car - Trunk */}
              <mesh castShadow position={[0, 0.28, -1.6]} rotation={[0.06, 0, 0]}>
                <boxGeometry args={[1.7, 0.06, 0.7]} />
                <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.25} />
              </mesh>

              {/* Car - Windshield */}
              <mesh position={[0, 0.48, 0.8]}>
                <boxGeometry args={[1.4, 0.32, 0.05]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
              </mesh>

              {/* Car - Rear window */}
              <mesh position={[0, 0.48, -0.8]}>
                <boxGeometry args={[1.4, 0.28, 0.05]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
              </mesh>

              {/* Car - Front bumper */}
              <mesh castShadow position={[0, -0.08, 2.2]}>
                <boxGeometry args={[1.8, 0.3, 0.4]} />
                <meshStandardMaterial color="#333" metalness={0.4} roughness={0.6} />
              </mesh>

              {/* Car - Rear bumper */}
              <mesh castShadow position={[0, -0.08, -2.2]}>
                <boxGeometry args={[1.8, 0.3, 0.4]} />
                <meshStandardMaterial color="#333" metalness={0.4} roughness={0.6} />
              </mesh>

              {/* Car - Headlights */}
              <mesh position={[0.6, 0.15, 1.95]}>
                <boxGeometry args={[0.3, 0.14, 0.07]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.3} />
              </mesh>
              <mesh position={[-0.6, 0.15, 1.95]}>
                <boxGeometry args={[0.3, 0.14, 0.07]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.3} />
              </mesh>

              {/* Car - Brake lights */}
              <mesh position={[0.6, 0.15, -1.95]}>
                <boxGeometry args={[0.25, 0.12, 0.05]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
              </mesh>
              <mesh position={[-0.6, 0.15, -1.95]}>
                <boxGeometry args={[0.25, 0.12, 0.05]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
              </mesh>

              {/* Car - Wheels */}
              <mesh position={[-1.0, -0.2, 1.3]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.28, 10]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.0, -0.2, 1.3]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.28, 10]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[-1.0, -0.2, -1.3]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.28, 10]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.0, -0.2, -1.3]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.28, 10]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>

              {/* Car - Mirrors */}
              <group position={[-0.9, 0.3, 0.5]}>
                <mesh>
                  <boxGeometry args={[0.1, 0.05, 0.2]} />
                  <meshStandardMaterial color="#222" metalness={0.4} roughness={0.6} />
                </mesh>
                <mesh position={[0, -0.06, 0.14]}>
                  <boxGeometry args={[0.05, 0.05, 0.08]} />
                  <meshStandardMaterial color="#98b6c8" metalness={0.1} roughness={0.2} transparent opacity={0.8} />
                </mesh>
              </group>
              <group position={[0.9, 0.3, 0.5]}>
                <mesh>
                  <boxGeometry args={[0.1, 0.05, 0.2]} />
                  <meshStandardMaterial color="#222" metalness={0.4} roughness={0.6} />
                </mesh>
                <mesh position={[0, -0.06, 0.14]}>
                  <boxGeometry args={[0.05, 0.05, 0.08]} />
                  <meshStandardMaterial color="#98b6c8" metalness={0.1} roughness={0.2} transparent opacity={0.8} />
                </mesh>
              </group>
            </>
          )}

          {car.type === 'bus' && (
            <>
              {/* Bus - Main chassis */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[2.4, 1.2, 8.0]} />
                <meshStandardMaterial color={car.color} metalness={0.5} roughness={0.4} />
              </mesh>

              {/* Bus - Windows */}
              {Array.from({ length: 6 }, (_, i) => (
                <mesh key={`bus-window-${i}`} position={[0, 0.4, -2.5 + i * 1.2]}>
                  <boxGeometry args={[2.2, 0.6, 0.05]} />
                  <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.8} />
                </mesh>
              ))}

              {/* Bus - Front windshield */}
              <mesh position={[0, 0.3, 3.8]}>
                <boxGeometry args={[2.2, 0.8, 0.05]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
              </mesh>

              {/* Bus - Headlights */}
              <mesh position={[0.8, 0.2, 4.0]}>
                <boxGeometry args={[0.4, 0.2, 0.08]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.5} />
              </mesh>
              <mesh position={[-0.8, 0.2, 4.0]}>
                <boxGeometry args={[0.4, 0.2, 0.08]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.5} />
              </mesh>

              {/* Bus - Brake lights */}
              <mesh position={[0.8, 0.2, -4.0]}>
                <boxGeometry args={[0.35, 0.18, 0.06]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.3} />
              </mesh>
              <mesh position={[-0.8, 0.2, -4.0]}>
                <boxGeometry args={[0.35, 0.18, 0.06]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.3} />
              </mesh>

              {/* Bus - Wheels */}
              <mesh position={[-1.1, -0.3, 2.5]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 0.35, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.1, -0.3, 2.5]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 0.35, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[-1.1, -0.3, -2.5]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 0.35, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.1, -0.3, -2.5]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 0.35, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
            </>
          )}

          {car.type === 'truck' && (
            <>
              {/* Truck - Cab */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[2.2, 1.0, 3.0]} />
                <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.3} />
              </mesh>

              {/* Truck - Cargo bed */}
              <mesh castShadow receiveShadow position={[0, 0.3, -3.5]}>
                <boxGeometry args={[2.2, 0.8, 4.0]} />
                <meshStandardMaterial color="#4a4a4a" metalness={0.4} roughness={0.5} />
              </mesh>

              {/* Truck - Cargo cover */}
              <mesh castShadow position={[0, 0.9, -3.5]}>
                <boxGeometry args={[2.3, 0.1, 4.2]} />
                <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.6} />
              </mesh>

              {/* Truck - Windshield */}
              <mesh position={[0, 0.3, 1.4]}>
                <boxGeometry args={[1.8, 0.6, 0.05]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
              </mesh>

              {/* Truck - Side windows */}
              <mesh position={[0.9, 0.3, 0]}>
                <boxGeometry args={[0.05, 0.5, 1.8]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.8} />
              </mesh>
              <mesh position={[-0.9, 0.3, 0]}>
                <boxGeometry args={[0.05, 0.5, 1.8]} />
                <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.8} />
              </mesh>

              {/* Truck - Headlights */}
              <mesh position={[0.7, 0.1, 1.6]}>
                <boxGeometry args={[0.35, 0.15, 0.08]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.4} />
              </mesh>
              <mesh position={[-0.7, 0.1, 1.6]}>
                <boxGeometry args={[0.35, 0.15, 0.08]} />
                <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.4} />
              </mesh>

              {/* Truck - Brake lights */}
              <mesh position={[0.7, 0.1, -5.3]}>
                <boxGeometry args={[0.3, 0.13, 0.06]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
              </mesh>
              <mesh position={[-0.7, 0.1, -5.3]}>
                <boxGeometry args={[0.3, 0.13, 0.06]} />
                <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
              </mesh>

              {/* Truck - Wheels */}
              <mesh position={[-1.0, -0.3, 0.8]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.0, -0.3, 0.8]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[-1.0, -0.3, -2.0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.0, -0.3, -2.0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[-1.0, -0.3, -5.0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
              <mesh position={[1.0, -0.3, -5.0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.45, 0.45, 0.32, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
              </mesh>
            </>
          )}
        </group>
        </RigidBody>
      ))}
    </group>
  )
}

export default function GameMap() {
  return (
    <group>
      {/* Ground */}
      <RigidBody type="fixed" friction={0.8} restitution={0.1}>
        <mesh receiveShadow position={[0, -0.25, 0]}>
          <boxGeometry args={[600, 0.5, 600]} />
          <meshStandardMaterial color="#4a7c59" roughness={0.9} metalness={0.0} />
        </mesh>
      </RigidBody>

      {/* Main highway (N-S) */}
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[22, 0.08, 500]} />
        <meshStandardMaterial color="#333333" roughness={0.95} />
      </mesh>

      {/* Sidewalks along highway */}
      <mesh receiveShadow position={[13, 0.04, 0]}>
        <boxGeometry args={[3, 0.08, 500]} />
        <meshStandardMaterial color="#999" roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[-13, 0.04, 0]}>
        <boxGeometry args={[3, 0.08, 500]} />
        <meshStandardMaterial color="#999" roughness={0.95} />
      </mesh>

      {/* Cross road (E-W at z=80) */}
      <mesh receiveShadow position={[0, 0.03, 80]}>
        <boxGeometry args={[500, 0.08, 22]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[0, 0.05, 93]}>
        <boxGeometry args={[500, 0.06, 3]} />
        <meshStandardMaterial color="#999" roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[0, 0.05, 67]}>
        <boxGeometry args={[500, 0.06, 3]} />
        <meshStandardMaterial color="#999" roughness={0.95} />
      </mesh>

      {/* Second cross road (E-W at z=-100) */}
      <mesh receiveShadow position={[0, 0.03, -100]}>
        <boxGeometry args={[500, 0.08, 18]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.95} />
      </mesh>

      {/* Third cross road (E-W at z=180) */}
      <mesh receiveShadow position={[0, 0.03, 180]}>
        <boxGeometry args={[500, 0.08, 18]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[0, 0.05, 193]}>
        <boxGeometry args={[500, 0.06, 3]} />
        <meshStandardMaterial color="#999" roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[0, 0.05, 167]}>
        <boxGeometry args={[500, 0.06, 3]} />
        <meshStandardMaterial color="#999" roughness={0.95} />
      </mesh>

      {/* Fourth cross road (E-W at z=-220) */}
      <mesh receiveShadow position={[0, 0.03, -220]}>
        <boxGeometry args={[500, 0.08, 18]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[0, 0.05, -207]}>
        <boxGeometry args={[500, 0.06, 3]} />
        <meshStandardMaterial color="#999" roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[0, 0.05, -233]}>
        <boxGeometry args={[500, 0.06, 3]} />
        <meshStandardMaterial color="#999" roughness={0.95} />
      </mesh>

      {/* Side street parallel to highway (x=80) */}
      <mesh receiveShadow position={[80, 0.03, 0]}>
        <boxGeometry args={[16, 0.08, 400]} />
        <meshStandardMaterial color="#3c3c3c" roughness={0.95} />
      </mesh>

      {/* Side street parallel to highway (x=-80) */}
      <mesh receiveShadow position={[-80, 0.03, 0]}>
        <boxGeometry args={[16, 0.08, 400]} />
        <meshStandardMaterial color="#3c3c3c" roughness={0.95} />
      </mesh>

      {/* Side street parallel to highway (x=160) */}
      <mesh receiveShadow position={[160, 0.03, 0]}>
        <boxGeometry args={[14, 0.08, 420]} />
        <meshStandardMaterial color="#3c3c3c" roughness={0.95} />
      </mesh>

      {/* Side street parallel to highway (x=-160) */}
      <mesh receiveShadow position={[-160, 0.03, 0]}>
        <boxGeometry args={[14, 0.08, 420]} />
        <meshStandardMaterial color="#3c3c3c" roughness={0.95} />
      </mesh>

      {/* Road markings */}
      <RoadMarkings />

      {/* Buildings */}
      <Buildings />

      {/* Trees */}
      <Trees />

      {/* Streetlights */}
      <Streetlights />

      {/* Parked cars */}
      <ParkedCars />

      {/* Ramps */}
      <Ramps />

      {/* Moving traffic */}
      <MovingTraffic />

      {/* Invisible boundary walls */}
      <RigidBody type="fixed">
        <mesh position={[250, 5, 0]}>
          <boxGeometry args={[1, 20, 600]} />
          <meshStandardMaterial color="#4a7c59" visible={false} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[-250, 5, 0]}>
          <boxGeometry args={[1, 20, 600]} />
          <meshStandardMaterial color="#4a7c59" visible={false} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[0, 5, 250]}>
          <boxGeometry args={[600, 20, 1]} />
          <meshStandardMaterial color="#4a7c59" visible={false} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[0, 5, -250]}>
          <boxGeometry args={[600, 20, 1]} />
          <meshStandardMaterial color="#4a7c59" visible={false} />
        </mesh>
      </RigidBody>
    </group>
  )
}
