import { useState } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Tag,
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useShiftSignups,
  useCancelShiftSignup,
} from "../queries/shiftSignup.queries";
import { ShiftSignupStatus, type ShiftSignup } from "../types/shiftSignup";
import type { ColumnsType } from "antd/es/table";
import { ShiftSignupCancelModal } from "./ShiftSignupCancelModal";
import { useEmployeeAuth } from "../contexts/AuthEmployeeContext";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export function EmployeeShiftSignupTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<[string, string]>();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedSignup, setSelectedSignup] = useState<ShiftSignup | null>(
    null
  );
  const [cancelReason, setCancelReason] = useState("");
  const { employee } = useEmployeeAuth();
  const { data, isLoading } = useShiftSignups({
    page: currentPage,
    limit: pageSize,
    startDate: dateRange?.[0],
    endDate: dateRange?.[1],
  });

  const cancelShiftSignupMutation = useCancelShiftSignup();

  const handleCancel = (signup: ShiftSignup) => {
    setSelectedSignup(signup);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedSignup || !cancelReason.trim()) return;

    try {
      await cancelShiftSignupMutation.mutateAsync({
        id: selectedSignup.id,
        data: { cancelReason: cancelReason.trim() },
      });
      setIsCancelModalOpen(false);
      setSelectedSignup(null);
      setCancelReason("");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([
        dates[0].format("YYYY-MM-DD"),
        dates[1].format("YYYY-MM-DD"),
      ]);
    } else {
      setDateRange(undefined);
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDateRange(undefined);
    setCurrentPage(1);
  };

  const columns: ColumnsType<ShiftSignup> = [
    {
      title: "Ngày",
      key: "date",
      render: (_, record) => {
        const date = record.slot?.date;
        return date ? (
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-blue-500" />
            <Tag color="blue">{dayjs(date).format("DD/MM/YYYY")}</Tag>
          </div>
        ) : (
          "N/A"
        );
      },
      sorter: (a, b) => dayjs(a.slot?.date).unix() - dayjs(b.slot?.date).unix(),
    },
    {
      title: "Loại ca",
      key: "shiftType",
      render: (_, record) => (
        <div>
          <Text strong>{record.slot?.type?.name || "N/A"}</Text>
          <div className="flex items-center gap-1 mt-1">
            <ClockCircleOutlined className="text-gray-500" />
            <Text type="secondary" className="text-sm">
              {record.slot?.type?.startDate
                ? `${dayjs(record.slot.type.startDate).format("HH:mm")} - ${dayjs(record.slot.type.endDate).format("HH:mm")}`
                : "N/A"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Chi nhánh",
      key: "branch",
      render: (_, record) => (
        <Tag color="green">{record.slot?.branch?.name || "N/A"}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        if (record.status === ShiftSignupStatus.CANCELLED) {
          return (
            <div>
              <Tag color="red">Đã hủy</Tag>
              <Tag color="red">
                {record.canceledBy === employee?.id
                  ? "Bạn hủy"
                  : "Hủy bởi Admin"}
              </Tag>
            </div>
          );
        }

        if (record.status === ShiftSignupStatus.COMPLETED) {
          return <Tag color="default">Đã hoàn thành</Tag>;
        }

        return <Tag color="green">Đang hoạt động</Tag>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => (
        <Text ellipsis={{ tooltip: notes }} className="max-w-[150px]">
          {notes || "-"}
        </Text>
      ),
    },
    {
      title: "Lý do hủy",
      dataIndex: "cancelReason",
      key: "cancelReason",
      render: (cancelReason: string, record) => {
        if (record.status !== ShiftSignupStatus.CANCELLED) return "-";
        return (
          <Text ellipsis={{ tooltip: cancelReason }} className="max-w-[150px]">
            {cancelReason || "-"}
          </Text>
        );
      },
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <Text type="secondary">{dayjs(date).format("DD/MM/YYYY HH:mm")}</Text>
      ),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => {
        // Only show cancel button if not canceled and shift is in the future
        const canCancel =
          record.status !== ShiftSignupStatus.CANCELLED &&
          dayjs(record.slot?.date).isAfter(dayjs(), "day");

        if (!canCancel) return null;

        return (
          <Space>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleCancel(record)}
              title="Hủy đăng ký"
              size="small"
            >
              Hủy
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <Title level={4} className="m-0">
          Ca Làm Việc Đã Đăng Ký
        </Title>
      </div>

      {/* Filters */}
      <Card size="small" className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={10}>
            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
              onChange={handleDateRangeChange}
              className="w-full"
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button onClick={handleClearFilters} className="w-full">
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={data?.data}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.meta?.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} mục`,
          onChange: setCurrentPage,
          onShowSizeChange: (_, size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        scroll={{ x: 1000 }}
      />

      <ShiftSignupCancelModal
        open={isCancelModalOpen}
        signup={selectedSignup}
        cancelReason={cancelReason}
        onCancelReasonChange={setCancelReason}
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setSelectedSignup(null);
          setCancelReason("");
        }}
        confirmLoading={cancelShiftSignupMutation.isPending}
      />
    </Card>
  );
}
