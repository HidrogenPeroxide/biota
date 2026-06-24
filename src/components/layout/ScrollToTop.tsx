import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Reset scroll position on route change for a clean documentary feel. */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}
