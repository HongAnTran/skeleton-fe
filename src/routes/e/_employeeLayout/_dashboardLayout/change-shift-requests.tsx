import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/e/_employeeLayout/_dashboardLayout/change-shift-requests',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/e/_employeeLayout/_dashboardLayout/change-shift-requests"!
    </div>
  )
}
