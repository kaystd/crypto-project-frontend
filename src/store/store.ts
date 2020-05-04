import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { notificationSlice, userSlice } from '../reducers'
import { errorMiddleware } from '../middleware'
import { getRsaKeySlice } from '../reducers/getRsaKey'

const rootReducer = combineReducers({
  user: userSlice.reducer,
  getRsaKey: getRsaKeySlice.reducer,
  notification: notificationSlice.reducer,
})

const middleware = [
  errorMiddleware,
  ...getDefaultMiddleware({
    immutableCheck: false,
    serializableCheck: false,
    thunk: true,
  }),
]

export const store = configureStore({
  reducer: rootReducer,
  middleware,
  devTools: process.env.NODE_ENV !== 'production',
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
