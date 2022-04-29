import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import thunk from "redux-thunk"
import { userSlice } from "./slices/user"
import storage from "redux-persist/lib/storage" // defaults to localStorage for web

const rootReducer = combineReducers({
  user: userSlice.reducer,
})

const persistedRootReducer = persistReducer(
  { key: "root", storage },
  rootReducer
)

export const store = configureStore({
  reducer: persistedRootReducer,
  middleware: [thunk],
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
