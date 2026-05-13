import type { MutableRefObject } from 'react'
import type { RapierRigidBody } from '@react-three/rapier'

export const carBodyRef: MutableRefObject<RapierRigidBody | null> = { current: null }
