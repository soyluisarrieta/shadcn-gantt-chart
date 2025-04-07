import React from 'react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface GanttData {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress?: number;
  category?: string;
  icon?: string | React.ComponentType | React.JSX.Element;
}

const GanttContext = React.createContext<{
  data: GanttData[];
  startDate: Date;
} | null>(null)

const useGanttContext = () => {
  const context = React.useContext(GanttContext)
  if (!context) {
    throw new Error('useGanttContext must be used within a GanttProvider')
  }
  return context
}

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

function GanttSidebar ({ width = '16vw' }) {
  const { data } = useGanttContext()

  return (
    <div className="border-r flex-none" style={{ width }}>
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

function GanttTimeline ({
  onDateClick,
  dayWidth = '30px'
}: {
  onDateClick?: (date: Date) => void;
  dayWidth?: string;
}) {
  const { data } = useGanttContext()

  const startDate = data.reduce(
    (earliest, item) => (item.startDate < earliest ? item.startDate : earliest),
    data[0].startDate
  )
  const endDate = data.reduce(
    (latest, item) => (item.endDate > latest ? item.endDate : latest),
    data[0].endDate
  )

  const adjustedStartDate = new Date(startDate)
  adjustedStartDate.setDate(adjustedStartDate.getDate() - 3)

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
              className="w-full flex-none font-medium text-muted-foreground p-2 capitalize"
              style={{ width: monthWidth }}
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
              className={`flex-none text-center py-1 text-muted-foreground ${isCurrentDay ? 'bg-primary/10 text-primary font-bold rounded-full' : ''}`}
              onClick={() => onDateClick?.(date)}
              style={{ width: dayWidth }}
            >
              {dayNumber}
            </div>
          )
        })}
      </div>

      <div className="relative h-full">
        <div
          className="absolute top-0 bottom-0 w-px bg-primary z-10"
          style={{
            left: `${allDates.findIndex(date => isToday(date)) * 30 + 15}px`
          }}
        />
      </div>
    </div>
  )
}

function GanttChart ({
  className,
  children,
  data
}: {
  className?: string;
  children: React.ReactNode;
  data: GanttData[];
}) {
  const startDate = data.reduce(
    (earliest, item) => (item.startDate < earliest ? item.startDate : earliest),
    data[0].startDate
  )

  return (
    <GanttContext.Provider value={{ data, startDate }}>
      <div className={cn('flex flex-1 overflow-hidden', className)}>
        <GanttSidebar />
        <ScrollArea className="w-full">
          <GanttTimeline />
          {children}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </GanttContext.Provider>
  )
}

export { GanttChart }
