import { Card, Tag, Button, Space, Typography, Row, Col } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  SwapOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ShiftSwapRequest } from "../types/shiftSwap";
import { useEmployeeAuth } from "../contexts/AuthEmployeeContext";

const { Text, Title } = Typography;

interface ShiftSwapCardProps {
  request: ShiftSwapRequest;
  isCurrentUserRequester: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetail?: (request: ShiftSwapRequest) => void;
  loading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "orange";
    case "ACCEPTED":
      return "green";
    case "REJECTED":
      return "red";
    case "CANCELLED":
      return "default";
    case "COMPLETED":
      return "blue";
    default:
      return "default";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Chờ phản hồi";
    case "ACCEPTED":
      return "Đã chấp nhận";
    case "REJECTED":
      return "Đã từ chối";
    case "CANCELLED":
      return "Đã hủy";
    case "COMPLETED":
      return "Hoàn thành";
    default:
      return status;
  }
};

export function ShiftSwapCard({
  request,
  isCurrentUserRequester,
  onAccept,
  onReject,
  onCancel,
  onViewDetail,
  loading = false,
}: ShiftSwapCardProps) {
  const { employee } = useEmployeeAuth();
  const canRespond = !isCurrentUserRequester && request.status === "PENDING";
  const canCancel = isCurrentUserRequester && request.status === "PENDING";
  const otherUser = isCurrentUserRequester ? request.target : request.requester;
  const isRequester = request.requesterId === employee?.id;

  const mySlot = isRequester ? request.requesterSlot : request.targetSlot;
  const theirSlot = isRequester ? request.targetSlot : request.requesterSlot;

  console.log(mySlot, theirSlot, request.requesterSlotId, request.targetSlotId);
  return (
    <Card
      className="mb-4 shadow-sm hover:shadow-md transition-shadow"
      styles={{ body: { padding: "16px" } }}
    >
      <Row gutter={16} align="middle">
        <Col span={24}>
          <div className="space-y-3">
            {/* Header with user info and status */}
            <div className="flex items-center space-x-3">
              <div>
                <Title level={5} className="mb-0">
                  {isCurrentUserRequester ? "Gửi đến" : "Từ"}: {otherUser.name}
                </Title>
                <Text type="secondary" className="text-sm">
                  {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
                </Text>
              </div>
              <Tag
                color={getStatusColor(request.status)}
                className="text-sm font-medium"
              >
                {getStatusText(request.status)}
              </Tag>
            </div>

            {/* Shift swap details */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <Row gutter={16}>
                <Col span={10}>
                  <div className="text-center">
                    <Text strong className="text-green-600">
                      {"Ca của tôi"}
                    </Text>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <ClockCircleOutlined className="text-gray-500" />
                        <Text className="text-sm">
                          {dayjs(mySlot?.date).format("DD/MM/YYYY")}
                        </Text>
                      </div>
                      <div className="text-sm text-gray-600">
                        {mySlot?.type.name}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col span={4}>
                  <div className="flex items-center justify-center">
                    <SwapOutlined className="text-blue-500" />
                  </div>
                </Col>
                <Col span={10}>
                  <div className="text-center">
                    <Text strong className="text-blue-600">
                      {"Ca của họ"}
                    </Text>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <ClockCircleOutlined className="text-gray-500" />
                        <Text className="text-sm">
                          {dayjs(theirSlot?.date).format("DD/MM/YYYY")}
                        </Text>
                      </div>
                      <div className="text-sm text-gray-600">
                        {theirSlot?.type.name}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Reason and message */}
            {(request.reason || request.message) && (
              <div className="space-y-1">
                {request.reason && (
                  <div>
                    <Text strong className="text-sm">
                      Lý do:{" "}
                    </Text>
                    <Text className="text-sm">{request.reason}</Text>
                  </div>
                )}
                {request.message && (
                  <div>
                    <Text strong className="text-sm">
                      Tin nhắn:{" "}
                    </Text>
                    <Text
                      className="text-sm"
                      ellipsis={{ tooltip: request.message }}
                    >
                      {request.message}
                    </Text>
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>

        <Col span={24} md={6}>
          <Space direction="vertical" className="w-full">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => onViewDetail?.(request)}
              size="small"
              className="w-full"
            >
              Chi tiết
            </Button>

            {canRespond && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => onAccept?.(request.id)}
                  loading={loading}
                  size="small"
                  className="w-full"
                >
                  Chấp nhận
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => onReject?.(request.id)}
                  loading={loading}
                  size="small"
                  className="w-full"
                >
                  Từ chối
                </Button>
              </>
            )}

            {canCancel && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => onCancel?.(request.id)}
                loading={loading}
                size="small"
                className="w-full"
              >
                Hủy yêu cầu
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
