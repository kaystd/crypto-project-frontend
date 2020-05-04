import {  MiddlewareAPI, AnyAction } from '@reduxjs/toolkit'
import { ThunkMiddleware } from 'redux-thunk'

import { AppDispatch } from '../store'
import { userLogout, showNotification } from '../reducers'

export const errorMiddleware: ThunkMiddleware = (api: MiddlewareAPI<AppDispatch>) => (next: AppDispatch) => (action: AnyAction): AnyAction => {
  if (action.payload?.message?.includes('403')) {
    return next(userLogout())
  } else if (action.payload?.message?.includes('Failed to fetch')) {
    next(showNotification('Ошибка сети'))
  }

  return next(action)
}
