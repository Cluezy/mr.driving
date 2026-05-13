export interface BuildingData {
  x: number
  z: number
  width: number
  depth: number
  height: number
  color: string
}

export interface TreeData {
  x: number
  z: number
}

export interface StreetlightData {
  x: number
  z: number
  rotation: number
}

const BUILDING_COLORS = ['#8a9bb0', '#6b7fa3', '#c4a882', '#7a8fa6', '#9aabb5', '#b0a090', '#7090a0']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function generateBuildings(): BuildingData[] {
  const rand = seededRandom(42)
  const buildings: BuildingData[] = []

  // City block positions (off the main road corridor)
  const blockPositions: [number, number][] = [
    // Left side
    [-55, -80], [-55, -140], [-55, -200], [-55, -260], [-55, -320],
    [-110, -80], [-110, -140], [-110, -200], [-110, -260], [-110, -320],
    [-165, -80], [-165, -140], [-165, -200], [-165, -260], [-165, -320],
    // Right side
    [55, -80], [55, -140], [55, -200], [55, -260], [55, -320],
    [110, -80], [110, -140], [110, -200], [110, -260], [110, -320],
    [165, -80], [165, -140], [165, -200], [165, -260], [165, -320],
    // Upper city blocks
    [-55, 100], [-55, 160], [-55, 220], [-110, 100], [-110, 160], [-110, 220],
    [55, 100], [55, 160], [55, 220], [110, 100], [110, 160], [110, 220],
    [165, 100], [165, 160], [165, 220],
    // Outer side street blocks
    [160, 40], [160, 100], [160, 180], [160, -40], [160, -100], [160, -180],
    [-160, 40], [-160, 100], [-160, 180], [-160, -40], [-160, -100], [-160, -180],
  ]

  for (const [bx, bz] of blockPositions) {
    const w = 10 + rand() * 8
    const d = 10 + rand() * 8
    const h = 8 + rand() * 32
    buildings.push({
      x: bx + (rand() - 0.5) * 10,
      z: bz + (rand() - 0.5) * 10,
      width: w,
      depth: d,
      height: h,
      color: BUILDING_COLORS[Math.floor(rand() * BUILDING_COLORS.length)],
    })
  }

  return buildings
}

export function generateTrees(): TreeData[] {
  const rand = seededRandom(123)
  const trees: TreeData[] = []

  // Trees scattered on grass areas
  const zones = [
    { cx: -200, cz: 0, count: 15 },
    { cx: 200, cz: 0, count: 15 },
    { cx: 0, cz: 200, count: 12 },
    { cx: 0, cz: -300, count: 10 },
  ]

  for (const zone of zones) {
    for (let i = 0; i < zone.count; i++) {
      trees.push({
        x: zone.cx + (rand() - 0.5) * 100,
        z: zone.cz + (rand() - 0.5) * 100,
      })
    }
  }

  return trees
}

export function generateStreetlights(): StreetlightData[] {
  const lights: StreetlightData[] = []

  // Along main highway (z-axis road)
  for (let z = -200; z <= 200; z += 30) {
    lights.push({ x: 12, z, rotation: 0 })
    lights.push({ x: -12, z, rotation: Math.PI })
  }

  // Along cross road (x-axis at z=80)
  for (let x = -200; x <= 200; x += 30) {
    lights.push({ x, z: 92, rotation: Math.PI / 2 })
    lights.push({ x, z: 68, rotation: -Math.PI / 2 })
  }

  // Along additional cross roads
  for (let x = -220; x <= 220; x += 30) {
    lights.push({ x, z: 190, rotation: Math.PI / 2 })
    lights.push({ x, z: 170, rotation: -Math.PI / 2 })
    lights.push({ x, z: -210, rotation: Math.PI / 2 })
    lights.push({ x, z: -230, rotation: -Math.PI / 2 })
  }

  // Along new side streets
  for (let z = -220; z <= 220; z += 30) {
    lights.push({ x: 160, z, rotation: 0 })
    lights.push({ x: -160, z, rotation: Math.PI })
  }

  return lights
}
