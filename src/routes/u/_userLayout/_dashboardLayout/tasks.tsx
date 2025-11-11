import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  Button,
  Modal,
  Tabs,
  Space,
  Select,
  Typography,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import {
  TaskTemplateForm,
  TaskTemplateTable,
  TaskCycleForm,
  TaskApprovalModal,
  PendingApprovalList,
  TaskCycleTable,
} from "../../../../components";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCreateTaskCycle,
  usePendingApprovals,
  useApproveTask,
  useRejectTask,
  useTaskAssignments,
  useCreateTaskCycleAll,
  useTaskCycles,
  useDeleteTaskCycle,
} from "../../../../queries/task.queries";
import { useDepartments } from "../../../../queries/department.queries";
import { TaskStatusV2 } from "../../../../types/task";
import type { Task, TaskAssignment } from "../../../../types/task";
import { LEVEL_OPTIONS_SELECT } from "../../../../consts/task";
import { useFilters } from "../../../../hooks";

const { Title } = Typography;

export const Route = createFileRoute("/u/_userLayout/_dashboardLayout/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  // State for modals
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [cycleFormOpenType, setCycleFormOpenType] = useState<
    "single" | "all" | null
  >(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<TaskAssignment | null>(null);

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

  const { data: pendingApprovals, isLoading: approvalsLoading } =
    usePendingApprovals(filters.department);

  const { data: allAssignments } = useTaskAssignments({
    departmentId: filters.department,
  });
  const { data: cycles, isLoading: cyclesLoading } = useTaskCycles();

  const { data: departments } = useDepartments({ page: 1, limit: 100 });

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const createCycleMutation = useCreateTaskCycle();
  const approveTaskMutation = useApproveTask();
  const rejectTaskMutation = useRejectTask();
  const createCycleAllMutation = useCreateTaskCycleAll();
  const deleteCycleMutation = useDeleteTaskCycle();
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

  // Handlers - Approval
  const handleOpenApproval = (assignment: TaskAssignment) => {
    setSelectedAssignment(assignment);
    setApprovalModalOpen(true);
  };

  const handleApprove = async () => {
    if (selectedAssignment) {
      await approveTaskMutation.mutateAsync(selectedAssignment.id);
      setApprovalModalOpen(false);
      setSelectedAssignment(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (selectedAssignment) {
      await rejectTaskMutation.mutateAsync({
        id: selectedAssignment.id,
        data: { rejectedReason: reason },
      });
      setApprovalModalOpen(false);
      setSelectedAssignment(null);
    }
  };

  const handleCreateCycleAll = () => {
    setCycleFormOpenType("all");
  };

  const handleDeleteCycle = async (cycleId: string) => {
    await deleteCycleMutation.mutateAsync(cycleId);
  };

  // Statistics
  const stats = {
    pending:
      allAssignments?.filter((a) => a.status === TaskStatusV2.PENDING).length ||
      0,
    inProgress:
      allAssignments?.filter((a) => a.status === TaskStatusV2.IN_PROGRESS)
        .length || 0,
    completed:
      allAssignments?.filter((a) => a.status === TaskStatusV2.COMPLETED)
        .length || 0,
    approved:
      allAssignments?.filter((a) => a.status === TaskStatusV2.APPROVED)
        .length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={2} className="!mb-0">
          📋 Quản lý Task
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ bắt đầu"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang thực hiện"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>
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
      </Space>
      {/* Tabs */}
      <Tabs
        activeKey={filters.tab}
        onChange={(key) => setFilter("tab", key)}
        items={[
          {
            key: "tasks",
            label: "📝 Tasks",
            children: (
              <>
                <TaskTemplateTable
                  tasks={tasks || []}
                  loading={tasksLoading}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onCreateCycle={handleCreateCycle}
                />
              </>
            ),
          },
          {
            key: "approvals",
            label: (
              <span>
                ⏳ Chờ duyệt{" "}
                {pendingApprovals && pendingApprovals.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                    {pendingApprovals.length}
                  </span>
                )}
              </span>
            ),
            children: (
              <PendingApprovalList
                assignments={pendingApprovals || []}
                loading={approvalsLoading}
                onApprove={handleOpenApproval}
                onReject={handleOpenApproval}
              />
            ),
          },
          {
            key: "cycles",
            label: "🔄 Chu kỳ",
            children: (
              <TaskCycleTable
                cycles={cycles || []}
                loading={cyclesLoading}
                onDelete={handleDeleteCycle}
              />
            ),
          },
        ]}
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

      <TaskApprovalModal
        assignment={selectedAssignment}
        open={approvalModalOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        onCancel={() => {
          setApprovalModalOpen(false);
          setSelectedAssignment(null);
        }}
        loading={approveTaskMutation.isPending || rejectTaskMutation.isPending}
      />
    </div>
  );
}
