import React, { useCallback, useEffect, useState } from "react"
import { Flex, Text } from "rebass"
import { v4 as uuid } from "uuid"
import {
  ErrorToast,
  SwatchBox,
  SWATCHBOX_HEIGHT,
  SWATCHBOX_WIDTH,
  TabBar,
  TAB_BAR_HEIGHT,
} from "./components"
import { DraggingSwatch, Page, Position, Swatch } from "./types"
import { localStorageHelpers } from "./utils"
import { useWindowSize, WindowSize } from "./utils/hooks"

export const App: React.FC = () => {
  const [swatches, setSwatches] = useState<Swatch[]>([])
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 })
  const [draggingSwatch, setDraggingSwatch] = useState<DraggingSwatch | null>(
    null
  )
  const [errorMessage, setErrorMessage] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedSwatch, setSelectedSwatch] = useState<Swatch | null>(null)
  const [currentPageId, setCurrentPageId] = useState("")
  const [pages, setPages] = useState<Page[]>([{ id: uuid(), name: "Tab 1" }])

  const pageSwatches = swatches.filter((s) => s.pageId === currentPageId)
  const windowSize = useWindowSize()
  const { width, height } = getContainerSize(pageSwatches, windowSize)

  useEffect(() => {
    if (isInitialized) {
      localStorageHelpers.set({ swatches, pages })
    }
  }, [swatches, isInitialized, pages])

  useEffect(() => {
    const persistedState = localStorageHelpers.get()
    if (persistedState) {
      setSwatches(persistedState.swatches)
      setPages(persistedState.pages)
      setCurrentPageId(persistedState.pages[0].id)
    } else {
      const newPageId = uuid()
      setPages([{ id: newPageId, name: "Tab 1" }])
      setCurrentPageId(newPageId)
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
            {
              id: uuid(),
              pageId: currentPageId,
              color: text,
              position: getGridPosition(
                mousePosition,
                {
                  x: SWATCHBOX_WIDTH / 2,
                  y: SWATCHBOX_HEIGHT / 2,
                },
                windowSize
              ),
            },
          ])
        } else {
          setErrorMessage(`'${text}' is not valid hex code`)
          setTimeout(() => setErrorMessage(""), 1000)
        }
        return
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.code === "KeyC" &&
        selectedSwatch
      ) {
        navigator.clipboard.writeText(selectedSwatch.color)
      }
      if (event.code === "Backspace" && selectedSwatch) {
        setSwatches(swatches.filter((s) => s.id !== selectedSwatch.id))
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [
    setSwatches,
    mousePosition,
    swatches,
    selectedSwatch,
    currentPageId,
    windowSize,
  ])

  const deletePage = useCallback(
    (id: string) => {
      const newPages = pages.filter((p) => p.id !== id)
      setPages(newPages)
      setCurrentPageId(newPages[0].id)
      setSwatches(swatches.filter((s) => s.pageId !== id))
    },
    [pages, swatches]
  )

  if (!isInitialized) {
    return null
  }

  return (
    <Flex
      onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
      sx={{
        height,
        width,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EBEDEE",
        backgroundImage:
          "radial-gradient(circle, #DEE0E1 1px, rgba(0, 0, 0, 0) 1px)",
        backgroundRepeat: "repeat",
        backgroundSize: "10px 10px",
        backgroundPosition: "-5px -5px",
      }}
      onClick={() => setSelectedSwatch(null)}
    >
      <TabBar
        pages={pages}
        setPages={setPages}
        activePageId={currentPageId}
        setActivePageId={setCurrentPageId}
        deletePage={deletePage}
      />
      {!swatches.length && !draggingSwatch && (
        <Text sx={{ color: "grey", fontSize: 12, fontWeight: "bold" }}>
          ctrl + v hex codes to start creating palettes!
        </Text>
      )}
      <ErrorToast text={errorMessage} />
      {pageSwatches.map((swatch) => (
        <SwatchBox
          key={swatch.id}
          onMouseDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            setSelectedSwatch(swatch)
            e.stopPropagation()
            setSwatches(swatches.filter((s) => s.id !== swatch.id))
            setDraggingSwatch({
              id: swatch.id,
              color: swatch.color,
              offset: { x, y },
            })
          }}
          position={swatch.position}
          color={swatch.color}
          isSelected={selectedSwatch?.id === swatch.id}
        />
      ))}
      {draggingSwatch && (
        <SwatchBox
          position={{
            x: mousePosition.x - draggingSwatch.offset.x,
            y: mousePosition.y - draggingSwatch.offset.y,
          }}
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
                position: getGridPosition(
                  mousePosition,
                  draggingSwatch.offset,
                  windowSize
                ),
                pageId: currentPageId,
              },
            ])
          }}
          isSelected={selectedSwatch?.id === draggingSwatch.id}
        />
      )}
    </Flex>
  )
}
const GRID_SIZE = 10
const getGridPosition = (
  mousePosition: Position,
  offset: Position,
  windowSize: WindowSize
) => {
  let x = mousePosition.x - offset.x
  if (x < 0) {
    x = GRID_SIZE
  }
  if (windowSize.width && x + SWATCHBOX_WIDTH > windowSize.width) {
    x = windowSize.width - GRID_SIZE - SWATCHBOX_WIDTH
  }

  let y = mousePosition.y - offset.y

  if (y < TAB_BAR_HEIGHT) {
    y = TAB_BAR_HEIGHT + GRID_SIZE
  }
  if (windowSize.height && y + SWATCHBOX_HEIGHT > windowSize.height) {
    y = windowSize.height - GRID_SIZE - SWATCHBOX_HEIGHT
  }

  return {
    x: Math.round(x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(y / GRID_SIZE) * GRID_SIZE,
  }
}

export const getContainerSize = (
  pageSwatches: Swatch[],
  windowSize: WindowSize
) => {
  const width = Math.max(
    ...[
      windowSize.width || 0,
      ...pageSwatches.map((s) => s.position.x + SWATCHBOX_WIDTH * 2),
    ]
  )
  const height = Math.max(
    ...[
      windowSize.height || 0,
      ...pageSwatches.map((s) => s.position.y + SWATCHBOX_HEIGHT * 2),
    ]
  )
  return { width, height }
}
