export const getToken = (): string | null => window.localStorage.getItem('jwt-token')
export const setToken = (token: string): void => window.localStorage.setItem('jwt-token', token)
