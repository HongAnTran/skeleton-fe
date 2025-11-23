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
  message,
  Tooltip,
  Divider,
} from "antd";
import type { TableProps, TableColumnsType } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  useMyLeaveRequests,
  useCreateLeaveRequest,
  useUpdateLeaveRequest,
  useCancelLeaveRequest,
} from "../../../../queries/leaveRequest.queries";
import {
  LeaveRequestForm,
  CancelLeaveRequestModal,
} from "../../../../components";
import type {
  LeaveRequest,
  CreateLeaveRequestDto,
  CancelLeaveRequestDto,
  LeaveRequestStatus,
} from "../../../../types/leaveRequest";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface LeaveRequestModalProps {
  open: boolean;
  onCancel: () => void;
  leaveRequest: LeaveRequest | null;
  onSuccess: () => void;
}

function LeaveRequestModal({
  open,
  onCancel,
  leaveRequest,
  onSuccess,
}: LeaveRequestModalProps) {
  const createLeaveRequestMutation = useCreateLeaveRequest();
  const updateLeaveRequestMutation = useUpdateLeaveRequest();

  const isEditing = !!leaveRequest;
  const isLoading =
    createLeaveRequestMutation.isPending ||
    updateLeaveRequestMutation.isPending;

  const handleSubmit = async (data: CreateLeaveRequestDto) => {
    try {
      if (isEditing && leaveRequest) {
        await updateLeaveRequestMutation.mutateAsync({
          id: leaveRequest.id,
          data,
        });
      } else {
        await createLeaveRequestMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          {isEditing ? "Cập nhật đơn xin nghỉ" : "Tạo đơn xin nghỉ mới"}
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnHidden
    >
      <Divider />
      <LeaveRequestForm
        leaveRequest={leaveRequest}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        loading={isLoading}
      />
    </Modal>
  );
}

export const Route = createFileRoute(
  "/e/_employeeLayout/_dashboardLayout/leave-requests"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [editingLeaveRequest, setEditingLeaveRequest] =
    useState<LeaveRequest | null>(null);
  const [cancellingLeaveRequest, setCancellingLeaveRequest] =
    useState<LeaveRequest | null>(null);

  const cancelLeaveRequestMutation = useCancelLeaveRequest();

  // Fetch leave requests
  const {
    data: leaveRequestsData,
    isLoading,
    error,
    refetch,
  } = useMyLeaveRequests({
    page: currentPage,
    limit: pageSize,
  });

  const handleTableChange: TableProps<LeaveRequest>["onChange"] = (
    pagination
  ) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleCreate = () => {
    setEditingLeaveRequest(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (leaveRequest: LeaveRequest) => {
    setEditingLeaveRequest(leaveRequest);
    setIsCreateModalOpen(true);
  };

  const handleCancel = (leaveRequest: LeaveRequest) => {
    setCancellingLeaveRequest(leaveRequest);
    setIsCancelModalOpen(true);
  };

  const handleCancelSubmit = async (data: CancelLeaveRequestDto) => {
    if (!cancellingLeaveRequest) return;
    try {
      await cancelLeaveRequestMutation.mutateAsync({
        id: cancellingLeaveRequest.id,
        data,
      });
      setIsCancelModalOpen(false);
      setCancellingLeaveRequest(null);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleModalSuccess = () => {
    setIsCreateModalOpen(false);
    setEditingLeaveRequest(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getStatusTag = (status: LeaveRequestStatus) => {
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
  };

  const canEdit = (leaveRequest: LeaveRequest) => {
    return leaveRequest.status === "PENDING";
  };

  const canCancel = (leaveRequest: LeaveRequest) => {
    return (
      leaveRequest.status === "PENDING" &&
      dayjs(leaveRequest.startDate).isAfter(dayjs().startOf("day"))
    );
  };

  const columns: TableColumnsType<LeaveRequest> = [
    {
      title: "Khoảng thời gian",
      key: "dateRange",
      width: 200,
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
      width: 250,
      render: (reason: string) => (
        <Text ellipsis={{ tooltip: reason }} className="max-w-[200px]">
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
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {canEdit(record) && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                size="small"
              />
            </Tooltip>
          )}
          {canCancel(record) && (
            <Tooltip title="Hủy đơn">
              <Button
                type="text"
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancel(record)}
                danger
                size="small"
              />
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
              Đơn xin nghỉ của tôi
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Tạo đơn xin nghỉ
              </Button>
            </Space>
          </Col>
        </Row>

        <Table<LeaveRequest>
          columns={columns}
          dataSource={leaveRequestsData?.data || []}
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
          scroll={{ x: 1200 }}
          size="middle"
          bordered
        />

        {/* Create/Edit Modal */}
        <LeaveRequestModal
          open={isCreateModalOpen}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setEditingLeaveRequest(null);
          }}
          leaveRequest={editingLeaveRequest}
          onSuccess={handleModalSuccess}
        />

        {/* Cancel Modal */}
        <CancelLeaveRequestModal
          open={isCancelModalOpen}
          leaveRequest={cancellingLeaveRequest}
          onCancel={() => {
            setIsCancelModalOpen(false);
            setCancellingLeaveRequest(null);
          }}
          onSubmit={handleCancelSubmit}
          loading={cancelLeaveRequestMutation.isPending}
        />
      </Card>
    </div>
  );
}
