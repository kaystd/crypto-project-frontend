import {  MiddlewareAPI, AnyAction } from '@reduxjs/toolkit'
import { ThunkMiddleware } from 'redux-thunk'

import { AppDispatch } from '../store'
import { userLogout } from '../reducers'

export const errorMiddleware: ThunkMiddleware = (api: MiddlewareAPI<AppDispatch>) => (next: AppDispatch) => (action: AnyAction): AnyAction => {
  return action.payload?.message?.includes('403') ? next(userLogout) : next(action)
}
