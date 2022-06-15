import React, { useCallback, useEffect, useState } from "react"
import { Flex, Text } from "rebass"
import { v4 as uuid } from "uuid"
import {
  ErrorToast,
  ImageModal,
  SwatchBox,
  SWATCHBOX_HEIGHT,
  SWATCHBOX_WIDTH,
  TabBar,
} from "./components"
import { useAppDispatch, useAppSelector } from "./store"
import { actions } from "./store/slice"
import { DraggingSwatch, Position, Swatch } from "./types"
import { isHexCode, isImageUrl } from "./utils"
import { getContainerSize, getGridPosition } from "./utils/gridHelpers"
import { useKeyDown, useWindowSize } from "./utils/hooks"

export const App: React.FC = () => {
  const swatches = useAppSelector((state) => state.swatches)
  const pages = useAppSelector((state) => state.pages)
  const currentPageId = useAppSelector((state) => state.currentPageId)
  const imageUrl = useAppSelector((state) => state.imageUrl)

  const errorMessage = useAppSelector((state) => state.errorMessage)
  const dispatch = useAppDispatch()

  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 })
  const [draggingSwatch, setDraggingSwatch] = useState<DraggingSwatch | null>(
    null
  )
  const [selectedSwatch, setSelectedSwatch] = useState<Swatch | null>(null)

  const pageSwatches = swatches.filter((s) => s.pageId === currentPageId)
  const windowSize = useWindowSize()
  const { width, height } = getContainerSize(
    pageSwatches,
    mousePosition,
    windowSize
  )

  useEffect(() => {
    if (!currentPageId) {
      dispatch(actions.setCurrentPageId(pages[0].id))
    }
  }, [currentPageId, pages, dispatch])

  useKeyDown({
    onPaste: (text) => {
      if (isHexCode(text)) {
        dispatch(
          actions.setSwatches([
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
        )
      } else if (isImageUrl(text)) {
        dispatch(actions.setImageUrl(text))
      } else {
        dispatch(
          actions.setErrorMessage(`'${text}' is not valid hex code or image`)
        )
        setTimeout(() => dispatch(actions.setErrorMessage("")), 1000)
      }
    },
    onBackspace: () => {
      if (selectedSwatch) {
        dispatch(
          actions.setSwatches(
            swatches.filter((s) => s.id !== selectedSwatch.id)
          )
        )
      }
    },
    copyText: selectedSwatch?.color,
  })

  return (
    <Flex
      onMouseMove={(e) => {
        const x = e.pageX
        const y = e.pageY
        setMousePosition({ x, y })
      }}
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
      {imageUrl && <ImageModal />}
      <TabBar />
      {!pageSwatches.length && !draggingSwatch && (
        <Text sx={{ color: "grey", fontSize: 12, fontWeight: "bold" }}>
          ctrl + v hex codes or image urls to start creating palettes!
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
            dispatch(
              actions.setSwatches(swatches.filter((s) => s.id !== swatch.id))
            )
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
            dispatch(
              actions.setSwatches([
                ...swatches,
                {
                  id: draggingSwatch.id,
                  color: draggingSwatch.color,
                  position: getGridPosition(
                    mousePosition,
                    draggingSwatch.offset
                  ),
                  pageId: currentPageId,
                },
              ])
            )
          }}
          isSelected={selectedSwatch?.id === draggingSwatch.id}
        />
      )}
    </Flex>
  )
}
