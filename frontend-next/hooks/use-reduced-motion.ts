'use client'
import useMediaQuery from './use-media-query'
export default function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
