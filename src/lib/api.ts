import { getToken } from './jwt'

const API_ROOT = 'http://127.0.0.1:8080'
const MICROSERVICE_ROOT = 'http://127.0.0.1:8081'

export enum RequestType {
  Api = 'Api',
  Microservice = 'Microservice',
}

const makeAPIURL = (type: RequestType, path: string): string => {
  const root = type === RequestType.Api ? API_ROOT : MICROSERVICE_ROOT
  return `${root}/${path}`
}

const addHandlers = <T>(promise: Promise<Response>, responseType = 'json'): Promise<T> =>
  promise.then(response => {
    if (response.status === 200) {
      const resp = responseType === 'json'
        ? response.json()
        : response.text()
      return Promise.resolve(resp)
    } else {
      const err = new Error(`Server error: ${response.status}`)
      return Promise.reject(err)
    }
  })

export const requestPost = <T>(type: RequestType, path: string, body = {}): Promise<T> => {
  const url = makeAPIURL(type, path)
  const token = type === RequestType.Api ? `Bearer ${getToken()}` : getToken()

  return addHandlers<T>(fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    }
  })).catch((ex: Error) => Promise.reject(ex))
}

export const requestGet = <T>(type: RequestType, path: string): Promise<T> => {
  const url = makeAPIURL(type, path)
  return addHandlers<T>(fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    }
  })).catch((ex: Error) => Promise.reject(ex))
}

export const requestLogin = <T>(credentials: { login: string; password: string }): Promise<T> => {
  const url = makeAPIURL(RequestType.Api, 'login')
  return addHandlers<T>(fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${window.btoa(credentials.login + ':' + credentials.password)}`,
    }
  })).catch((ex: Error) => Promise.reject(ex))
}
