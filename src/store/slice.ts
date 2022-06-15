import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Page, Swatch } from "../types"
import { v4 as uuid } from "uuid"

interface State {
  imageUrl: string
  swatches: Swatch[]
  pages: Page[]
  errorMessage: string
  currentPageId: string
}

const initialState: State = {
  imageUrl: "",
  pages: [{ id: uuid(), name: "Tab 1" }],
  swatches: [],
  errorMessage: "",
  currentPageId: "",
}

export const slice = createSlice({
  name: "slice",
  initialState,
  reducers: {
    setPages: (state, action: PayloadAction<Page[]>) => ({
      ...state,
      pages: action.payload,
    }),
    setImageUrl: (state, action: PayloadAction<string>) => ({
      ...state,
      imageUrl: action.payload,
    }),
    setSwatches: (state, action: PayloadAction<Swatch[]>) => ({
      ...state,
      swatches: action.payload,
    }),
    setErrorMessage: (state, action: PayloadAction<string>) => ({
      ...state,
      errorMessage: action.payload,
    }),
    setCurrentPageId: (state, action: PayloadAction<string>) => ({
      ...state,
      currentPageId: action.payload,
    }),
  },
})

export const actions = slice.actions
