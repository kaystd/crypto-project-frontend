import { createSlice } from '@reduxjs/toolkit'
import { AppDispatch } from '../store'
import { requestPost, RequestType } from '../lib'
import { showNotification } from './notification'
import { LoadingState } from './user'

interface ResultGet {
  result: boolean;
  messageId: string;
}

interface ResultSend {
  successModified: number;
}

interface State {
  loadingGet: LoadingState;
  resultGet?: ResultGet;
  errorGet?: Error;
  loadingSend: LoadingState;
  resultSend?: ResultSend;
  errorSend?: Error;
}

const initialState = {
  loadingGet: LoadingState.Idle,
  loadingSend: LoadingState.Idle
} as State

export const rsaKeySlice = createSlice({
  name: 'rsaKey',
  initialState,
  reducers: {
    loadingGet: (state): void => {
      if(state.loadingGet === LoadingState.Idle) {
        state.resultGet = null
        state.errorGet = null
        state.loadingGet = LoadingState.Pending
      }
    },
    successGet: (state, action): void => {
      if(state.loadingGet === LoadingState.Pending) {
        state.loadingGet = LoadingState.Idle
        state.resultGet = action.payload
      }
    },
    failGet: (state, action): void => {
      if(state.loadingGet === LoadingState.Pending) {
        state.loadingGet = LoadingState.Idle
        state.errorGet = action.payload
      }
    },
    loadingSend: (state): void => {
      if(state.loadingSend === LoadingState.Idle) {
        state.resultSend = null
        state.errorSend = null
        state.loadingSend = LoadingState.Pending
      }
    },
    successSend: (state, action): void => {
      if(state.loadingSend === LoadingState.Pending) {
        state.loadingSend = LoadingState.Idle
        state.resultSend = action.payload
      }
    },
    failSend: (state, action): void => {
      if(state.loadingSend === LoadingState.Pending) {
        state.loadingSend = LoadingState.Idle
        state.errorSend = action.payload
      }
    },
  },
})

export const { actions: { loadingGet, successGet, failGet, loadingSend, successSend, failSend } } = rsaKeySlice

export const getRsaKey = (email: string) => (dispatch: AppDispatch): void => {
  dispatch(loadingGet())

  requestPost<ResultGet>(RequestType.Microservice, 'key/get', { mail: email }).then(
    result => {
      dispatch(showNotification('Ключ успешно отправлен на почту'))
      dispatch(successGet(result))
    },
    error => {
      dispatch(failGet(error))
      dispatch(showNotification('Ошибка при отправке ключа'))
    }
  )
}

export const sendRsaKey = (key: string) => (dispatch: AppDispatch): void => {
  dispatch(loadingSend())

  requestPost<ResultSend>(RequestType.Microservice, 'key/send', { key }).then(
    result => {
      dispatch(showNotification(result.successModified > 0 ? 'Ключ успешно изменен' : 'Новый и старый ключи совпадают'))
      dispatch(successSend(result))
    },
    error => {
      dispatch(failSend(error))
      dispatch(showNotification('Ошибка при смене ключа'))
    }
  )
}
