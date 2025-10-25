import React, { useState } from "react";
import { Table, Button, Space, Tag, Popconfirm, Modal, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import {
  useTaskCycles,
  useDeleteTaskCycle,
  useGenerateTaskCycleInstances,
} from "../../queries/task.queries";
import { TaskCycleForm } from "./TaskCycleForm";
import type { TaskCycle, TaskStatus } from "../../types/task";
import dayjs from "dayjs";

interface TaskCycleTableProps {
  scheduleId?: string;
  status?: TaskStatus;
  onViewDetails?: (cycle: TaskCycle) => void;
}

export const TaskCycleTable: React.FC<TaskCycleTableProps> = ({
  scheduleId,
  status,
  onViewDetails,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<TaskCycle | undefined>();

  const { data: cycles, isLoading } = useTaskCycles({ scheduleId, status });
  const deleteMutation = useDeleteTaskCycle();
  const generateInstancesMutation = useGenerateTaskCycleInstances();

  const handleCreate = () => {
    setEditingCycle(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (cycle: TaskCycle) => {
    setEditingCycle(cycle);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      message.error("Không thể xóa chu kỳ này");
    }
  };

  const handleGenerateInstances = async (id: string) => {
    try {
      await generateInstancesMutation.mutateAsync(id);
    } catch (error) {
      message.error("Không thể tạo nhiệm vụ");
    }
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

  const columns = [
    {
      title: "Mẫu nhiệm vụ",
      dataIndex: "schedule",
      key: "template",
      render: (schedule: any) => schedule?.template?.title || "-",
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "periodStart",
      key: "periodStart",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "periodEnd",
      key: "periodEnd",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
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
      title: "Số nhiệm vụ",
      dataIndex: "_count",
      key: "instances",
      render: (count: any) => count?.instances || 0,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: TaskCycle) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handleGenerateInstances(record.id)}
            loading={generateInstancesMutation.isPending}
          >
            Tạo nhiệm vụ
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa chu kỳ"
            description="Bạn có chắc chắn muốn xóa chu kỳ này?"
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
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo chu kỳ
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={cycles}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} chu kỳ`,
        }}
      />

      <Modal
        title={editingCycle ? "Chỉnh sửa chu kỳ" : "Tạo chu kỳ mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <TaskCycleForm
          cycle={editingCycle}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingCycle(undefined);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
};
