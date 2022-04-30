import { Page, Swatch } from "../types"

type LocalStorageState = {
  version: number
  swatches: Swatch[]
  pages: Page[]
}

const STATE_KEY = "color-palettes"
const LOCAL_STORAGE_VERSION = 1

export const localStorageHelpers = {
  get: () => {
    const state = localStorage.getItem(STATE_KEY)
    try {
      if (state) {
        const parsedState: LocalStorageState = JSON.parse(state)
        if (parsedState.version === LOCAL_STORAGE_VERSION) {
          return parsedState
        }
      }
      return state ? (JSON.parse(state) as LocalStorageState) : null
    } catch (e) {
      console.log("Error getting persisted state")
    }
    return null
  },
  set: (state: Omit<LocalStorageState, "version">) => {
    localStorage.setItem(
      STATE_KEY,
      JSON.stringify({ ...state, version: LOCAL_STORAGE_VERSION })
    )
  },
}
