import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/news')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/news"!</div>
}
