import { createFileRoute } from '@tanstack/react-router'
import AnalyticsDashboard from '../components/dashboard/analytics/AnalyticsDashboard'

export const Route = createFileRoute('/analytics')({
  head: () => ({
    meta: [
      { title: 'Analytics — IUCB' },
      { name: 'description', content: 'Analytics dashboard and reports' },
    ],
  }),
  component: AnalyticsDashboard,
})
