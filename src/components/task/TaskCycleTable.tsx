import { Table, Tag, Space, Button, Popconfirm, Tooltip, Progress } from "antd";
import {
  DeleteOutlined,
  UserAddOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import type { TaskCycle } from "../../types/task";

interface TaskCycleTableProps {
  cycles: TaskCycle[];
  loading?: boolean;
  onDelete: (cycleId: string) => void;
}

export function TaskCycleTable({
  cycles,
  loading = false,
  onDelete,
}: TaskCycleTableProps) {
  const getStatus = (cycle: TaskCycle) => {
    const now = dayjs();
    const start = dayjs(cycle.periodStart);
    const end = dayjs(cycle.periodEnd);

    if (now.isBefore(start)) {
      return { text: "Sắp diễn ra", color: "blue" };
    } else if (now.isAfter(end)) {
      return { text: "Đã kết thúc", color: "default" };
    } else {
      return { text: "Đang diễn ra", color: "green" };
    }
  };

  const getDaysLeft = (cycle: TaskCycle) => {
    const now = dayjs();
    const end = dayjs(cycle.periodEnd);
    const diff = end.diff(now, "day");
    return diff;
  };

  const getProgress = (cycle: TaskCycle) => {
    if (!cycle.assignments || cycle.assignments.length === 0) return 0;

    const completed = cycle.assignments.filter(
      (a) => a.status === "APPROVED"
    ).length;
    return Math.round((completed / cycle.assignments.length) * 100);
  };

  const columns: ColumnsType<TaskCycle> = [
    {
      title: "Task",
      key: "task",
      width: "25%",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.task?.title}</div>
          <div className="text-gray-500 text-sm">
            {record.task?.department?.name}
          </div>
        </div>
      ),
    },
    {
      title: "Chu kỳ",
      key: "period",
      width: "20%",
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-1 text-sm">
            <CalendarOutlined />
            <span>{dayjs(record.periodStart).format("DD/MM/YYYY")}</span>
            <span>→</span>
            <span>{dayjs(record.periodEnd).format("DD/MM/YYYY")}</span>
          </div>
          <div className="text-gray-500 text-xs mt-1">
            {getDaysLeft(record) > 0
              ? `Còn ${getDaysLeft(record)} ngày`
              : "Đã hết hạn"}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: "12%",
      render: (_, record) => {
        const status = getStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: "Nhân viên",
      key: "employees",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <Tag color="purple">{record.assignments?.length || 0}</Tag>
      ),
    },
    {
      title: "Tiến độ",
      key: "progress",
      width: "18%",
      render: (_, record) => {
        const progress = getProgress(record);
        const completed =
          record.assignments?.filter((a) => a.status === "APPROVED").length ||
          0;
        const total = record.assignments?.length || 0;

        return (
          <div>
            <Progress
              percent={progress}
              size="small"
              status={progress === 100 ? "success" : "active"}
            />
            <div className="text-xs text-gray-500 mt-1">
              {completed}/{total} hoàn thành
            </div>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Xóa chu kỳ?"
            description="Bạn có chắc muốn xóa chu kỳ này?"
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
      dataSource={cycles}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showTotal: (total) => `Tổng ${total} chu kỳ`,
      }}
    />
  );
}
