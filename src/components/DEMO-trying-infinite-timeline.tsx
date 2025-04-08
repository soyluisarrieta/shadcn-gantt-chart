import React from 'react'
const ONE_DAY = 24 * 60 * 60 * 1000
const ITEM_WIDTH = 110

const generateDates = (startDate, count, direction = 'forward') => {
  const dates = Array.from({ length: count }, (_, i) =>
    new Date(
      direction === 'forward'
        ? startDate.getTime() + i * ONE_DAY
        : startDate.getTime() - i * ONE_DAY
    )
  )
  return direction === 'forward' ? dates : dates.reverse()
}

export const TryingInfiniteTimeline = () => {
  const [dates, setDates] = React.useState([])
  const scrollRef = React.useRef(null)

  const isDragging = React.useRef(false)
  const startX = React.useRef(0)
  const scrollLeftStart = React.useRef(0)

  // Inicializa fechas (10 antes + 10 después)
  React.useEffect(() => {
    const today = new Date()
    const before = generateDates(new Date(today.getTime() - 10 * ONE_DAY), 10)
    const after = generateDates(today, 10)
    setDates([...before, ...after])
  }, [])

  const syncDragAfterPrepend = (addedCount, currentX) => {
    const el = scrollRef.current
    if (el) {
      el.scrollLeft += addedCount * ITEM_WIDTH
      scrollLeftStart.current = el.scrollLeft
      startX.current = currentX
    }
  }

  const handleScrollEdges = React.useCallback((currentX) => {
    const el = scrollRef.current
    if (!el) return

    const { scrollLeft, scrollWidth, clientWidth } = el

    if (scrollLeft + clientWidth >= scrollWidth - 50) {
      const last = dates[dates.length - 1]
      const more = generateDates(new Date(last.getTime() + ONE_DAY), 5)
      setDates(prev => [...prev, ...more])
    }

    if (scrollLeft < 50) {
      const first = dates[0]
      const more = generateDates(new Date(first.getTime() - 5 * ONE_DAY), 5, 'backward')
      setDates(prev => [...more, ...prev])

      requestAnimationFrame(() => syncDragAfterPrepend(5, currentX))
    }
  }, [dates])

  const handlePointerDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX || e.touches?.[0].pageX
    scrollLeftStart.current = scrollRef.current.scrollLeft
  }

  const handlePointerMove = (e) => {
    if (!isDragging.current) return

    const currentX = e.pageX || e.touches?.[0].pageX
    const delta = startX.current - currentX
    const el = scrollRef.current
    if (el) {
      el.scrollLeft = scrollLeftStart.current + delta
      handleScrollEdges(currentX)
    }
  }

  const endDrag = () => {
    isDragging.current = false
  }

  return (
    <div
      ref={scrollRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={endDrag}
      style={{
        overflow: 'hidden',
        display: 'flex',
        whiteSpace: 'nowrap',
        border: '1px solid #ddd',
        padding: '10px',
        cursor: isDragging.current ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
    >
      {dates.map((date, i) => (
        <div
          key={i}
          style={{
            minWidth: '100px',
            textAlign: 'center',
            padding: '10px',
            margin: '0 5px',
            border: '1px solid #ccc'
          }}
        >
          {date.toLocaleDateString()}
        </div>
      ))}
    </div>
  )
}
