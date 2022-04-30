export type Position = {
  x: number
  y: number
}

export type Swatch = {
  id: string
  pageId: string
  color: string
  position: Position
}

export type Page = {
  id: string
  name: string
}

export type DraggingSwatch = {
  id: string
  color: string
  offset: Position
}
