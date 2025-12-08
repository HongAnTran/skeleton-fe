import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Modal, Space, Select, Typography } from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  TaskTemplateForm,
  TaskTemplateTable,
  TaskCycleForm,
} from "@/components";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCreateTaskCycle,
  useCreateTaskCycleAll,
} from "@/queries/task.queries";
import { useDepartments } from "@/queries/department.queries";
import type { Task } from "@/types/task";
import { LEVEL_OPTIONS_SELECT } from "@/consts/task";
import { useFilters } from "@/hooks";

const { Title } = Typography;

export const Route = createFileRoute("/u/_userLayout/_dashboardLayout/tasks/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  // State for modals
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [cycleFormOpenType, setCycleFormOpenType] = useState<
    "single" | "all" | null
  >(null);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filters with URL search params
  const { filters, setFilter, clearAllFilters, hasActiveFilters } = useFilters({
    department: { type: "string" },
    level: { type: "number" },
    tab: { type: "string", defaultValue: "tasks" },
  });

  // Queries
  const { data: tasks, isLoading: tasksLoading } = useTasks({
    departmentId: filters.department,
    level: filters.level,
  });

  const { data: departments } = useDepartments({ page: 1, limit: 100 });

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const createCycleMutation = useCreateTaskCycle();

  const createCycleAllMutation = useCreateTaskCycleAll();
  // Handlers - Task
  const handleCreateTask = () => {
    setSelectedTask(null);
    setTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskFormOpen(true);
  };

  const handleTaskSubmit = async (values: any) => {
    if (selectedTask) {
      await updateTaskMutation.mutateAsync({
        id: selectedTask.id,
        data: values,
      });
    } else {
      await createTaskMutation.mutateAsync(values);
    }
    setTaskFormOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTaskMutation.mutateAsync(taskId);
  };

  // Handlers - Cycle
  const handleCreateCycle = (task: Task) => {
    setSelectedTask(task);
    setCycleFormOpenType("single");
  };

  const handleCycleSubmit = async (values: any) => {
    if (cycleFormOpenType === "single") {
      await createCycleMutation.mutateAsync(values);
    } else {
      await createCycleAllMutation.mutateAsync(values);
    }
    setCycleFormOpenType(null);
    setSelectedTask(null);
  };

  const handleCreateCycleAll = () => {
    setCycleFormOpenType("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={2} className="!mb-0">
          📋 Quản lý Task
        </Title>
      </div>

      <Space wrap>
        <Select
          placeholder="Lọc theo cấp độ nhiệm vụ"
          style={{ width: 200 }}
          allowClear
          value={filters.level}
          onChange={(value) => setFilter("level", value)}
        >
          {LEVEL_OPTIONS_SELECT.map((level) => (
            <Select.Option key={level.value} value={level.value}>
              {level.label}
            </Select.Option>
          ))}
        </Select>
        <Select
          placeholder="Lọc theo phòng ban"
          style={{ width: 200 }}
          allowClear
          value={filters.department}
          onChange={(value) => setFilter("department", value)}
        >
          {departments?.data.map((dept) => (
            <Select.Option key={dept.id} value={dept.id}>
              {dept.name}
            </Select.Option>
          ))}
        </Select>
        {hasActiveFilters && (
          <Button onClick={clearAllFilters}>Xóa bộ lọc</Button>
        )}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateTask}
          size="large"
        >
          Tạo nhiệm vụ mới
        </Button>

        <Button
          type="default"
          icon={<PlusOutlined />}
          onClick={handleCreateCycleAll}
          size="large"
        >
          Tạo nhanh nhiệm vụ tháng mới
        </Button>

        <Button
          type="default"
          size="large"
          onClick={() => navigate({ to: "/u/tasks/pending-approvel" })}
          icon={<EyeOutlined />}
        >
          Chờ phê duyệt
        </Button>
      </Space>
      <TaskTemplateTable
        tasks={tasks || []}
        loading={tasksLoading}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onCreateCycle={handleCreateCycle}
      />

      {/* Modals */}
      <Modal
        title={selectedTask ? "Chỉnh sửa nhiệm vụ" : "Tạo Nhiệm Vụ Mới"}
        open={taskFormOpen}
        onCancel={() => {
          setTaskFormOpen(false);
          setSelectedTask(null);
        }}
        footer={null}
        width={600}
      >
        <TaskTemplateForm
          task={selectedTask}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setTaskFormOpen(false);
            setSelectedTask(null);
          }}
          loading={createTaskMutation.isPending || updateTaskMutation.isPending}
        />
      </Modal>

      <Modal
        title="Tạo Chu Kỳ Mới"
        open={cycleFormOpenType !== null}
        onCancel={() => {
          setCycleFormOpenType(null);
          setSelectedTask(null);
        }}
        footer={null}
      >
        <TaskCycleForm
          task={selectedTask}
          type={cycleFormOpenType ?? undefined}
          onSubmit={handleCycleSubmit}
          onCancel={() => {
            setCycleFormOpenType(null);
            setSelectedTask(null);
          }}
          loading={createCycleMutation.isPending}
        />
      </Modal>
    </div>
  );
}
