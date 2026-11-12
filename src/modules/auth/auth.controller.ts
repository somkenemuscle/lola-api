import type { RequestHandler } from 'express'
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from './auth.cookies.js'
import type { LoginInput, SignupInput } from './auth.schemas.js'
import * as authService from './auth.service.js'

export const signup: RequestHandler = async (req, res) => {
  const { user, tokens } = await authService.signup(req.body as SignupInput)
  setAuthCookies(res, tokens)
  res.status(201).json({ user })
}

export const login: RequestHandler = async (req, res) => {
  const { user, tokens } = await authService.login(req.body as LoginInput)
  setAuthCookies(res, tokens)
  res.json({ user })
}

// A failed refresh deliberately leaves cookies alone: another tab may have just set fresh ones.
export const refresh: RequestHandler = async (req, res) => {
  const { user, tokens } = await authService.refresh(req.cookies[REFRESH_COOKIE])
  setAuthCookies(res, tokens)
  res.json({ user })
}

export const logout: RequestHandler = async (req, res) => {
  await authService.logout(req.cookies[REFRESH_COOKIE])
  clearAuthCookies(res)
  res.status(204).end()
}

export const me: RequestHandler = async (req, res) => {
  const user = await authService.getMe(req.auth!.userId)
  res.json({ user })
}
