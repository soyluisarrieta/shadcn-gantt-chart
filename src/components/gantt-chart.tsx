import React from 'react'
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
      <div className={cn('flex flex-1', className)}>
        <GanttSidebar />
        {children}
      </div>
    </GanttContext.Provider>
  )
}

export { GanttChart }
