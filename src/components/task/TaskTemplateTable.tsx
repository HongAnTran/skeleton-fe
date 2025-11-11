import { Table, Tag, Space, Button, Popconfirm, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Task } from "../../types/task";
import { getLevelOption } from "../../consts/task";

interface TaskTemplateTableProps {
  tasks: Task[];
  loading?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onCreateCycle: (task: Task) => void;
}

export function TaskTemplateTable({
  tasks,
  loading = false,
  onEdit,
  onDelete,
  onCreateCycle,
}: TaskTemplateTableProps) {
  const columns: ColumnsType<Task> = [
    {
      title: "Tên Task",
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.description && (
            <div className="text-gray-500 text-sm mt-1 line-clamp-2">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: ["department", "name"],
      key: "department",
      width: "15%",
    },
    {
      title: "Loại",
      dataIndex: "isTaskTeam",
      key: "isTaskTeam",
      width: "10%",
      render: (isTaskTeam: boolean) => (
        <Tag color={isTaskTeam ? "blue" : "green"}>
          {isTaskTeam ? "Nhóm" : "Cá nhân"}
        </Tag>
      ),
    },
    {
      title: "Cấp độ nhiệm vụ",
      dataIndex: "level",
      key: "level",
      width: "8%",
      align: "center",
      render: (level: number) => (
        <Tag color={getLevelOption(level)?.color}>
          {getLevelOption(level)?.label}
        </Tag>
      ),
    },
    {
      title: "Bắt buộc",
      dataIndex: "required",
      key: "required",
      width: "8%",
      align: "center",
      render: (required: boolean) =>
        required ? (
          <Tag color="red">Bắt buộc</Tag>
        ) : (
          <Tag color="default">Tùy chọn</Tag>
        ),
    },
    {
      title: "Chu kỳ",
      key: "cycles",
      width: "8%",
      align: "center",
      render: (_, record) => (
        <Tag color="purple">{record.cycles?.length || 0}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: "8%",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Hoạt động" : "Tắt"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "18%",
      render: (_, record) => (
        <Space size="small">
          {/* <Tooltip title="Tạo chu kỳ mới">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onCreateCycle(record)}
            >
              Chu kỳ
            </Button>
          </Tooltip> */}
          <Tooltip title="Chỉnh sửa">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa task?"
            description="Bạn có chắc muốn xóa task này?"
            onConfirm={() => onDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={tasks}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} tasks`,
      }}
    />
  );
}
