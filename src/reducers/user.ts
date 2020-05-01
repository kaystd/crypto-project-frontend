import { createSlice, AnyAction } from '@reduxjs/toolkit'

import { requestGet, requestLogin, RequestType, setToken } from '../lib'
import { AppDispatch } from '../store'
import { showError } from './notification'

enum LoadingState {
  Idle = 'Idle',
  Pending = 'Pending',
}

interface User {
  login: string;
  userData: string;
  keyGost: string;
}

interface State {
  loading: LoadingState;
  user?: User;
  error?: Error;
  isAuthenticated: boolean;
}

const initialState = {
  loading: LoadingState.Idle,
  isAuthenticated: false,
} as State

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loggingIn: (state): void => {
      if (state.loading === LoadingState.Idle) {
        state.loading = LoadingState.Pending
      }
    },
    userFetching: (state): void => {
      if (state.loading === LoadingState.Idle) {
        state.user = undefined
        state.error = undefined
        state.loading = LoadingState.Pending
      }
    },
    userReceived: (state, action): void => {
      if (state.loading === LoadingState.Pending) {
        state.loading = LoadingState.Idle
        state.user = action.payload
        state.isAuthenticated = true
      }
    },
    userError: ((state, action): void => {
      if (state.loading === LoadingState.Pending) {
        state.loading = LoadingState.Idle
        state.error = action.payload
      }
    }),
    userLogout: (state): void => {
      state.user = null
      state.isAuthenticated = false
    }
  },
})

export const { actions: { loggingIn, userFetching, userReceived, userError, userLogout } } = userSlice

export const fetchUser = () => (dispatch: AppDispatch): void => {
  dispatch(userFetching())

  requestGet<User>(RequestType.Api, 'user').then(
    user => {
      dispatch(userReceived(user))
    },
    _ => {
      dispatch(showError('Ошибка сети'))
    })
}

export const login = ({ login, password }: { login: string; password: string }) => (dispatch: AppDispatch): void => {
  dispatch(loggingIn())

  requestLogin<string>({ login, password }).then(
    token => {
      setToken(token)
    })
    .then(
      _ => dispatch(fetchUser()),
      error => dispatch(userError(error))
    )
}
