import { createSlice } from '@reduxjs/toolkit'
import { AppDispatch } from '../store'
import { requestPost, RequestType } from '../lib'
import { showNotification } from './notification'
import { LoadingState } from './user'

interface Result {
  result: boolean;
  messageId: string;
}

interface State {
  loading: LoadingState;
  result?: Result;
  error?: Error;
}

const initialState = {
  loading: LoadingState.Idle
} as State

export const getRsaKeySlice = createSlice({
  name: 'getRsaKey',
  initialState,
  reducers: {
    loading: (state): void => {
      if(state.loading === LoadingState.Idle) {
        state.result = null
        state.error = null
        state.loading = LoadingState.Pending
      }
    },
    success: (state, action): void => {
      if(state.loading === LoadingState.Pending) {
        state.loading = LoadingState.Idle
        state.result = action.payload
      }
    },
    fail: (state, action): void => {
      if(state.loading === LoadingState.Pending) {
        state.loading = LoadingState.Idle
        state.error = action.payload
      }
    },
  },
})

export const { actions: { loading, success, fail } } = getRsaKeySlice

export const getRsaKey = (email: string) => (dispatch: AppDispatch): void => {
  dispatch(loading())

  requestPost<Result>(RequestType.Microservice, 'key/get', { mail: email }).then(
    result => {
      dispatch(showNotification('Ключ успешно отправлен на почту'))
      dispatch(success(result))
    },
    error => {
      dispatch(fail(error))
      dispatch(showNotification('Ошибка при отправке ключа'))
    }
  )
}
