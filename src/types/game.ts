export type GameState = 'menu' | 'playing' | 'paused' | 'settings'
export type CameraMode = 'chase' | 'firstperson' | 'topdown'
export type DayNight = 'day' | 'night'

export interface CarState {
  speed: number       // km/h 0-300
  nitro: number       // 0-100
  driftScore: number
  driftCombo: number
  totalScore: number
  damage: number      // 0-100
  isNitroActive: boolean
  isDrifting: boolean
}

export interface GameSettings {
  soundEnabled: boolean
  shadowsEnabled: boolean
  dayNight: DayNight
}
