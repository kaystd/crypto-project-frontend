import { createSlice } from '@reduxjs/toolkit'

import { requestGet, requestLogin, requestPost, RequestType, setToken } from '../lib'
import { AppDispatch } from '../store'
import { showNotification } from './notification'

export enum LoadingState {
  Idle = 'Idle',
  Pending = 'Pending',
  Finish = 'Finish',
}

export interface User {
  login: string;
  userData: string;
  keyGost: string;
}

export interface RegUser extends User {
  password: string;
}


interface State {
  loggingIn: LoadingState;
  fetchingUser: LoadingState;
  signingUpUser: LoadingState;
  signedUpUser?: User;
  signUpError?: Error;
  user?: User;
  error?: Error;
  isAuthenticated: boolean;
}

const initialState = {
  loggingIn: LoadingState.Idle,
  fetchingUser: LoadingState.Idle,
  signingUpUser: LoadingState.Idle,
  isAuthenticated: false,
} as State

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    startLoggingIn: (state): void => {
      if ([LoadingState.Idle, LoadingState.Finish].includes(state.loggingIn)) {
        state.loggingIn = LoadingState.Pending
        state.error = undefined
      }
    },
    startFetchingUser: (state): void => {
      if ([LoadingState.Idle, LoadingState.Finish].includes(state.fetchingUser)) {
        state.user = undefined
        state.error = undefined
        state.fetchingUser = LoadingState.Pending
      }
    },
    finishLoading: (state): void => {
      if (state.fetchingUser === LoadingState.Pending) {
        state.fetchingUser = LoadingState.Finish
      }
    },
    userReceived: (state, action): void => {
      if (state.fetchingUser === LoadingState.Pending) {
        state.fetchingUser = LoadingState.Finish
        state.user = action.payload
        state.isAuthenticated = true
      }
    },
    userError: ((state, action): void => {
      if (state.fetchingUser === LoadingState.Pending || state.loggingIn === LoadingState.Pending) {
        state.loggingIn = LoadingState.Finish
        state.fetchingUser = LoadingState.Finish
        state.error = action.payload
      }
    }),
    userLogout: (state): void => {
      state.user = null
      state.fetchingUser = LoadingState.Finish
      state.isAuthenticated = false
    },
    startSigningUp: (state): void => {
      if (state.signingUpUser === LoadingState.Idle) {
        state.signedUpUser = null
        state.signUpError = null
        state.signingUpUser = LoadingState.Pending
      }
    },
    successSigningUp: (state, action): void => {
      if (state.signingUpUser === LoadingState.Pending) {
        state.signingUpUser = LoadingState.Idle
        state.signedUpUser = action.payload
      }
    },
    failSigningUp: (state, action): void => {
      if (state.signingUpUser === LoadingState.Pending) {
        state.signingUpUser = LoadingState.Idle
        state.signUpError = action.payload
      }
    },
  },
})

export const {
  actions: {
    startFetchingUser,
    startLoggingIn,
    userReceived,
    userError,
    userLogout,
    startSigningUp,
    successSigningUp,
    failSigningUp,
  },
} = userSlice

export const fetchUser = () => (dispatch: AppDispatch): void => {
  dispatch(startFetchingUser())

  requestGet<User>(RequestType.Api, 'user').then(
    user => dispatch(userReceived(user)),
    error => dispatch(userError(error))
  )
}

export const login = ({ login, password }: { login: string; password: string }) => (dispatch: AppDispatch): void => {
  dispatch(startLoggingIn())

  requestLogin<string>({ login, password })
    .then(token => setToken(token))
    .then(
      _ => dispatch(fetchUser()),
      error => dispatch(userError(error))
    )
}

export const signUpUser = (user: RegUser) => (dispatch: AppDispatch): Promise<User> => {
  dispatch(startSigningUp())

  return requestPost<User>(RequestType.Api, 'register', user).then(
    user => {
      dispatch(showNotification('Регистрация прошла успешно'))
      dispatch(successSigningUp(user))

      return user
    },
    error => {
      dispatch(showNotification('Ошибка при регистрации'))
      dispatch(failSigningUp(error))

      return Promise.reject(error)
    }
  )
}
