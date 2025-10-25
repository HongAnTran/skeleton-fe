import { createFileRoute } from "@tanstack/react-router";
import { Tabs } from "antd";
import { TaskInstanceTable } from "../../../../components/task";
import { TaskStatus } from "../../../../types/task";

export const Route = createFileRoute(
  "/e/_employeeLayout/_dashboardLayout/tasks"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const tabItems = [
    {
      key: "pending",
      label: "Chờ thực hiện",
      children: <TaskInstanceTable status={TaskStatus.PENDING} />,
    },
    {
      key: "in-progress",
      label: "Đang thực hiện",
      children: <TaskInstanceTable status={TaskStatus.IN_PROGRESS} />,
    },
    {
      key: "completed",
      label: "Chờ phê duyệt",
      children: <TaskInstanceTable status={TaskStatus.COMPLETED} />,
    },
    {
      key: "rejected",
      label: "Bị từ chối",
      children: <TaskInstanceTable status={TaskStatus.REJECTED} />,
    },
    {
      key: "approved",
      label: "Đã phê duyệt",
      children: <TaskInstanceTable status={TaskStatus.APPROVED} />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Nhiệm vụ của tôi</h1>
      <Tabs defaultActiveKey="pending" items={tabItems} />
    </div>
  );
}
