import { createSlice } from '@reduxjs/toolkit'

const DEFAULT_DELAY = 3000

interface State {
  message: string;
  delay: number;
  timestamp: number;
  open: boolean;
}

const initialState: State = {
  message: '',
  delay: DEFAULT_DELAY,
  timestamp: Date.now(),
  open: false,
}

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    changeNotificationState: (state, action): void => {
      state.open = action.payload
    },
    showError: (state, action): void => {
      state.open = true
      state.timestamp = Date.now()
      state.message = action.payload
    },
  }
})

export const { actions: { showError, changeNotificationState } } = notificationSlice
