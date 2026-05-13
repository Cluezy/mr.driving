'use client'
import { create } from 'zustand'
import type { GameState, CameraMode, CarState, GameSettings } from '@/types/game'

interface GameStore {
  gameState: GameState
  cameraMode: CameraMode
  carState: CarState
  settings: GameSettings
  shouldResetCar: boolean

  setGameState: (state: GameState) => void
  setCameraMode: (mode: CameraMode) => void
  updateCarState: (partial: Partial<CarState>) => void
  toggleDayNight: () => void
  toggleSound: () => void
  toggleShadows: () => void
  resetCar: () => void
  clearResetFlag: () => void
  addDriftScore: (score: number, combo: number) => void
}

export const useGameStore = create<GameStore>()((set, get) => ({
  gameState: 'playing',
  cameraMode: 'chase',
  shouldResetCar: false,

  carState: {
    speed: 0,
    nitro: 100,
    driftScore: 0,
    driftCombo: 1,
    totalScore: 0,
    damage: 0,
    isNitroActive: false,
    isDrifting: false,
  },

  settings: {
    soundEnabled: true,
    shadowsEnabled: true,
    dayNight: 'day',
  },

  setGameState: (state) => set({ gameState: state }),

  setCameraMode: (mode) => set({ cameraMode: mode }),

  updateCarState: (partial) =>
    set((s) => ({ carState: { ...s.carState, ...partial } })),

  toggleDayNight: () =>
    set((s) => ({
      settings: {
        ...s.settings,
        dayNight: s.settings.dayNight === 'day' ? 'night' : 'day',
      },
    })),

  toggleSound: () =>
    set((s) => ({
      settings: { ...s.settings, soundEnabled: !s.settings.soundEnabled },
    })),

  toggleShadows: () =>
    set((s) => ({
      settings: { ...s.settings, shadowsEnabled: !s.settings.shadowsEnabled },
    })),

  resetCar: () => set({ shouldResetCar: true }),

  clearResetFlag: () => set({ shouldResetCar: false }),

  addDriftScore: (score, combo) =>
    set((s) => ({
      carState: {
        ...s.carState,
        driftScore: s.carState.driftScore + score,
        driftCombo: combo,
        totalScore: s.carState.totalScore + score * combo,
      },
    })),
}))
