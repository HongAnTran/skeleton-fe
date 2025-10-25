import { createFileRoute } from "@tanstack/react-router";
import { Tabs } from "antd";
import {
  TaskTemplateTable,
  TaskScheduleTable,
  TaskCycleTable,
  TaskInstanceTable,
  TaskDashboard,
} from "../../../../components/task";
import { TaskStatus } from "../../../../types/task";

export const Route = createFileRoute("/u/_userLayout/_dashboardLayout/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  const tabItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      children: <TaskDashboard />,
    },
    {
      key: "templates",
      label: "Mẫu nhiệm vụ",
      children: <TaskTemplateTable />,
    },
    {
      key: "instances",
      label: "Tất cả nhiệm vụ",
      children: <TaskInstanceTable />,
    },
    {
      key: "schedules",
      label: "Lịch trình",
      children: <TaskScheduleTable />,
    },
    // {
    //   key: "cycles",
    //   label: "Chu kỳ",
    //   children: <TaskCycleTable />,
    // },

    {
      key: "pending-approval",
      label: "Chờ phê duyệt",
      children: <TaskInstanceTable status={TaskStatus.COMPLETED} />,
    },
    {
      key: "approved",
      label: "Đã phê duyệt",
      children: <TaskInstanceTable status={TaskStatus.APPROVED} />,
    },
    {
      key: "rejected",
      label: "Bị từ chối",
      children: <TaskInstanceTable status={TaskStatus.REJECTED} />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Quản lý nhiệm vụ</h1>
      <Tabs defaultActiveKey="dashboard" items={tabItems} />
    </div>
  );
}
