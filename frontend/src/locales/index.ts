import { ru } from './ru'
import { en } from './en'
import { uz } from './uz'

export const locales = {
  ru,
  en,
  uz,
}

export type Locale = keyof typeof locales

export { ru, en, uz }

