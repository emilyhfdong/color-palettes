import React, { useCallback, useRef, useState } from "react"
import { Flex } from "rebass"
import { ReactComponent as Plus } from "../assets/plus.svg"
import { ReactComponent as Cross } from "../assets/cross.svg"
import { v4 as uuid } from "uuid"
import { SWATCHBOX_Z_INDEX } from "./SwatchBox"
import { useAppDispatch, useAppSelector } from "../store"
import { actions } from "../store/slice"

export const TAB_BAR_HEIGHT = 40

export const TabBar: React.FC = () => {
  const pages = useAppSelector((state) => state.pages)
  const currentPageId = useAppSelector((state) => state.currentPageId)
  const swatches = useAppSelector((state) => state.swatches)
  const dispatch = useAppDispatch()

  const deletePage = useCallback(
    (id: string) => {
      const newPages = pages.filter((p) => p.id !== id)
      dispatch(actions.setPages(newPages))
      dispatch(actions.setCurrentPageId(newPages[0].id))
      dispatch(actions.setSwatches(swatches.filter((s) => s.pageId !== id)))
    },
    [pages, swatches, dispatch]
  )
  return (
    <Flex
      sx={{
        position: "absolute",
        backgroundColor: "white",
        top: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
        flexDirection: "row",
        height: TAB_BAR_HEIGHT,
        zIndex: SWATCHBOX_Z_INDEX - 1,
      }}
    >
      {pages.map((page) => {
        const active = currentPageId === page.id
        return (
          <Tab
            key={page.id}
            name={page.name}
            active={active}
            setName={(newName: string) =>
              dispatch(
                actions.setPages(
                  pages.map((p) =>
                    p.id === page.id ? { ...page, name: newName } : p
                  )
                )
              )
            }
            onClick={() => {
              if (!active) {
                dispatch(actions.setCurrentPageId(page.id))
              }
            }}
            deletePage={() => deletePage(page.id)}
            deleteIsDisabled={!active || pages.length === 1}
          />
        )
      })}

      <Plus
        style={{ height: 15, width: 15, marginLeft: 10, cursor: "pointer" }}
        onClick={() => {
          const pageId = uuid()
          dispatch(
            actions.setPages([...pages, { id: pageId, name: "New Tab" }])
          )
          dispatch(actions.setCurrentPageId(pageId))
        }}
      />
    </Flex>
  )
}

type TabProps = {
  name: string
  active?: boolean
  setName: (name: string) => void
  onClick: () => void
  deletePage: () => void
  deleteIsDisabled: boolean
}

export const Tab: React.FC<TabProps> = ({
  name,
  active,
  setName,
  onClick,
  deletePage,
  deleteIsDisabled,
}) => {
  const [localName, setLocalName] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <Flex
      sx={{
        alignItems: "center",
        justifyContent: "center",
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        height: "100%",
        cursor: "pointer",
        backgroundColor: "white",
        zIndex: 1,
        minWidth: 150,
      }}
      onClick={onClick}
    >
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            inputRef.current?.blur()
            e.stopPropagation()
          }
        }}
        value={localName}
        ref={inputRef}
        style={{
          color: "#254172",
          fontSize: 14,
          fontWeight: "bold",
          opacity: active ? 1 : 0.4,
          transition: "opacity 0.25s",
          padding: "0px 10px",
          textAlign: "center",
          fontFamily: "Rozha One",
          outline: "none",
          border: "none",
          backgroundColor: "white",
          cursor: !active ? "pointer" : "text",
          textOverflow: "ellipsis",
        }}
        onChange={(e) => setLocalName(e.target.value)}
        disabled={!active}
        onBlur={() => setName(localName)}
      />
      <Flex
        sx={{
          backgroundColor: "white",
          height: 12,
          width: 12,
          borderRadius: 6,
          justifyContent: "center",
          alignItems: "center",
          marginRight: "5px",
          ":hover": {
            backgroundColor: "#EBEDEE",
          },
          transition: "background-color 0.25s",
          opacity: !deleteIsDisabled ? 1 : 0,
        }}
      >
        <Cross
          style={{ height: 10, width: 10 }}
          onClick={() => {
            if (!deleteIsDisabled) {
              deletePage()
            }
          }}
        />
      </Flex>
      <Flex
        sx={{
          width: 1,
          height: "60%",
          backgroundColor: "#254172",
          opacity: 0.4,
        }}
      />
    </Flex>
  )
}
