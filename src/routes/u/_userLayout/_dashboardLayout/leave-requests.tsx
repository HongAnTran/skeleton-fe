import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Modal,
  Popconfirm,
  message,
  Tooltip,
  Divider,
  Select,
  DatePicker,
  Input,
} from "antd";
import type { TableProps, TableColumnsType } from "antd";
import {
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  FilterOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useAllLeaveRequests,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
  useDeleteLeaveRequest,
} from "../../../../queries/leaveRequest.queries";
import { RejectLeaveRequestModal } from "../../../../components";
import type {
  LeaveRequest,
  RejectLeaveRequestDto,
  LeaveRequestStatus,
  QueryLeaveRequestDto,
} from "../../../../types/leaveRequest";
import dayjs, { type Dayjs } from "dayjs";
import { useEmployees } from "../../../../queries/employee.queries";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

interface LeaveRequestDetailModalProps {
  open: boolean;
  onCancel: () => void;
  leaveRequest: LeaveRequest | null;
}

function LeaveRequestDetailModal({
  open,
  onCancel,
  leaveRequest,
}: LeaveRequestDetailModalProps) {
  if (!leaveRequest) return null;

  return (
    <Modal
      title="Chi tiết đơn xin nghỉ"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={700}
    >
      <Divider />
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Text type="secondary">Nhân viên:</Text>
          <br />
          <Text strong>{leaveRequest.employee?.name || "N/A"}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary">Phòng ban:</Text>
          <br />
          <Text>{leaveRequest.employee?.department?.name || "N/A"}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary">Chi nhánh:</Text>
          <br />
          <Text>{leaveRequest.employee?.branch?.name || "N/A"}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary">Trạng thái:</Text>
          <br />
          {getStatusTag(leaveRequest.status)}
        </Col>
        <Col span={12}>
          <Text type="secondary">Ngày bắt đầu:</Text>
          <br />
          <Text>{dayjs(leaveRequest.startDate).format("DD/MM/YYYY")}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary">Ngày kết thúc:</Text>
          <br />
          <Text>{dayjs(leaveRequest.endDate).format("DD/MM/YYYY")}</Text>
        </Col>
        <Col span={24}>
          <Text type="secondary">Số ngày nghỉ:</Text>
          <br />
          <Text>
            {dayjs(leaveRequest.endDate).diff(
              dayjs(leaveRequest.startDate),
              "day"
            ) + 1}{" "}
            ngày
          </Text>
        </Col>
        <Col span={24}>
          <Text type="secondary">Lý do nghỉ:</Text>
          <br />
          <Text>{leaveRequest.reason || "-"}</Text>
        </Col>
        {leaveRequest.status === "APPROVED" && leaveRequest.approvedAt && (
          <>
            <Col span={12}>
              <Text type="secondary">Ngày duyệt:</Text>
              <br />
              <Text>
                {dayjs(leaveRequest.approvedAt).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">Người duyệt:</Text>
              <br />
              <Text>{leaveRequest.approvedBy || "N/A"}</Text>
            </Col>
          </>
        )}
        {leaveRequest.status === "REJECTED" && leaveRequest.rejectedAt && (
          <>
            <Col span={12}>
              <Text type="secondary">Ngày từ chối:</Text>
              <br />
              <Text>
                {dayjs(leaveRequest.rejectedAt).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">Người từ chối:</Text>
              <br />
              <Text>{leaveRequest.rejectedBy || "N/A"}</Text>
            </Col>
            <Col span={24}>
              <Text type="secondary">Lý do từ chối:</Text>
              <br />
              <Text type="danger">{leaveRequest.rejectedReason || "-"}</Text>
            </Col>
          </>
        )}
        <Col span={12}>
          <Text type="secondary">Ngày tạo:</Text>
          <br />
          <Text>
            {dayjs(leaveRequest.createdAt).format("DD/MM/YYYY HH:mm")}
          </Text>
        </Col>
        <Col span={12}>
          <Text type="secondary">Ngày cập nhật:</Text>
          <br />
          <Text>
            {dayjs(leaveRequest.updatedAt).format("DD/MM/YYYY HH:mm")}
          </Text>
        </Col>
      </Row>
    </Modal>
  );
}

function getStatusTag(status: LeaveRequestStatus) {
  switch (status) {
    case "PENDING":
      return <Tag color="orange">Đang chờ</Tag>;
    case "APPROVED":
      return <Tag color="green">Đã duyệt</Tag>;
    case "REJECTED":
      return <Tag color="red">Đã từ chối</Tag>;
    case "CANCELLED":
      return <Tag color="default">Đã hủy</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
}

export const Route = createFileRoute(
  "/u/_userLayout/_dashboardLayout/leave-requests"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<
    string | undefined
  >();
  const [selectedStatus, setSelectedStatus] = useState<
    LeaveRequestStatus | undefined
  >();
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingLeaveRequest, setRejectingLeaveRequest] =
    useState<LeaveRequest | null>(null);
  const [viewingLeaveRequest, setViewingLeaveRequest] =
    useState<LeaveRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const approveLeaveRequestMutation = useApproveLeaveRequest();
  const rejectLeaveRequestMutation = useRejectLeaveRequest();
  const deleteLeaveRequestMutation = useDeleteLeaveRequest();

  // Build query params
  const queryParams: QueryLeaveRequestDto = {
    page: currentPage,
    limit: pageSize,
    employeeId: selectedEmployeeId,
    status: selectedStatus,
    startDateFrom: dateRange?.[0]
      ? dateRange[0].startOf("day").toISOString()
      : undefined,
    endDateTo: dateRange?.[1]
      ? dateRange[1].endOf("day").toISOString()
      : undefined,
  };

  // Fetch leave requests
  const {
    data: leaveRequestsData,
    isLoading,
    error,
    refetch,
  } = useAllLeaveRequests(queryParams);

  // Fetch employees for filter
  const { data: employeesData } = useEmployees({
    page: 1,
    limit: 1000,
  });

  // Filter by search term (client-side for employee name search)
  const filteredLeaveRequests =
    leaveRequestsData?.data?.filter((leaveRequest: LeaveRequest) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        leaveRequest.employee?.name?.toLowerCase().includes(searchLower) ||
        leaveRequest.employee?.user?.name
          ?.toLowerCase()
          .includes(searchLower) ||
        leaveRequest.reason?.toLowerCase().includes(searchLower)
      );
    }) || [];

  const handleTableChange: TableProps<LeaveRequest>["onChange"] = (
    pagination
  ) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleApprove = async (id: string) => {
    try {
      await approveLeaveRequestMutation.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleReject = (leaveRequest: LeaveRequest) => {
    setRejectingLeaveRequest(leaveRequest);
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (data: RejectLeaveRequestDto) => {
    if (!rejectingLeaveRequest) return;
    try {
      await rejectLeaveRequestMutation.mutateAsync({
        id: rejectingLeaveRequest.id,
        data,
      });
      setIsRejectModalOpen(false);
      setRejectingLeaveRequest(null);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLeaveRequestMutation.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleViewDetail = (leaveRequest: LeaveRequest) => {
    setViewingLeaveRequest(leaveRequest);
    setIsDetailModalOpen(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleClearFilters = () => {
    setSelectedEmployeeId(undefined);
    setSelectedStatus(undefined);
    setDateRange(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const canApprove = (leaveRequest: LeaveRequest) => {
    return leaveRequest.status === "PENDING";
  };

  const canReject = (leaveRequest: LeaveRequest) => {
    return leaveRequest.status === "PENDING";
  };

  const canDelete = (leaveRequest: LeaveRequest) => {
    return (
      leaveRequest.status === "PENDING" || leaveRequest.status === "CANCELLED"
    );
  };

  const columns: TableColumnsType<LeaveRequest> = [
    {
      title: "Nhân viên",
      key: "employee",
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.employee?.name || "N/A"}</div>
          {record.employee?.department && (
            <Text type="secondary" className="text-xs">
              {record.employee.department.name}
            </Text>
          )}
          {record.employee?.branch && (
            <Text type="secondary" className="text-xs block">
              {record.employee.branch.name}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Khoảng thời gian",
      key: "dateRange",
      width: 180,
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {dayjs(record.startDate).format("DD/MM/YYYY")}
          </div>
          <Text type="secondary" className="text-xs">
            đến {dayjs(record.endDate).format("DD/MM/YYYY")}
          </Text>
          <div className="text-xs text-gray-400 mt-1">
            {dayjs(record.endDate).diff(dayjs(record.startDate), "day") + 1}{" "}
            ngày
          </div>
        </div>
      ),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      width: 200,
      render: (reason: string) => (
        <Text ellipsis={{ tooltip: reason }} className="max-w-[150px]">
          {reason || "-"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: LeaveRequestStatus) => getStatusTag(status),
      filters: [
        { text: "Đang chờ", value: "PENDING" },
        { text: "Đã duyệt", value: "APPROVED" },
        { text: "Đã từ chối", value: "REJECTED" },
        { text: "Đã hủy", value: "CANCELLED" },
      ],
      filteredValue: selectedStatus ? [selectedStatus] : null,
    },
    {
      title: "Thông tin duyệt/từ chối",
      key: "approvalInfo",
      width: 200,
      render: (_, record) => {
        if (record.status === "APPROVED" && record.approvedAt) {
          return (
            <div>
              <Text type="success" className="text-xs">
                Đã duyệt
              </Text>
              <br />
              <Text type="secondary" className="text-xs">
                {dayjs(record.approvedAt).format("DD/MM/YYYY HH:mm")}
              </Text>
            </div>
          );
        }
        if (record.status === "REJECTED" && record.rejectedAt) {
          return (
            <div>
              <Text type="danger" className="text-xs">
                Đã từ chối
              </Text>
              <br />
              <Text type="secondary" className="text-xs">
                {dayjs(record.rejectedAt).format("DD/MM/YYYY HH:mm")}
              </Text>
              {record.rejectedReason && (
                <div className="mt-1">
                  <Text type="secondary" className="text-xs" ellipsis>
                    {record.rejectedReason}
                  </Text>
                </div>
              )}
            </div>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => (
        <Text type="secondary">{dayjs(date).format("DD/MM/YYYY HH:mm")}</Text>
      ),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              size="small"
            />
          </Tooltip>
          {canApprove(record) && (
            <Tooltip title="Duyệt">
              <Popconfirm
                title="Duyệt đơn xin nghỉ"
                description="Bạn có chắc chắn muốn duyệt đơn xin nghỉ này?"
                onConfirm={() => handleApprove(record.id)}
                okText="Duyệt"
                cancelText="Hủy"
                okButtonProps={{ type: "primary" }}
              >
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  style={{ color: "#52c41a" }}
                />
              </Popconfirm>
            </Tooltip>
          )}
          {canReject(record) && (
            <Tooltip title="Từ chối">
              <Button
                type="text"
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
                danger
                size="small"
              />
            </Tooltip>
          )}
          {canDelete(record) && (
            <Tooltip title="Xóa">
              <Popconfirm
                title="Xóa đơn xin nghỉ"
                description="Bạn có chắc chắn muốn xóa đơn xin nghỉ này?"
                onConfirm={() => handleDelete(record.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  size="small"
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (error) {
    message.error("Không thể tải danh sách đơn xin nghỉ");
  }

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title level={3} className="mb-0">
              Quản lý đơn xin nghỉ
            </Title>
            <Text type="secondary">
              Tổng số: {leaveRequestsData?.meta?.total || 0} đơn
            </Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Filters Section */}
        <Card
          size="small"
          className="mb-4"
          title={
            <>
              <FilterOutlined /> Bộ lọc
            </>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Search
                placeholder="Tìm kiếm tên nhân viên, lý do..."
                allowClear
                enterButton={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={setSearchTerm}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Select
                placeholder="Chọn nhân viên"
                allowClear
                style={{ width: "100%" }}
                value={selectedEmployeeId}
                onChange={setSelectedEmployeeId}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option: any) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {employeesData?.data?.map((employee: any) => (
                  <Select.Option key={employee.id} value={employee.id}>
                    {employee.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Select
                placeholder="Trạng thái"
                allowClear
                style={{ width: "100%" }}
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <Select.Option value="PENDING">Đang chờ</Select.Option>
                <Select.Option value="APPROVED">Đã duyệt</Select.Option>
                <Select.Option value="REJECTED">Đã từ chối</Select.Option>
                <Select.Option value="CANCELLED">Đã hủy</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                value={dateRange}
                onChange={(dates) =>
                  setDateRange(dates ? [dates[0], dates[1]] : null)
                }
              />
            </Col>
            <Col xs={24} sm={24}>
              <Button onClick={handleClearFilters} block>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>

        <Table<LeaveRequest>
          columns={columns}
          dataSource={filteredLeaveRequests}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: leaveRequestsData?.meta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1400 }}
          size="middle"
          bordered
        />

        {/* Reject Modal */}
        <RejectLeaveRequestModal
          open={isRejectModalOpen}
          leaveRequest={rejectingLeaveRequest}
          onCancel={() => {
            setIsRejectModalOpen(false);
            setRejectingLeaveRequest(null);
          }}
          onSubmit={handleRejectSubmit}
          loading={rejectLeaveRequestMutation.isPending}
        />

        {/* Detail Modal */}
        <LeaveRequestDetailModal
          open={isDetailModalOpen}
          onCancel={() => {
            setIsDetailModalOpen(false);
            setViewingLeaveRequest(null);
          }}
          leaveRequest={viewingLeaveRequest}
        />
      </Card>
    </div>
  );
}
