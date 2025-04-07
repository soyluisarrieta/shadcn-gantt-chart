import React from 'react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface GanttData {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress?: number;
  color?: { background: string; text: string };
  icon?: string | React.ComponentType | React.JSX.Element;
}

// Global context
const GanttContext = React.createContext<{
  data: GanttData[];
  startDate: Date;
  sidebar: {
    width: string;
    [key: string]: any;
  };
  setSidebar: (sidebar: { width: string; [key: string]: any }) => void;
    } | null>(null)

// Custom hook context
const useGanttContext = () => {
  const context = React.useContext(GanttContext)
  if (!context) {
    throw new Error('useGanttContext must be used within a GanttProvider')
  }

  const setSidebarWidth = React.useCallback((width: string) => {
    context.setSidebar({ ...context.sidebar, width })
  }, [context])

  return {
    data: context.data,
    startDate: context.startDate,
    sidebar: context.sidebar,
    setSidebarWidth
  }
}

// Helper function to get all months in a date range
const getMonthsInRange = (startDate: Date, endDate: Date): string[] => {
  const months: string[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const monthName = currentDate.toLocaleString('default', { month: 'long' })
    if (!months.includes(monthName)) {
      months.push(monthName)
    }
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return months
}

// Sidebar component
function GanttSidebar ({ width = '16vw' }) {
  const { data, sidebar, setSidebarWidth } = useGanttContext()

  React.useEffect(() => {
    if (sidebar.width === width) return
    setSidebarWidth(width)
  }, [setSidebarWidth, sidebar, width])

  return (
    <div className="border-r flex-none overflow-hidden" style={{ width }}>
      <div className="h-8 flex items-center font-medium m-2">Lista de Tareas</div>

      <div className="mt-8 border-t p-2">
        {data.map(({ icon: Icon, ...item }) => (
          <div key={item.id} className="h-8 flex items-center text-sm mb-2">
            {Icon && (
              <span className="mr-2">
                {typeof Icon === 'function' ? <Icon /> : Icon}
              </span>
            )}
            {item.name}
          </div>
        ))}
      </div>
    </div>
  )
}

// Timeline component
function GanttTimeline ({
  onDateClick,
  dayWidth = '2rem'
}: {
  onDateClick?: (date: Date) => void;
  dayWidth?: string;
}) {
  const { data } = useGanttContext()

  const startDate = data.reduce((earliest, data) =>
    data.startDate < earliest ? data.startDate : earliest, data[0].startDate)
  const calculatedEndDate = data.reduce((latest, data) =>
    data.endDate > latest ? data.endDate : latest, data[0].endDate)

  const endDate = new Date(calculatedEndDate)
  endDate.setDate(endDate.getDate() + 30)

  const adjustedStartDate = new Date(startDate)
  adjustedStartDate.setDate(adjustedStartDate.getDate() - 50)

  const months = getMonthsInRange(adjustedStartDate, endDate)

  const allDates: Date[] = []
  const currentDate = new Date(adjustedStartDate)
  while (currentDate <= endDate) {
    allDates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const datesByMonth: Record<string, Date[]> = {}
  months.forEach(month => {
    datesByMonth[month] = allDates.filter(date =>
      date.toLocaleString('default', { month: 'long' }) === month
    )
  })

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  return (
    <div className="timeline w-full">
      <div className="flex">
        {months.map((month, index) => {
          const daysInMonth = datesByMonth[month].length
          const monthWidth = `calc(${daysInMonth} * ${dayWidth})`

          return (
            <div
              key={`month-${index}`}
              className="w-full flex-none text-muted-foreground/80 px-2 pt-4 pb-1 capitalize"
              style={{ width: monthWidth, fontSize: '0.95rem' }}
            >
              <span className='sticky left-2'>{month}</span>
            </div>
          )
        })}
      </div>

      <div className="flex border-b">
        {allDates.map((date, index) => {
          const dayNumber = date.getDate()
          const isCurrentDay = isToday(date)

          return (
            <div
              key={`day-${index}`}
              className={`flex-none text-center py-1 font-medium text-muted-foreground/40 text-sm ${isCurrentDay ? 'bg-primary/10 text-primary font-bold rounded-full' : ''}`}
              onClick={() => onDateClick?.(date)}
              style={{ width: dayWidth }}
            >
              {dayNumber}
            </div>
          )
        })}
      </div>

      <div className="relative h-full">
        <div className="absolute top-0 bottom-0 w-px bg-primary z-10" style={{
          left: `${allDates.findIndex(date => isToday(date)) * 30 + 15}px`
        }}></div>
      </div>
    </div>
  )
}

// Item bar component
function GanttItemBar ({
  data,
  dayWidth = '2rem'
}: {
  data: GanttData;
  dayWidth?: string;
}) {
  const { startDate } = useGanttContext()
  const adjustedStartDate = new Date(startDate)
  adjustedStartDate.setDate(adjustedStartDate.getDate() - 50)
  const daysFromStart = Math.floor((data.startDate.getTime() - adjustedStartDate.getTime()) / (1000 * 60 * 60 * 24))
  const duration = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24))

  const leftPosition = `calc(${daysFromStart} * ${dayWidth})`
  const width = `calc(${duration} * ${dayWidth})`
  const Icon = data?.icon

  return (
    <div className="h-10 relative mb-2">
      <div
        className="absolute h-8 rounded-md flex items-center px-2 text-sm text-background bg-foreground overflow-hidden"
        style={{
          left: leftPosition,
          width: width,
          backgroundColor: data.color?.background,
          color: data.color?.text
        }}
      >
        <div
          className="absolute top-0 left-0 h-full bg-white/20"
          style={{ width: `${data.progress ?? 0}%` }}
        />

        <div className="flex items-center gap-1 z-10 whitespace-nowrap">
          {Icon && (
            <span>
              {typeof Icon === 'function' ? <Icon /> : Icon}
            </span>
          )}
          <span className="font-medium">{data.name}</span>
        </div>
      </div>
    </div>
  )
}

// Workspace component
function GanttWorkspace () {
  const { data } = useGanttContext()
  return (
    <div className="relative mt-8">
      {data.map(item => (
        <GanttItemBar key={item.id} data={item} />
      ))}
    </div>
  )
}

// Content component
function GanttContent ({
  children,
  dayWidth = '2rem'
}: {
  children: React.ReactNode;
  dayWidth?: string;
}) {
  const { sidebar, data } = useGanttContext()
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollAreaRef.current && data.length > 0) {
      const firstItem = data[0]
      const adjustedStartDate = new Date(firstItem.startDate)
      adjustedStartDate.setDate(adjustedStartDate.getDate() - 50)
      const daysFromStart = Math.floor((firstItem.startDate.getTime() - adjustedStartDate.getTime()) / (1000 * 60 * 60 * 24))

      const dayWidthValue = parseFloat(dayWidth) * 16
      const scrollPosition = daysFromStart * dayWidthValue

      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollLeft = scrollPosition - 20
      }
    }
  }, [data, dayWidth])

  return (
    <ScrollArea ref={scrollAreaRef} type='always' style={{ width: `calc(100% - ${sidebar.width})` }}>
      {children}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

// Main Gantt chart component
function GanttChart ({
  className,
  data,
  children
}:{
  className?: string;
  data: GanttData[];
  children: React.ReactNode;
}) {
  const startDate = data.reduce((earliest, item) =>
    item.startDate < earliest ? item.startDate : earliest, data[0].startDate)

  const [sidebar, setSidebar] = React.useState({ width: '16vw' })

  const contextValue = {
    data,
    startDate,
    sidebar,
    setSidebar
  }

  return (
    <GanttContext.Provider value={contextValue}>
      <div className={cn('flex flex-1 overflow-hidden', className)}>
        {children}
      </div>
    </GanttContext.Provider>
  )
}

export {
  GanttChart,
  GanttSidebar,
  GanttContent,
  GanttTimeline,
  GanttWorkspace,
  GanttItemBar
}
