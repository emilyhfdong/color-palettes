import React, { useCallback, useRef, useState } from "react"
import { Box, Button, Image, Text } from "rebass"
import { useAppDispatch, useAppSelector } from "../store"
import { actions } from "../store/slice"
import { getGridPosition, GRID_SIZE, rgbToHex } from "../utils"
import { v4 as uuid } from "uuid"
import { TAB_BAR_HEIGHT } from "./TabBar"

// @ts-ignore
const colorThief = new ColorThief()

export const ImageModal: React.FC = () => {
  const imageUrl = useAppSelector((state) => state.imageUrl)
  const dispatch = useAppDispatch()
  const swatches = useAppSelector((state) => state.swatches)
  const currentPageId = useAppSelector((state) => state.currentPageId)

  const [colors, setColors] = useState<
    { color: string; isSelected: boolean }[]
  >([])

  const ref = useRef<HTMLImageElement>(null)

  const onButtonClick = useCallback(() => {
    const newSwatches = colors
      .filter(({ isSelected }) => isSelected)
      .map(({ color }, idx) => ({
        id: uuid(),
        pageId: currentPageId,
        color,
        position: getGridPosition({
          x: GRID_SIZE + idx * GRID_SIZE,
          y: TAB_BAR_HEIGHT + GRID_SIZE + idx * GRID_SIZE,
        }),
      }))
    dispatch(actions.setSwatches([...swatches, ...newSwatches]))
    dispatch(actions.setImageUrl(""))
  }, [colors, currentPageId, swatches, dispatch])

  const onImageLoad = useCallback(async () => {
    if (ref.current && imageUrl && ref.current.complete) {
      const res = await colorThief.getPalette(ref.current)
      setColors(
        res.map(([r, g, b]: any) => ({
          color: rgbToHex(r, g, b),
          isSelected: false,
        }))
      )
    }
  }, [imageUrl])

  if (!imageUrl) {
    return null
  }

  return (
    <Box
      sx={{
        position: "absolute",
        height: "100vh",
        width: "100vw",
        top: 0,
        left: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={() => dispatch(actions.setImageUrl(""))}
    >
      <Box
        sx={{
          backgroundColor: "white",
          padding: 40,
          borderRadius: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Text
          sx={{
            color: "#254172",
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 10,
          }}
        >
          Select colors to create swatches
        </Text>
        <Image
          ref={ref}
          crossOrigin="anonymous"
          src={getImageUrl(imageUrl)}
          sx={{ height: "50vh" }}
          onLoad={onImageLoad}
        />
        <Box sx={{ display: "flex", marginTop: 10 }}>
          {colors.map(({ color, isSelected }) => (
            <Box
              key={color}
              sx={{
                height: 30,
                width: 30,
                borderRadius: 15,
                bg: color,
                marginLeft: "5px",
                cursor: "pointer",
                border: `1px solid ${isSelected ? "black" : "lightGrey"}`,
              }}
              onClick={() =>
                setColors((prevColors) =>
                  prevColors.map((prevColor) =>
                    prevColor.color === color
                      ? { ...prevColor, isSelected: !prevColor.isSelected }
                      : prevColor
                  )
                )
              }
            />
          ))}
        </Box>
        <Button
          disabled={!colors.some(({ isSelected }) => isSelected)}
          sx={{
            marginTop: 20,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#254172",
            fontSize: 12,
            fontWeight: "bold",
            cursor: "pointer",
            ":hover": {
              opacity: 0.8,
            },
            ":active": {
              opacity: 1,
            },
            ":disabled": {
              opacity: 0.7,
              cursor: "default",
            },
          }}
          onClick={onButtonClick}
        >
          Create swatches
        </Button>
      </Box>
    </Box>
  )
}

const getImageUrl = (url: string) => {
  return `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodeURIComponent(
    url
  )}`
}
