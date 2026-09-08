import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export const ease = [0.2, 0, 0, 1] as const

export const WA_LINK = 'https://wa.me/message/Y43UGM4C6LEZA1'

export function waLink(text: string) {
  return `${WA_LINK}?text=${encodeURIComponent(text)}`
}
