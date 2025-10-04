import { useState } from "react";
import {
  Card,
  Tabs,
  Button,
  Select,
  Row,
  Col,
  Space,
  Empty,
  Spin,
  Badge,
  Typography,
} from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  useShiftSwapRequests,
  useCreateShiftSwapRequest,
  useRespondShiftSwapRequest,
  useCancelShiftSwapRequest,
} from "../queries/shiftSwap.queries";
import { useEmployeeAuth } from "../contexts/AuthEmployeeContext";
import { ShiftSwapCard } from "./ShiftSwapCard";
import { CreateShiftSwapModal } from "./CreateShiftSwapModal";
import { ShiftSwapResponseModal } from "./ShiftSwapResponseModal";
import { ShiftSwapDetailModal } from "./ShiftSwapDetailModal";
import type {
  ShiftSwapRequest,
  ShiftSwapStatus,
  CreateShiftSwapRequestDto,
  RespondShiftSwapRequestDto,
} from "../types/shiftSwap";

const { Title } = Typography;

const statusOptions = [
  { label: "Tất cả", value: "" },
  { label: "Chờ phản hồi", value: "PENDING" },
  { label: "Đã chấp nhận", value: "ACCEPTED" },
  { label: "Đã từ chối", value: "REJECTED" },
  { label: "Đã hủy", value: "CANCELLED" },
  { label: "Hoàn thành", value: "COMPLETED" },
];

export function ShiftSwapList() {
  const { employee } = useEmployeeAuth();
  const [activeTab, setActiveTab] = useState<"sent" | "received">("received");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ShiftSwapStatus | "">("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ShiftSwapRequest | null>(null);

  // Queries
  const {
    data: sentData,
    isLoading: sentLoading,
    refetch: refetchSent,
  } = useShiftSwapRequests(
    {
      type: "sent",
      page: activeTab === "sent" ? currentPage : 1,
      limit: 10,
      status: statusFilter || undefined,
    },
    {
      enabled: activeTab === "sent",
    }
  );

  const {
    data: receivedData,
    isLoading: receivedLoading,
    refetch: refetchReceived,
  } = useShiftSwapRequests(
    {
      type: "received",
      page: activeTab === "received" ? currentPage : 1,
      limit: 10,
      status: statusFilter || undefined,
    },
    {
      enabled: activeTab === "received",
    }
  );

  const createMutation = useCreateShiftSwapRequest();
  const respondMutation = useRespondShiftSwapRequest();
  const cancelMutation = useCancelShiftSwapRequest();

  const currentData = activeTab === "sent" ? sentData : receivedData;
  const currentLoading = activeTab === "sent" ? sentLoading : receivedLoading;
  console.log(currentData);
  const handleTabChange = (key: string) => {
    setActiveTab(key as "sent" | "received");
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as ShiftSwapStatus | "");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    if (activeTab === "sent") {
      refetchSent();
    } else {
      refetchReceived();
    }
  };

  const handleCreateSubmit = async (data: CreateShiftSwapRequestDto) => {
    await createMutation.mutateAsync(data);
    refetchSent();
  };

  const handleAccept = (requestId: string) => {
    const request = currentData?.data.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowResponseModal(true);
    }
  };

  const handleReject = (requestId: string) => {
    const request = currentData?.data.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowResponseModal(true);
    }
  };

  const handleRespondSubmit = async (data: RespondShiftSwapRequestDto) => {
    if (selectedRequest) {
      await respondMutation.mutateAsync({
        id: selectedRequest.id,
        data,
      });
      refetchReceived();
      setSelectedRequest(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    await cancelMutation.mutateAsync(requestId);
    refetchSent();
  };

  const handleViewDetail = (request: ShiftSwapRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  const tabItems = [
    {
      key: "received",
      label: (
        <Badge
          count={
            receivedData?.data?.filter((r) => r.status === "PENDING").length ||
            0
          }
          size="small"
          offset={[10, -5]}
        >
          <span>Đã nhận ({receivedData?.meta?.total || 0})</span>
        </Badge>
      ),
      children: (
        <div>
          {currentLoading ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : currentData?.data?.length ? (
            <div>
              {currentData.data.map((request) => (
                <ShiftSwapCard
                  key={request.id}
                  request={request}
                  isCurrentUserRequester={false}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onViewDetail={handleViewDetail}
                  loading={respondMutation.isPending}
                />
              ))}

              {/* Simple pagination could be added here */}
              {currentData.meta && currentData.meta.total > 10 && (
                <div className="text-center mt-4">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Trang trước
                  </Button>
                  <span className="mx-4">
                    Trang {currentPage} /{" "}
                    {Math.ceil(currentData.meta.total / 10)}
                  </span>
                  <Button
                    disabled={
                      currentPage >= Math.ceil(currentData.meta.total / 10)
                    }
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Empty
              description="Chưa có yêu cầu đổi ca nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      ),
    },
    {
      key: "sent",
      label: `Đã gửi (${sentData?.meta?.total || 0})`,
      children: (
        <div>
          {currentLoading ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : currentData?.data?.length ? (
            <div>
              {currentData.data.map((request) => (
                <ShiftSwapCard
                  key={request.id}
                  request={request}
                  isCurrentUserRequester={true}
                  onCancel={handleCancel}
                  onViewDetail={handleViewDetail}
                  loading={cancelMutation.isPending}
                />
              ))}

              {/* Simple pagination */}
              {currentData.meta && currentData.meta.total > 10 && (
                <div className="text-center mt-4">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Trang trước
                  </Button>
                  <span className="mx-4">
                    Trang {currentPage} /{" "}
                    {Math.ceil(currentData.meta.total / 10)}
                  </span>
                  <Button
                    disabled={
                      currentPage >= Math.ceil(currentData.meta.total / 10)
                    }
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Empty
              description="Bạn chưa gửi yêu cầu đổi ca nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <div className="mb-4 flex flex-col lg:flex-row items-center justify-between">
        <Title level={4} className="m-0">
          Yêu cầu đổi ca làm việc
        </Title>
        <Space>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={currentLoading}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
          >
            Tạo yêu cầu đổi ca
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card size="small" className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full"
              options={statusOptions}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              onClick={() => {
                setStatusFilter("");
                setCurrentPage(1);
              }}
              className="w-full"
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />

      {/* Modals */}
      <CreateShiftSwapModal
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        loading={createMutation.isPending}
        currentEmployeeId={employee.id}
      />

      <ShiftSwapResponseModal
        open={showResponseModal}
        request={selectedRequest || undefined}
        onCancel={() => {
          setShowResponseModal(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleRespondSubmit}
        loading={respondMutation.isPending}
      />

      <ShiftSwapDetailModal
        open={showDetailModal}
        request={selectedRequest || undefined}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedRequest(null);
        }}
        isCurrentUserRequester={activeTab === "sent"}
      />
    </Card>
  );
}
