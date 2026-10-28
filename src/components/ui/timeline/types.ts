/** Each status maps to its --component-timeline-* token family. Pending steps use disabled. */
export type TimelineStatus = 'active' | 'success' | 'disabled'

export interface TimelineItem {
  id: string
  title: string
  description?: string
  status: TimelineStatus
}
