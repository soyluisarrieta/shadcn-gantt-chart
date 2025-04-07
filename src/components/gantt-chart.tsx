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

function GanttChart ({
  className,
  children,
  data
}:{
  className?: string;
  children: React.ReactNode;
  data: GanttData[];
}) {
  const startDate = data.reduce((earliest, item) =>
    item.startDate < earliest ? item.startDate : earliest, data[0].startDate)

  return (
    <GanttContext.Provider value={{ data, startDate }}>
      <div className={cn('flex flex-1', className)}>
        {children}
      </div>
    </GanttContext.Provider>
  )
}

export {
  GanttChart
}
