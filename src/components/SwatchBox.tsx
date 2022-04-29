import React from "react"
import { Box, Text } from "rebass"
import { Position } from "../types"

type SwatchBoxProps = {
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>
  color: string
  position: Position
  isSelected?: boolean
  isDragging?: boolean
}
export const SWATCHBOX_WIDTH = 100
export const SWATCH_HEIGHT = 75
const LABEL_HEIGHT = 30
export const SWATCHBOX_HEIGHT = SWATCH_HEIGHT + LABEL_HEIGHT

export const SwatchBox: React.FC<SwatchBoxProps> = ({
  onMouseDown,
  onMouseUp,
  color,
  position,
  isDragging = false,
  isSelected = false,
}) => {
  return (
    <Box
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
      sx={{
        position: "absolute",
        height: SWATCH_HEIGHT + LABEL_HEIGHT,
        width: SWATCHBOX_WIDTH,
        top: position.y,
        left: position.x,
        boxShadow:
          isDragging || isSelected ? "0px 0px 10px rgba(0, 0, 0, 0.1)" : "",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
      }}
    >
      <Box
        sx={{ height: SWATCH_HEIGHT, width: "100%", backgroundColor: color }}
      ></Box>
      <Box sx={{ padding: "5px" }}>
        <Text style={{ color: "black", fontSize: 10, fontWeight: "600" }}>
          {color.toUpperCase()}
        </Text>
      </Box>
    </Box>
  )
}
