import React, { useEffect, useState } from "react"
import { Box, Flex, Text } from "rebass"
import { v4 as uuid } from "uuid"

const SWATCH_SIZE = 100

type Position = {
  x: number
  y: number
}

type Swatch = {
  id: string
  color: string
  position: Position
}

export const App: React.FC = () => {
  const [swatches, setSwatches] = useState<Swatch[]>([])
  const [mousePosition, setMousePosition] = useState<Position>({
    x: 0,
    y: 0,
  })
  const [draggingSwatch, setDraggingSwatch] = useState<Swatch | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [hasError, setHasError] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedSwatch, setSelectedSwatch] = useState<Swatch | null>(null)

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("swatches", JSON.stringify(swatches))
    }
  }, [swatches, isInitialized])

  useEffect(() => {
    const localSwatches = localStorage.getItem("swatches")
    if (localSwatches) {
      try {
        const parsedSwatches = JSON.parse(localSwatches)
        setSwatches(parsedSwatches)
      } catch (e) {
        console.log("Error setting local swatches")
      }
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    const handler = async (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyV") {
        const text = await navigator.clipboard.readText()
        if (/#[0-9a-f]{6}|#[0-9a-f]{3}/gi.test(text)) {
          setSwatches([
            ...swatches,
            { id: uuid(), color: text, position: mousePosition },
          ])
        } else {
          setHasError(true)
          setErrorMessage(`'${text}' is not valid hex code`)
          setTimeout(() => setHasError(false), 1000)
          setTimeout(() => setErrorMessage(""), 2000)
        }
        return
      }
      if (event.code === "Backspace" && selectedSwatch) {
        setSwatches(swatches.filter((s) => s.id !== selectedSwatch.id))
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [setSwatches, mousePosition, swatches, selectedSwatch])

  return (
    <Flex
      onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Flex
        style={{
          position: "absolute",
          backgroundColor: "#B64E4B",
          borderRadius: 5,
          opacity: hasError ? 1 : 0,
          transition: "opacity 0.5s",
          top: 50,
          zIndex: 1000,
        }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: 12,
            padding: 10,
          }}
        >
          {errorMessage}
        </Text>
      </Flex>
      {swatches.map((swatch) => (
        <SwatchBox
          key={swatch.id}
          onMouseDown={(e) => {
            setSelectedSwatch(swatch)
            e.stopPropagation()
            setSwatches(swatches.filter((s) => s.id !== swatch.id))
            setDraggingSwatch(swatch)
          }}
          position={swatch.position}
          color={swatch.color}
          isSelected={selectedSwatch?.id === swatch.id}
        />
      ))}
      {draggingSwatch && (
        <SwatchBox
          position={mousePosition}
          color={draggingSwatch.color}
          isDragging
          onMouseUp={(e) => {
            e.stopPropagation()
            setDraggingSwatch(null)
            setSwatches([
              ...swatches,
              {
                id: draggingSwatch.id,
                color: draggingSwatch.color,
                position: mousePosition,
              },
            ])
          }}
          isSelected={selectedSwatch?.id === draggingSwatch.id}
        />
      )}
    </Flex>
  )
}

type SwatchProps = {
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>
  color: string
  position: Position
  isSelected?: boolean
  isDragging?: boolean
}

export const SwatchBox: React.FC<SwatchProps> = ({
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
        height: SWATCH_SIZE,
        width: SWATCH_SIZE,
        backgroundColor: color,
        top: position.y - SWATCH_SIZE / 2,
        left: position.x - SWATCH_SIZE / 2,
        boxShadow:
          isDragging || isSelected ? "0px 0px 10px rgba(0, 0, 0, 0.2)" : "",
        padding: "5px",
      }}
    >
      <Text style={{ color: "black", fontSize: 12, fontWeight: "bold" }}>
        {color.toUpperCase()}
      </Text>
    </Box>
  )
}
