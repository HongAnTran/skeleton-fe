import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Tag,
  Divider,
  DatePicker,
  Button,
  Space,
  Table,
  Statistic,
  Spin,
  Alert,
  Empty,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { useEmployeeShiftSummary } from "@/queries/employee.queries";
import type { ShiftSignupSummary } from "@/types/employee";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface EmployeeDetailPageProps {
  employeeId: string;
}

export const EmployeeDetailPage = ({ employeeId }: EmployeeDetailPageProps) => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  const {
    data: shiftSummary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useEmployeeShiftSummary(
    employeeId,
    {
      startDate: dateRange[0].toISOString(),
      endDate: dateRange[1].toISOString(),
    },
    {
      enabled: !!employeeId && !!dateRange[0] && !!dateRange[1],
    }
  );

  const employee = shiftSummary?.employee;

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const handleRefresh = () => {
    refetchSummary();
  };

  const columns: TableColumnsType<ShiftSignupSummary> = [
    {
      title: "Ngày",
      dataIndex: ["slot", "date"],
      key: "date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.slot.date).unix() - dayjs(b.slot.date).unix(),
    },
    {
      title: "Ca làm việc",
      dataIndex: ["slot", "type", "name"],
      key: "shiftType",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: ShiftSignupSummary) => {
        const statusConfig = {
          PENDING: { color: "orange", text: "Chờ xác nhận" },
          COMPLETED: { color: "green", text: "Hoàn thành" },
          CANCELLED: { color: "red", text: "Đã hủy" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || {
          color: "default",
          text: status,
        };
        return (
          <Tag color={config.color}>
            {config.text} {status === "CANCELLED" && `(${record.cancelReason})`}
          </Tag>
        );
      },
    },
    {
      title: "Số giờ",
      dataIndex: "totalHours",
      key: "totalHours",
      render: (hours: number) => `${hours}h`,
      sorter: (a, b) => a.totalHours - b.totalHours,
    },
  ];

  if (summaryLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>Đang tải thông tin nhân viên...</div>
      </div>
    );
  }

  if (summaryError) {
    return (
      <Alert
        message="Lỗi"
        description="Không thể tải thông tin nhân viên"
        type="error"
        showIcon
      />
    );
  }

  if (!employee) {
    return (
      <Alert
        message="Không tìm thấy"
        description="Nhân viên không tồn tại"
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Row gutter={[24, 24]} align="middle">
              <Col>
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  src={employee.avatar}
                />
              </Col>
              <Col flex={1}>
                <Title level={2} style={{ margin: 0 }}>
                  {employee.name}
                </Title>
                <Text type="secondary" style={{ fontSize: "16px" }}>
                  {employee.account.email}
                </Text>
                <div style={{ marginTop: "8px" }}>
                  <Space wrap>
                    <Tag color={employee.active ? "green" : "red"}>
                      {employee.active ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                    {employee.branch && (
                      <Tag color="blue">{employee.branch.name}</Tag>
                    )}
                    {employee.department && (
                      <Tag color="purple">{employee.department.name}</Tag>
                    )}
                    {employee.phone && <Tag color="cyan">{employee.phone}</Tag>}
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Shift Summary Controls */}
      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                Tóm tắt ca làm việc
              </Space>
            }
            extra={
              <Space>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={summaryLoading}
                >
                  Làm mới
                </Button>
              </Space>
            }
          >
            {summaryLoading ? (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" />
                <div style={{ marginTop: "16px" }}>
                  Đang tải dữ liệu ca làm việc...
                </div>
              </div>
            ) : summaryError ? (
              <Alert
                message="Lỗi"
                description="Không thể tải dữ liệu ca làm việc"
                type="error"
                showIcon
              />
            ) : shiftSummary ? (
              <>
                {/* Statistics */}
                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Tổng số ca hoàn thành"
                        value={shiftSummary.shiftCountCompleted}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: "green" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Tổng số giờ hoàn thành"
                        value={shiftSummary.totalHoursCompleted}
                        suffix="giờ"
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: "green" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Ca đang đợi"
                        value={shiftSummary.shiftCountPending}
                        valueStyle={{ color: "orange" }}
                        prefix={<CalendarOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Ca đã hủy"
                        value={shiftSummary.shiftCountCancelled}
                        valueStyle={{ color: "red" }}
                        prefix={<CalendarOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>
                <Divider />

                {/* Shifts Table */}
                <div style={{ marginTop: "16px" }}>
                  <Title level={4}>Chi tiết ca làm việc</Title>
                  {shiftSummary.shifts.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={shiftSummary.shifts}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} của ${total} ca`,
                      }}
                      scroll={{ x: 800 }}
                    />
                  ) : (
                    <Empty description="Không có ca làm việc nào trong khoảng thời gian này" />
                  )}
                </div>
              </>
            ) : (
              <Empty description="Chọn khoảng thời gian để xem tóm tắt ca làm việc" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
