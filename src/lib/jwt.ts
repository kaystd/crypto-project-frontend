const item = 'jwt-token'

export const getToken = (): string | null => window.localStorage.getItem(item)
export const setToken = (token: string): void => window.localStorage.setItem(item, token)
export const deleteToken = (): void => window.localStorage.removeItem(item)
