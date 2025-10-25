import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Modal,
  Progress,
  message,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  useTaskInstances,
  useDeleteTaskInstance,
  useCompleteTask,
} from "../../queries/task.queries";
import { TaskInstanceForm } from "./TaskInstanceForm";
import { TaskProgressModal } from "./TaskProgressModal";
import { TaskApprovalModal } from "./TaskApprovalModal";
import type { TaskInstance } from "../../types/task";
import { TaskStatus, TaskScope } from "../../types/task";
import dayjs from "dayjs";

interface TaskInstanceTableProps {
  cycleId?: string;
  employeeId?: string;
  departmentId?: string;
  status?: TaskStatus;
  onViewDetails?: (instance: TaskInstance) => void;
}

export const TaskInstanceTable: React.FC<TaskInstanceTableProps> = ({
  cycleId,
  employeeId,
  departmentId,
  status,
  onViewDetails,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<
    TaskInstance | undefined
  >();
  const [selectedInstance, setSelectedInstance] = useState<
    TaskInstance | undefined
  >();

  const { data: instances, isLoading } = useTaskInstances({
    cycleId,
    employeeId,
    departmentId,
    status,
  });

  const deleteMutation = useDeleteTaskInstance();
  const completeMutation = useCompleteTask();

  const handleCreate = () => {
    setEditingInstance(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (instance: TaskInstance) => {
    setEditingInstance(instance);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      message.error("Không thể xóa nhiệm vụ này");
    }
  };

  const handleUpdateProgress = (instance: TaskInstance) => {
    setSelectedInstance(instance);
    setIsProgressModalOpen(true);
  };

  const handleComplete = async (id: string) => {
    try {
      await completeMutation.mutateAsync({
        id,
        data: { 
          completedBy: "current-user", // TODO: Get from auth context
          note: "Đã hoàn thành nhiệm vụ" 
        },
      });
    } catch (error) {
      message.error("Không thể hoàn thành nhiệm vụ");
    }
  };

  const handleApprove = (instance: TaskInstance) => {
    setSelectedInstance(instance);
    setIsApprovalModalOpen(true);
  };

  const handleReject = (instance: TaskInstance) => {
    setSelectedInstance(instance);
    setIsApprovalModalOpen(true);
  };

  const handleViewDetails = (instance: TaskInstance) => {
    setSelectedInstance(instance);
    onViewDetails?.(instance);
  };

  const getStatusLabel = (status: TaskStatus) => {
    const labels = {
      [TaskStatus.PENDING]: "Chờ thực hiện",
      [TaskStatus.IN_PROGRESS]: "Đang thực hiện",
      [TaskStatus.COMPLETED]: "Đã hoàn thành",
      [TaskStatus.APPROVED]: "Đã phê duyệt",
      [TaskStatus.REJECTED]: "Bị từ chối",
      [TaskStatus.EXPIRED]: "Hết hạn",
    };
    return labels[status];
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      [TaskStatus.PENDING]: "default",
      [TaskStatus.IN_PROGRESS]: "processing",
      [TaskStatus.COMPLETED]: "success",
      [TaskStatus.APPROVED]: "success",
      [TaskStatus.REJECTED]: "error",
      [TaskStatus.EXPIRED]: "warning",
    };
    return colors[status];
  };

  const getScopeLabel = (scope: TaskScope) => {
    return scope === TaskScope.INDIVIDUAL ? "Cá nhân" : "Phòng ban";
  };

  const getProgressPercentage = (current: number, target: number) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: TaskInstance) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Phạm vi",
      dataIndex: "scope",
      key: "scope",
      render: (scope: TaskScope) => (
        <Tag color={scope === TaskScope.INDIVIDUAL ? "blue" : "green"}>
          {getScopeLabel(scope)}
        </Tag>
      ),
    },
    {
      title: "Người thực hiện",
      key: "assignee",
      render: (_: any, record: TaskInstance) => {
        if (record.employee) {
          return record.employee.name;
        }
        if (record.department) {
          return record.department.name;
        }
        return "-";
      },
    },
    {
      title: "Tiến độ",
      key: "progress",
      render: (_: any, record: TaskInstance) => {
        const percentage = getProgressPercentage(
          record.quantity,
          record.target || 0
        );
        return (
          <div>
            <Progress
              percent={Math.round(percentage)}
              size="small"
              status={percentage >= 100 ? "success" : "active"}
            />
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.quantity} / {record.target || 0} {record.unit}
            </div>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: TaskStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: TaskInstance) => {
        const canUpdateProgress = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.REJECTED].includes(record.status);
        const canComplete = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.REJECTED].includes(record.status);
        const canApprove = record.status === TaskStatus.COMPLETED;
        const canReject = record.status === TaskStatus.COMPLETED;

        return (
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            >
              Xem
            </Button>
            
            {/* Employee Actions */}
            {canUpdateProgress && (
              <Tooltip title="Cập nhật tiến độ">
                <Button
                  type="link"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleUpdateProgress(record)}
                >
                  Cập nhật
                </Button>
              </Tooltip>
            )}
            
            {canComplete && (
              <Tooltip title="Đánh dấu hoàn thành">
                <Button
                  type="link"
                  icon={<CheckOutlined />}
                  onClick={() => handleComplete(record.id)}
                  loading={completeMutation.isPending}
                >
                  Hoàn thành
                </Button>
              </Tooltip>
            )}

            {/* Manager Actions */}
            {canApprove && (
              <Tooltip title="Phê duyệt nhiệm vụ">
                <Button
                  type="link"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record)}
                  style={{ color: '#52c41a' }}
                >
                  Phê duyệt
                </Button>
              </Tooltip>
            )}
            
            {canReject && (
              <Tooltip title="Từ chối nhiệm vụ">
                <Button
                  type="link"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record)}
                >
                  Từ chối
                </Button>
              </Tooltip>
            )}

            {/* Status-specific actions */}
            {record.status === TaskStatus.REJECTED && (
              <Tooltip title="Nhiệm vụ bị từ chối - cần xử lý">
                <Tag color="red" icon={<ClockCircleOutlined />}>
                  Cần sửa
                </Tag>
              </Tooltip>
            )}

            {record.status === TaskStatus.COMPLETED && (
              <Tooltip title="Đang chờ phê duyệt">
                <Tag color="orange" icon={<ClockCircleOutlined />}>
                  Chờ duyệt
                </Tag>
              </Tooltip>
            )}

            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Sửa
            </Button>
            
            <Popconfirm
              title="Xóa nhiệm vụ"
              description="Bạn có chắc chắn muốn xóa nhiệm vụ này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              >
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo nhiệm vụ
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={instances}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} nhiệm vụ`,
        }}
      />

      <Modal
        title={editingInstance ? "Chỉnh sửa nhiệm vụ" : "Tạo nhiệm vụ mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <TaskInstanceForm
          instance={editingInstance}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingInstance(undefined);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Progress Modal */}
      {selectedInstance && (
        <TaskProgressModal
          instance={selectedInstance}
          open={isProgressModalOpen}
          onClose={() => {
            setIsProgressModalOpen(false);
            setSelectedInstance(undefined);
          }}
          onSuccess={() => {
            setIsProgressModalOpen(false);
            setSelectedInstance(undefined);
          }}
        />
      )}

      {/* Approval Modal */}
      {selectedInstance && (
        <TaskApprovalModal
          instance={selectedInstance}
          open={isApprovalModalOpen}
          onClose={() => {
            setIsApprovalModalOpen(false);
            setSelectedInstance(undefined);
          }}
          onSuccess={() => {
            setIsApprovalModalOpen(false);
            setSelectedInstance(undefined);
          }}
        />
      )}
    </>
  );
};
