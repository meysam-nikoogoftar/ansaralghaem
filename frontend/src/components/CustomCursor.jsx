import { useEffect, useRef } from 'react'

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, ' +
  '.gallery-item, .promo-card, .news-card, .stat-card, .feature, ' +
  '.count-box, .detail-item, .gallery-tab'

function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const ringPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (window.innerWidth <= 900) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      dot.style.left = e.clientX + 'px'
      dot.style.top = e.clientY + 'px'
    }
    document.addEventListener('mousemove', onMove)

    let animId
    const animate = () => {
      ringPosRef.current.x += (mouseRef.current.x - ringPosRef.current.x) * 0.35
      ringPosRef.current.y += (mouseRef.current.y - ringPosRef.current.y) * 0.35
      ring.style.left = ringPosRef.current.x + 'px'
      ring.style.top = ringPosRef.current.y + 'px'
      animId = requestAnimationFrame(animate)
    }
    animate()

    // Event delegation so it keeps working even when page content changes
    // (React re-renders, route changes, new list items, etc.)
    const onOver = (e) => {
      if (e.target.closest?.(INTERACTIVE_SELECTOR)) ring.classList.add('hover')
    }
    const onOut = (e) => {
      const stillInside = e.relatedTarget?.closest?.(INTERACTIVE_SELECTOR)
      if (!stillInside) ring.classList.remove('hover')
    }
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  )
}

export default CustomCursor