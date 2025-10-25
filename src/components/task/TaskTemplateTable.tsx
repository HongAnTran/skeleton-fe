import React, { useState } from "react";
import { Table, Button, Space, Tag, Popconfirm, Modal, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useTaskTemplates,
  useDeleteTaskTemplate,
  useToggleTaskTemplateActive,
} from "../../queries/task.queries";
import { TaskTemplateForm } from "./TaskTemplateForm";
import type { TaskTemplate } from "../../types/task";
import { TaskScope, TaskAggregation } from "../../types/task";

interface TaskTemplateTableProps {
  scope?: TaskScope;
  onViewDetails?: (template: TaskTemplate) => void;
}

export const TaskTemplateTable: React.FC<TaskTemplateTableProps> = ({
  scope,
  onViewDetails,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<
    TaskTemplate | undefined
  >();
  const [selectedTemplate, setSelectedTemplate] = useState<
    TaskTemplate | undefined
  >();

  const { data: templates, isLoading } = useTaskTemplates({ scope });
  const deleteMutation = useDeleteTaskTemplate();
  const toggleActiveMutation = useToggleTaskTemplateActive();

  const handleCreate = () => {
    setEditingTemplate(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      message.error("Không thể xóa mẫu nhiệm vụ này");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleActiveMutation.mutateAsync(id);
    } catch (error) {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const handleViewDetails = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    onViewDetails?.(template);
  };

  const getScopeLabel = (scope: TaskScope) => {
    return scope === TaskScope.INDIVIDUAL ? "Cá nhân" : "Phòng ban";
  };

  const getAggregationLabel = (aggregation: TaskAggregation) => {
    const labels = {
      [TaskAggregation.COUNT]: "Đếm",
      [TaskAggregation.SUM]: "Tổng",
      [TaskAggregation.AVERAGE]: "Trung bình",
      [TaskAggregation.MAX]: "Tối đa",
      [TaskAggregation.MIN]: "Tối thiểu",
    };
    return labels[aggregation];
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: TaskTemplate) => (
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
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      render: (unit: string) => unit || "-",
    },
    {
      title: "Mục tiêu",
      dataIndex: "defaultTarget",
      key: "defaultTarget",
      render: (target: number) => target || "-",
    },
    {
      title: "Tính toán",
      dataIndex: "aggregation",
      key: "aggregation",
      render: (aggregation: TaskAggregation) =>
        getAggregationLabel(aggregation),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "_count",
      key: "instances",
      render: (count: any) => count?.instances || 0,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: TaskTemplate) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            onClick={() => handleToggleActive(record.id)}
            loading={toggleActiveMutation.isPending}
          >
            {record.isActive ? "Tạm dừng" : "Kích hoạt"}
          </Button>
          <Popconfirm
            title="Xóa mẫu nhiệm vụ"
            description="Bạn có chắc chắn muốn xóa mẫu nhiệm vụ này?"
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
          Tạo mẫu nhiệm vụ
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={templates}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} mẫu nhiệm vụ`,
        }}
      />

      <Modal
        title={
          editingTemplate ? "Chỉnh sửa mẫu nhiệm vụ" : "Tạo mẫu nhiệm vụ mới"
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <TaskTemplateForm
          template={editingTemplate}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingTemplate(undefined);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
};
