'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
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
      { path: 'z', x: 14, z: -240, speed: 8, dir: 1, color: '#3a86ff' },
      { path: 'z', x: -14, z: 240, speed: 9, dir: -1, color: '#ffd60a' },
      { path: 'x', x: -240, z: 20, speed: 7, dir: 1, color: '#8338ec' },
      { path: 'x', x: 240, z: 50, speed: 6, dir: -1, color: '#c0c0c0' },
      { path: 'z', x: 20, z: 180, speed: 8, dir: -1, color: '#2dc653' },
      { path: 'x', x: -160, z: 85, speed: 7, dir: 1, color: '#ff6b6b' },
    ],
    []
  )

  const refs = useRef<Array<THREE.Group | null>>([])

  useFrame((state, delta) => {
    refs.current.forEach((group, index) => {
      const car = parkedCars[index]
      if (!group) return

      if (car.path === 'z') {
        const z = group.position.z + car.speed * delta * car.dir
        const wrapped = z > 260 ? -260 : z < -260 ? 260 : z
        group.position.z = wrapped
        group.rotation.y = car.dir > 0 ? 0 : Math.PI
      } else {
        const x = group.position.x + car.speed * delta * car.dir
        const wrapped = x > 260 ? -260 : x < -260 ? 260 : x
        group.position.x = wrapped
        group.rotation.y = car.dir > 0 ? -Math.PI / 2 : Math.PI / 2
      }
    })
  })

  return (
    <group>
      {parkedCars.map((car, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[car.path === 'z' ? car.x : car.x, 0.45, car.path === 'z' ? car.z : car.z]}
          rotation={[0, car.path === 'z' ? (car.dir > 0 ? 0 : Math.PI) : car.dir > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
        >
          {/* Main chassis */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.8, 4.5]} />
            <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.3} />
          </mesh>

          {/* Hood */}
          <mesh castShadow position={[0, 0.26, 1.5]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[1.95, 0.08, 1.0]} />
            <meshStandardMaterial color={car.color} metalness={0.7} roughness={0.2} />
          </mesh>

          {/* Cabin / roof */}
          <mesh castShadow position={[0, 0.65, -0.15]}>
            <boxGeometry args={[1.85, 0.58, 2.0]} />
            <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.3} />
          </mesh>

          {/* Trunk */}
          <mesh castShadow position={[0, 0.26, -1.5]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[1.95, 0.08, 0.9]} />
            <meshStandardMaterial color={car.color} metalness={0.7} roughness={0.2} />
          </mesh>

          {/* Windshield */}
          <mesh position={[0, 0.5, 0.9]}>
            <boxGeometry args={[1.7, 0.35, 0.05]} />
            <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
          </mesh>

          {/* Rear window */}
          <mesh position={[0, 0.5, -1.0]}>
            <boxGeometry args={[1.7, 0.3, 0.05]} />
            <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
          </mesh>

          {/* Front bumper */}
          <mesh castShadow position={[0, -0.09, 2.3]}>
            <boxGeometry args={[2.1, 0.32, 0.45]} />
            <meshStandardMaterial color="#333" metalness={0.4} roughness={0.6} />
          </mesh>

          {/* Rear bumper */}
          <mesh castShadow position={[0, -0.09, -2.3]}>
            <boxGeometry args={[2.1, 0.32, 0.45]} />
            <meshStandardMaterial color="#333" metalness={0.4} roughness={0.6} />
          </mesh>

          {/* Headlights */}
          <mesh position={[0.65, 0.15, 2.2]}>
            <boxGeometry args={[0.3, 0.14, 0.07]} />
            <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.3} />
          </mesh>
          <mesh position={[-0.65, 0.15, 2.2]}>
            <boxGeometry args={[0.3, 0.14, 0.07]} />
            <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.3} />
          </mesh>

          {/* Brake lights */}
          <mesh position={[0.65, 0.15, -2.2]}>
            <boxGeometry args={[0.25, 0.12, 0.05]} />
            <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[-0.65, 0.15, -2.2]}>
            <boxGeometry args={[0.25, 0.12, 0.05]} />
            <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
          </mesh>

          {/* Wheels */}
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

          {/* Left mirror */}
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

          {/* Right mirror */}
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
        </group>
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
      { path: 'z', x: -6, z: -240, speed: 10, dir: 1, color: '#ff5247' },
      { path: 'z', x: 6, z: 240, speed: 9, dir: -1, color: '#1e90ff' },
      { path: 'x', x: -240, z: 80, speed: 7, dir: 1, color: '#f9c74f' },
      { path: 'x', x: 240, z: -100, speed: 6, dir: -1, color: '#90be6d' },
      { path: 'z', x: 160, z: -200, speed: 5, dir: 1, color: '#577590' },
      { path: 'x', x: -160, z: 180, speed: 6, dir: -1, color: '#f28482' },
    ],
    []
  )

  const refs = useRef<Array<THREE.Group | null>>([])

  useFrame((state, delta) => {
    refs.current.forEach((group, index) => {
      const car = cars[index]
      if (!group) return

      if (car.path === 'z') {
        const z = group.position.z + car.speed * delta * car.dir
        const wrapped = z > 260 ? -260 : z < -260 ? 260 : z
        group.position.z = wrapped
        group.rotation.y = car.dir > 0 ? 0 : Math.PI
      } else {
        const x = group.position.x + car.speed * delta * car.dir
        const wrapped = x > 260 ? -260 : x < -260 ? 260 : x
        group.position.x = wrapped
        group.rotation.y = car.dir > 0 ? -Math.PI / 2 : Math.PI / 2
      }
    })
  })

  return (
    <group>
      {cars.map((car, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[car.path === 'z' ? car.x : car.x, 0.45, car.path === 'z' ? car.z : car.z]}
          rotation={[0, car.path === 'z' ? (car.dir > 0 ? 0 : Math.PI) : car.dir > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
        >
          {/* Main chassis */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.75, 0.72, 4]} />
            <meshStandardMaterial color={car.color} metalness={0.5} roughness={0.3} />
          </mesh>

          {/* Hood */}
          <mesh castShadow position={[0, 0.28, 1.6]} rotation={[-0.08, 0, 0]}>
            <boxGeometry args={[1.7, 0.06, 0.8]} />
            <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.25} />
          </mesh>

          {/* Cabin / roof */}
          <mesh castShadow position={[0, 0.55, 0]}>
            <boxGeometry args={[1.5, 0.52, 2.0]} />
            <meshStandardMaterial color={car.color} metalness={0.5} roughness={0.3} />
          </mesh>

          {/* Trunk */}
          <mesh castShadow position={[0, 0.28, -1.6]} rotation={[0.06, 0, 0]}>
            <boxGeometry args={[1.7, 0.06, 0.7]} />
            <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.25} />
          </mesh>

          {/* Windshield */}
          <mesh position={[0, 0.48, 0.8]}>
            <boxGeometry args={[1.4, 0.32, 0.05]} />
            <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
          </mesh>

          {/* Rear window */}
          <mesh position={[0, 0.48, -0.8]}>
            <boxGeometry args={[1.4, 0.28, 0.05]} />
            <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
          </mesh>

          {/* Front bumper */}
          <mesh castShadow position={[0, -0.08, 2.2]}>
            <boxGeometry args={[1.8, 0.3, 0.4]} />
            <meshStandardMaterial color="#333" metalness={0.4} roughness={0.6} />
          </mesh>

          {/* Rear bumper */}
          <mesh castShadow position={[0, -0.08, -2.2]}>
            <boxGeometry args={[1.8, 0.3, 0.4]} />
            <meshStandardMaterial color="#333" metalness={0.4} roughness={0.6} />
          </mesh>

          {/* Headlights */}
          <mesh position={[0.6, 0.15, 1.95]}>
            <boxGeometry args={[0.3, 0.14, 0.07]} />
            <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.3} />
          </mesh>
          <mesh position={[-0.6, 0.15, 1.95]}>
            <boxGeometry args={[0.3, 0.14, 0.07]} />
            <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.3} />
          </mesh>

          {/* Brake lights */}
          <mesh position={[0.6, 0.15, -1.95]}>
            <boxGeometry args={[0.25, 0.12, 0.05]} />
            <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[-0.6, 0.15, -1.95]}>
            <boxGeometry args={[0.25, 0.12, 0.05]} />
            <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
          </mesh>

          {/* Wheels */}
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

          {/* Left mirror */}
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

          {/* Right mirror */}
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
        </group>
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
