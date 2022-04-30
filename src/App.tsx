import React, { useEffect, useState } from "react"
import { Flex, Text } from "rebass"
import { v4 as uuid } from "uuid"
import {
  ErrorToast,
  SwatchBox,
  SWATCHBOX_HEIGHT,
  SWATCHBOX_WIDTH,
  TabBar,
} from "./components"
import { DraggingSwatch, Page, Position, Swatch } from "./types"
import { localStorageHelpers } from "./utils"

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
              position: getGridPosition(mousePosition, {
                x: SWATCHBOX_WIDTH / 2,
                y: SWATCHBOX_HEIGHT / 2,
              }),
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
  }, [setSwatches, mousePosition, swatches, selectedSwatch, currentPageId])

  if (!isInitialized) {
    return null
  }

  return (
    <Flex
      onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
      sx={{
        height: "100vh",
        minWidth: "100vw",
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
        deletePage={(id) => {
          const newPages = pages.filter((p) => p.id !== id)
          setPages(newPages)
          setCurrentPageId(newPages[0].id)
          setSwatches(swatches.filter((s) => s.pageId !== id))
        }}
      />
      {!swatches.length && !draggingSwatch && (
        <Text sx={{ color: "grey", fontSize: 12, fontWeight: "bold" }}>
          ctrl + v hex codes to start creating palettes!
        </Text>
      )}
      <ErrorToast text={errorMessage} />
      {swatches
        .filter((s) => s.pageId === currentPageId)
        .map((swatch) => (
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
                position: getGridPosition(mousePosition, draggingSwatch.offset),
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

const getGridPosition = (mousePosition: Position, offset: Position) => {
  return {
    x: Math.round((mousePosition.x - offset.x) / 10) * 10,
    y: Math.round((mousePosition.y - offset.y) / 10) * 10,
  }
}
