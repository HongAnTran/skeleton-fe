import React, { useState } from "react";
import { Table, Button, Space, Tag, Popconfirm, Modal, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import {
  useTaskSchedules,
  useDeleteTaskSchedule,
  useGenerateTaskScheduleCycles,
} from "../../queries/task.queries";
import { TaskScheduleForm } from "./TaskScheduleForm";
import dayjs from "dayjs";
import { TaskFrequency } from "../../types/task";
import type { TaskSchedule } from "../../types/task";
interface TaskScheduleTableProps {
  templateId?: string;
  onViewDetails?: (schedule: TaskSchedule) => void;
}

export const TaskScheduleTable: React.FC<TaskScheduleTableProps> = ({
  templateId,
  onViewDetails,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<
    TaskSchedule | undefined
  >();

  const { data: schedules, isLoading } = useTaskSchedules({ templateId });
  const deleteMutation = useDeleteTaskSchedule();
  const generateCyclesMutation = useGenerateTaskScheduleCycles();

  const handleCreate = () => {
    setEditingSchedule(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: TaskSchedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      message.error("Không thể xóa lịch trình này");
    }
  };

  const handleGenerateCycles = async (id: string) => {
    try {
      await generateCyclesMutation.mutateAsync({ id });
    } catch (error) {
      message.error("Không thể tạo chu kỳ");
    }
  };

  const getFrequencyLabel = (frequency: TaskFrequency) => {
    const labels = {
      [TaskFrequency.NONE]: "Không lặp",
      [TaskFrequency.DAILY]: "Hàng ngày",
      [TaskFrequency.WEEKLY]: "Hàng tuần",
      [TaskFrequency.MONTHLY]: "Hàng tháng",
      [TaskFrequency.QUARTERLY]: "Hàng quý",
      [TaskFrequency.YEARLY]: "Hàng năm",
    };
    return labels[frequency];
  };

  const getFrequencyColor = (frequency: TaskFrequency) => {
    const colors = {
      [TaskFrequency.NONE]: "default",
      [TaskFrequency.DAILY]: "blue",
      [TaskFrequency.WEEKLY]: "green",
      [TaskFrequency.MONTHLY]: "orange",
      [TaskFrequency.QUARTERLY]: "purple",
      [TaskFrequency.YEARLY]: "red",
    };
    return colors[frequency];
  };

  const columns = [
    {
      title: "Mẫu nhiệm vụ",
      dataIndex: "template",
      key: "template",
      render: (template: any) => template?.title || "-",
    },
    {
      title: "Tần suất",
      dataIndex: "frequency",
      key: "frequency",
      render: (frequency: TaskFrequency) => (
        <Tag color={getFrequencyColor(frequency)}>
          {getFrequencyLabel(frequency)}
        </Tag>
      ),
    },
    {
      title: "Khoảng cách",
      dataIndex: "interval",
      key: "interval",
      render: (interval: number) => `Cứ ${interval} lần`,
    },
    {
      title: "Ngày trong tháng",
      dataIndex: "dayOfMonth",
      key: "dayOfMonth",
      render: (dayOfMonth: number) => (dayOfMonth ? `Ngày ${dayOfMonth}` : "-"),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "Không giới hạn",
    },
    {
      title: "Số chu kỳ",
      dataIndex: "_count",
      key: "cycles",
      render: (count: any) => count?.cycles || 0,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: TaskSchedule) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handleGenerateCycles(record.id)}
            loading={generateCyclesMutation.isPending}
          >
            Tạo chu kỳ
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa lịch trình"
            description="Bạn có chắc chắn muốn xóa lịch trình này?"
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
          Tạo lịch trình
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={schedules}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} lịch trình`,
        }}
      />

      <Modal
        title={editingSchedule ? "Chỉnh sửa lịch trình" : "Tạo lịch trình mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <TaskScheduleForm
          schedule={editingSchedule}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingSchedule(undefined);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
};
