import { GanttChart, GanttContent, GanttSidebar, GanttTimeline, GanttWorkspace } from '@/components/gantt-chart'
import { TASKS } from '@/mocks/tasks'

export default function App () {
  return (
    <main className='container mx-auto py-4'>
      <h1 className='text-4xl font-thin tracking-wider uppercase text-center mb-3'>Shadcn Gantt Chart</h1>
      <GanttChart className="border rounded-lg" data={TASKS}>
        <GanttSidebar width='0vw' />
        <GanttContent>
          <GanttTimeline />
          <GanttWorkspace />
        </GanttContent>
      </GanttChart>
    </main>
  )
}
