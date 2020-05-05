import { createSlice } from '@reduxjs/toolkit'

import { deleteToken, requestGet, requestLogin, requestPost, RequestType, setToken } from '../lib'
import { AppDispatch } from '../store'
import { showNotification } from './notification'
import { Simulate } from 'react-dom/test-utils'
import error = Simulate.error

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
  fetchingUsers: LoadingState;
  signingUpUser: LoadingState;
  signedUpUser?: User;
  signUpError?: Error;
  user?: User;
  users: User[];
  userError?: Error;
  usersError?: Error;
  isAuthenticated: boolean;
}

const initialState = {
  loggingIn: LoadingState.Idle,
  fetchingUser: LoadingState.Idle,
  fetchingUsers: LoadingState.Idle,
  signingUpUser: LoadingState.Idle,
  users: [],
  isAuthenticated: false,
} as State

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    startLoggingIn: (state): void => {
      if ([LoadingState.Idle, LoadingState.Finish].includes(state.loggingIn)) {
        state.loggingIn = LoadingState.Pending
        state.userError = undefined
      }
    },
    startFetchingUser: (state): void => {
      if ([LoadingState.Idle, LoadingState.Finish].includes(state.fetchingUser)) {
        state.user = undefined
        state.userError = undefined
        state.fetchingUser = LoadingState.Pending
      }
    },
    userReceived: (state, action): void => {
      if (state.fetchingUser === LoadingState.Pending) {
        state.loggingIn = LoadingState.Finish
        state.fetchingUser = LoadingState.Finish
        state.user = action.payload
        state.isAuthenticated = true
      }
    },
    userError: ((state, action): void => {
      if (state.fetchingUser === LoadingState.Pending || state.loggingIn === LoadingState.Pending) {
        state.loggingIn = LoadingState.Finish
        state.fetchingUser = LoadingState.Finish
        state.userError = action.payload
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
    startFetchingUsers: (state): void => {
      if (state.fetchingUsers === LoadingState.Idle) {
        state.users = []
        state.usersError = null
        state.fetchingUsers = LoadingState.Pending
      }
    },
    successFetchingUsers: (state, action): void => {
      if (state.fetchingUsers === LoadingState.Pending) {
        state.fetchingUsers = LoadingState.Idle
        state.users = action.payload
      }
    },
    failFetchingUsers: (state, action): void => {
      if (state.fetchingUsers === LoadingState.Pending) {
        state.fetchingUsers = LoadingState.Idle
        state.usersError = action.payload
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
    startFetchingUsers,
    successFetchingUsers,
    failFetchingUsers,
  },
} = userSlice

export const fetchUser = () => (dispatch: AppDispatch): void => {
  dispatch(startFetchingUser())

  requestGet<User>(RequestType.Api, 'user').then(
    user => dispatch(userReceived(user)),
    error => dispatch(userError(error))
  )
}

export const fetchUsers = () => (dispatch: AppDispatch): void => {
  dispatch(startFetchingUsers())

  requestGet<User[]>(RequestType.Api, 'users').then(
    users => dispatch(successFetchingUsers(users)),
    error => dispatch(failFetchingUsers(error)),
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

export const logout = () => (dispatch: AppDispatch) => {
  deleteToken()
  dispatch(userLogout())
}
