import {
  SWATCHBOX_HEIGHT,
  SWATCHBOX_WIDTH,
  TAB_BAR_HEIGHT,
} from "../components"
import { Position, Swatch } from "../types"
import { WindowSize } from "./hooks"

const GRID_SIZE = 10
export const getGridPosition = (mousePosition: Position, offset: Position) => {
  const x = mousePosition.x - offset.x
  const y = mousePosition.y - offset.y

  return {
    x: getRoundedValue(x < 0 ? GRID_SIZE : x),
    y: getRoundedValue(y < TAB_BAR_HEIGHT ? TAB_BAR_HEIGHT + GRID_SIZE : y),
  }
}

const getRoundedValue = (value: number) =>
  Math.round(value / GRID_SIZE) * GRID_SIZE

export const getContainerSize = (
  pageSwatches: Swatch[],
  mousePosition: Position,
  windowSize: WindowSize
) => {
  const width = Math.max(
    ...[
      windowSize.width || 0,
      mousePosition.x + SWATCHBOX_WIDTH * 2,
      ...pageSwatches.map((s) => s.position.x + SWATCHBOX_WIDTH * 2),
    ]
  )
  const height = Math.max(
    ...[
      windowSize.height || 0,
      mousePosition.y + SWATCHBOX_WIDTH * 2,
      ...pageSwatches.map((s) => s.position.y + SWATCHBOX_HEIGHT * 2),
    ]
  )
  return { width, height }
}
