'use client'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { Box, Cylinder, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '@/store/useGameStore'
import { useCarControls } from '@/hooks/useCarControls'
import { useAudio } from '@/hooks/useAudio'
import { carBodyRef } from '@/utils/carRef'

// Car physics constants
const MAX_SPEED = 22
const NITRO_MAX_SPEED = 34
const ACCELERATION = 18
const BRAKE_FORCE = 40
const REVERSE_FORCE = 16
const STEERING_SPEED = 2.8
const MAX_STEER = 0.55
const NORMAL_LATERAL_FRICTION = 5
const NITRO_MULTIPLIER = 1.8
const CAR_MASS = 1500
const IMPULSE_SCALE = 0.05

const _vel = new THREE.Vector3()
const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _lateralVel = new THREE.Vector3()
const _impulse = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _euler = new THREE.Euler()

// Wheel visual refs
interface WheelRefs {
  fl: React.RefObject<THREE.Mesh>
  fr: React.RefObject<THREE.Mesh>
  rl: React.RefObject<THREE.Mesh>
  rr: React.RefObject<THREE.Mesh>
}

export default function Car() {
  const rigidBodyRef = useRef<RapierRigidBody | null>(null)
  const carMeshRef = useRef<THREE.Group | null>(null)
  const nitroParticlesRef = useRef<THREE.Group | null>(null)

  const wheelRefs: WheelRefs = {
    fl: useRef<THREE.Mesh>(null!),
    fr: useRef<THREE.Mesh>(null!),
    rl: useRef<THREE.Mesh>(null!),
    rr: useRef<THREE.Mesh>(null!),
  }

  const steerAngle = useRef(0)
  const nitroLevel = useRef(100)
  const pauseKeyWasDown = useRef(false)
  const cameraKeyWasDown = useRef(false)
  const resetKeyWasDown = useRef(false)
  const wheelRotation = useRef(0)
  const lastStoreUpdate = useRef(0)
  const lastStoreValues = useRef({
    speed: 0,
    nitro: 100,
    isNitroActive: false,
  })

  const controls = useCarControls()
  const { init: initAudio, updateEngineSound } = useAudio()

  const {
    gameState,
    setGameState,
    setCameraMode,
    cameraMode,
    updateCarState,
    shouldResetCar,
    clearResetFlag,
    settings,
  } = useGameStore()

  // Assign to shared ref
  useEffect(() => {
    carBodyRef.current = rigidBodyRef.current
  })

  useFrame((state, delta) => {
    const body = rigidBodyRef.current
    if (!body) return

    // Sync shared ref
    carBodyRef.current = body

    const ctrl = controls.current
    const isPlaying = gameState === 'playing'

    // --- Pause key (toggle) ---
    if (ctrl.pause && !pauseKeyWasDown.current) {
      pauseKeyWasDown.current = true
      if (gameState === 'playing') setGameState('paused')
      else if (gameState === 'paused') setGameState('playing')
    }
    if (!ctrl.pause) pauseKeyWasDown.current = false

    // --- Camera switch (toggle) ---
    if (ctrl.cameraSwitch && !cameraKeyWasDown.current) {
      cameraKeyWasDown.current = true
      const modes: Array<'chase' | 'firstperson' | 'topdown'> = ['chase', 'firstperson', 'topdown']
      const idx = modes.indexOf(cameraMode)
      setCameraMode(modes[(idx + 1) % modes.length])
    }
    if (!ctrl.cameraSwitch) cameraKeyWasDown.current = false

    // --- Reset key ---
    if (ctrl.reset && !resetKeyWasDown.current) {
      resetKeyWasDown.current = true
      body.setTranslation({ x: 0, y: 2, z: 0 }, true)
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      body.setAngvel({ x: 0, y: 0, z: 0 }, true)
      body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
    }
    if (!ctrl.reset) resetKeyWasDown.current = false

    // --- Store reset flag ---
    if (shouldResetCar) {
      body.setTranslation({ x: 0, y: 2, z: 0 }, true)
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      body.setAngvel({ x: 0, y: 0, z: 0 }, true)
      body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      clearResetFlag()
    }

    if (!isPlaying) {
        // Auto‑start the game when any movement key is pressed
        if (ctrl.forward || ctrl.backward || ctrl.left || ctrl.right) {
          setGameState('playing')
        } else {
          return
        }
      }

    // --- Get physics state ---
    const linvel = body.linvel()
    const rot = body.rotation()

    _vel.set(linvel.x, linvel.y, linvel.z)
    _quat.set(rot.x, rot.y, rot.z, rot.w)

    // Car forward = +Z in local space (model front is at positive Z)
    _forward.set(0, 0, 1).applyQuaternion(_quat).normalize()
    _right.set(1, 0, 0).applyQuaternion(_quat).normalize()

    const horizVel = new THREE.Vector3(linvel.x, 0, linvel.z)
    const speed = horizVel.length() // m/s

    // --- Nitro management ---
    const nitroActive = ctrl.nitro && nitroLevel.current > 0
    if (nitroActive) {
      nitroLevel.current = Math.max(0, nitroLevel.current - 30 * delta)
    } else {
      nitroLevel.current = Math.min(100, nitroLevel.current + 12 * delta)
    }

    const maxSpeed = nitroActive ? NITRO_MAX_SPEED : MAX_SPEED
    const reverseMaxSpeed = maxSpeed * 0.5
    const accelMultiplier = nitroActive ? NITRO_MULTIPLIER : 1

    const forwardSpeed = horizVel.dot(_forward)

    // --- Braking / reverse ---
    if (ctrl.backward) {
      if (forwardSpeed > 0.3) {
        // brake when moving forward
        const brakeForce = BRAKE_FORCE * delta
        _impulse.copy(_forward).multiplyScalar(-brakeForce * CAR_MASS * IMPULSE_SCALE)
        body.applyImpulse({ x: _impulse.x, y: 0, z: _impulse.z }, true)
      } else if (forwardSpeed > -reverseMaxSpeed) {
        // reverse slower than forward
        const force = REVERSE_FORCE * delta
        _impulse.copy(_forward).multiplyScalar(-force * CAR_MASS * IMPULSE_SCALE)
        body.applyImpulse({ x: _impulse.x, y: 0, z: _impulse.z }, true)
      }
    }

    if (ctrl.forward) {
      if (forwardSpeed < -0.3) {
        // brake when moving backward
        const brakeForce = BRAKE_FORCE * delta
        _impulse.copy(_forward).multiplyScalar(brakeForce * CAR_MASS * IMPULSE_SCALE)
        body.applyImpulse({ x: _impulse.x, y: 0, z: _impulse.z }, true)
      } else if (speed < maxSpeed) {
        const force = ACCELERATION * accelMultiplier * delta
        _impulse.copy(_forward).multiplyScalar(force * CAR_MASS * IMPULSE_SCALE)
        body.applyImpulse({ x: _impulse.x, y: 0, z: _impulse.z }, true)
      }
    }

    // --- Speed cap ---
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed
      body.setLinvel(
        { x: linvel.x * scale, y: linvel.y, z: linvel.z * scale },
        true
      )
    }

    // --- Reverse speed cap ---
    if (ctrl.backward && forwardSpeed < -reverseMaxSpeed) {
      const reverseScale = reverseMaxSpeed / -forwardSpeed
      body.setLinvel(
        { x: linvel.x * reverseScale, y: linvel.y, z: linvel.z * reverseScale },
        true
      )
    }

    // --- Steering ---
    if (speed > 0.5) {
      const steerInput = (ctrl.left ? 1 : 0) - (ctrl.right ? 1 : 0)
      const reverseSign = forwardSpeed < -0.3 ? -1 : 1
      const targetSteer = steerInput * reverseSign * MAX_STEER
      steerAngle.current = THREE.MathUtils.lerp(steerAngle.current, targetSteer, STEERING_SPEED * delta)

      // Apply yaw rotation based on speed (speed-sensitive steering)
      const steerFactor = Math.min(speed / 20, 1) * steerAngle.current
      const angVel = body.angvel()
      body.setAngvel(
        { x: angVel.x * 0.9, y: steerFactor * 2.5, z: angVel.z * 0.9 },
        true
      )
    } else {
      steerAngle.current = THREE.MathUtils.lerp(steerAngle.current, 0, 5 * delta)
    }

    // --- Lateral friction ---
    const lateralSpeed = horizVel.dot(_right)
    _lateralVel.copy(_right).multiplyScalar(lateralSpeed)
    const frictionImpulse = Math.min(NORMAL_LATERAL_FRICTION * delta * CAR_MASS * IMPULSE_SCALE, Math.abs(lateralSpeed) * CAR_MASS * IMPULSE_SCALE)

    if (_lateralVel.lengthSq() > 1e-6) {
      _impulse.copy(_lateralVel).normalize().multiplyScalar(-frictionImpulse)
      body.applyImpulse({ x: _impulse.x, y: 0, z: _impulse.z }, true)
    }

    // Keep car upright (anti-roll), but only gently correct small tilt to avoid vibration
    const currentRot = body.rotation()
    _euler.setFromQuaternion(
      new THREE.Quaternion(currentRot.x, currentRot.y, currentRot.z, currentRot.w),
      'YXZ'
    )
    if (Math.abs(_euler.x) > 0.05 || Math.abs(_euler.z) > 0.05) {
      _euler.x = THREE.MathUtils.lerp(_euler.x, 0, 2 * delta)
      _euler.z = THREE.MathUtils.lerp(_euler.z, 0, 2 * delta)
      const correctedQuat = new THREE.Quaternion().setFromEuler(_euler)
      body.setRotation({ x: correctedQuat.x, y: correctedQuat.y, z: correctedQuat.z, w: correctedQuat.w }, true)
    }

    const elapsedTime = state.clock.elapsedTime

    // --- Wheel rotation ---
    const speedKmh = speed * 3.6
    wheelRotation.current += speed * delta * 2.5
    const wRot = wheelRotation.current

    if (wheelRefs.fl.current) wheelRefs.fl.current.rotation.x = wRot
    if (wheelRefs.fr.current) wheelRefs.fr.current.rotation.x = wRot
    if (wheelRefs.rl.current) wheelRefs.rl.current.rotation.x = wRot
    if (wheelRefs.rr.current) wheelRefs.rr.current.rotation.x = wRot

    // --- Nitro particles ---
    if (nitroParticlesRef.current) {
      nitroParticlesRef.current.visible = nitroActive
    }

    // --- Audio ---
    updateEngineSound(speedKmh, settings.soundEnabled)

    // --- Update store (throttled) ---
    const shouldUpdateStore =
      elapsedTime - lastStoreUpdate.current > 0.1 ||
      Math.abs(speedKmh - lastStoreValues.current.speed) > 2 ||
      Math.abs(nitroLevel.current - lastStoreValues.current.nitro) > 2 ||
      nitroActive !== lastStoreValues.current.isNitroActive

    if (shouldUpdateStore) {
      updateCarState({
        speed: speedKmh,
        nitro: nitroLevel.current,
        isNitroActive: nitroActive,
      })
      lastStoreUpdate.current = elapsedTime
      lastStoreValues.current = {
        speed: speedKmh,
        nitro: nitroLevel.current,
        isNitroActive: nitroActive,
      }
    }
  })

  // Init audio on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAudio()
    }
    window.addEventListener('keydown', handleInteraction, { once: true })
    window.addEventListener('click', handleInteraction, { once: true })
    return () => {
      window.removeEventListener('keydown', handleInteraction)
      window.removeEventListener('click', handleInteraction)
    }
  }, [initAudio])

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[0, 2, 0]}
      mass={CAR_MASS}
      linearDamping={0.3}
      angularDamping={0.8}
      friction={0.7}
      restitution={0.1}
      colliders="cuboid"
      args={[1.25, 0.85, 2.75]}
    >
      <group ref={carMeshRef}>
        {/* Main chassis */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[2.4, 0.85, 5.5]} />
          <meshStandardMaterial color="#e63946" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Hood */}
        <mesh castShadow position={[0, 0.28, 1.8]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[2.35, 0.08, 1.1]} />
          <meshStandardMaterial color="#e63946" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* Cabin / roof */}
        <mesh castShadow position={[0, 0.72, -0.2]}>
          <boxGeometry args={[2.1, 0.6, 2.2]} />
          <meshStandardMaterial color="#c1121f" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Trunk */}
        <mesh castShadow position={[0, 0.28, -1.8]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[2.35, 0.08, 1.0]} />
          <meshStandardMaterial color="#e63946" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* Windshield (front glass) */}
        <mesh position={[0, 0.5, 1.0]}>
          <boxGeometry args={[1.8, 0.4, 0.06]} />
          <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
        </mesh>

        {/* Rear window */}
        <mesh position={[0, 0.5, -1.1]}>
          <boxGeometry args={[1.8, 0.35, 0.06]} />
          <meshStandardMaterial color="#a8d8ea" metalness={0.1} roughness={0.0} transparent opacity={0.7} />
        </mesh>

        {/* Front bumper */}
        <mesh castShadow position={[0, -0.12, 2.8]}>
          <boxGeometry args={[2.5, 0.4, 0.6]} />
          <meshStandardMaterial color="#333" metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Left mirror */}
        <group position={[-1.25, 0.32, 1.0]}>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.05, 0.3]} />
            <meshStandardMaterial color="#222" metalness={0.4} roughness={0.6} />
          </mesh>
          <mesh position={[0.0, -0.07, 0.2]}>
            <boxGeometry args={[0.06, 0.06, 0.1]} />
            <meshStandardMaterial color="#98b6c8" metalness={0.1} roughness={0.2} transparent opacity={0.85} />
          </mesh>
        </group>

        {/* Right mirror */}
        <group position={[1.25, 0.32, 1.0]}>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.05, 0.3]} />
            <meshStandardMaterial color="#222" metalness={0.4} roughness={0.6} />
          </mesh>
          <mesh position={[0.0, -0.07, 0.2]}>
            <boxGeometry args={[0.06, 0.06, 0.1]} />
            <meshStandardMaterial color="#98b6c8" metalness={0.1} roughness={0.2} transparent opacity={0.85} />
          </mesh>
        </group>

        {/* Rear bumper */}
        <mesh castShadow position={[0, -0.12, -2.8]}>
          <boxGeometry args={[2.5, 0.4, 0.6]} />
          <meshStandardMaterial color="#333" metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Headlights */}
        <mesh position={[0.7, 0.12, 2.65]}>
          <boxGeometry args={[0.32, 0.14, 0.07]} />
          <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.3} />
        </mesh>
        <mesh position={[-0.7, 0.12, 2.65]}>
          <boxGeometry args={[0.32, 0.14, 0.07]} />
          <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.3} />
        </mesh>

        {/* Brake lights */}
        <mesh position={[0.7, 0.12, -2.65]}>
          <boxGeometry args={[0.28, 0.12, 0.05]} />
          <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[-0.7, 0.12, -2.65]}>
          <boxGeometry args={[0.28, 0.12, 0.05]} />
          <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.2} />
        </mesh>

        {/* Wheels — FL, FR, RL, RR */}
        {/* Front Left */}
        <mesh ref={wheelRefs.fl} position={[-1.25, -0.25, 1.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.3, 14]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
        </mesh>

        {/* Front Right */}
        <mesh ref={wheelRefs.fr} position={[1.25, -0.25, 1.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.3, 14]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
        </mesh>

        {/* Rear Left */}
        <mesh ref={wheelRefs.rl} position={[-1.25, -0.25, -1.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.3, 14]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
        </mesh>

        {/* Rear Right */}
        <mesh ref={wheelRefs.rr} position={[1.25, -0.25, -1.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.3, 14]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.85} />
        </mesh>

        {/* Nitro exhaust particles */}
        <group ref={nitroParticlesRef} visible={false} position={[0, 0, -1.8]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.3,
                -(i * 0.3),
              ]}
            >
              <sphereGeometry args={[0.08 + Math.random() * 0.1, 6, 6]} />
              <meshStandardMaterial
                color={i < 3 ? '#ffffff' : i < 6 ? '#ffaa00' : '#ff4400'}
                emissive={i < 3 ? '#88ccff' : '#ff6600'}
                emissiveIntensity={3}
                transparent
                opacity={0.8 - i * 0.08}
              />
            </mesh>
          ))}
        </group>

        {/* Undercarriage shadow plane */}
        <mesh position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2.8, 5.5]} />
          <meshStandardMaterial color="#000" transparent opacity={0.25} />
        </mesh>
      </group>
    </RigidBody>
  )
}
