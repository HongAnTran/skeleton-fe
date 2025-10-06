import {
  Modal,
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Avatar,
  Timeline,
  Divider,
} from "antd";
import {
  UserOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ShiftSwapRequest } from "../../types/shiftSwap";

const { Text, Title, Paragraph } = Typography;

interface ShiftSwapDetailModalProps {
  open: boolean;
  request?: ShiftSwapRequest;
  onCancel: () => void;
  isCurrentUserRequester?: boolean;
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PENDING":
      return <ClockCircleOutlined className="text-orange-500" />;
    case "ACCEPTED":
      return <CheckCircleOutlined className="text-green-500" />;
    case "REJECTED":
      return <CloseCircleOutlined className="text-red-500" />;
    case "CANCELLED":
      return <StopOutlined className="text-gray-500" />;
    case "COMPLETED":
      return <CheckCircleOutlined className="text-blue-500" />;
    default:
      return <ClockCircleOutlined />;
  }
};

export function ShiftSwapDetailModal({
  open,
  request,
  onCancel,
  isCurrentUserRequester = false,
}: ShiftSwapDetailModalProps) {
  if (!request) return null;

  const otherUser = isCurrentUserRequester ? request.target : request.requester;
  const mySlot = isCurrentUserRequester
    ? request.requesterSlot
    : request.targetSlot;
  const theirSlot = isCurrentUserRequester
    ? request.targetSlot
    : request.requesterSlot;

  const timelineItems = [
    {
      dot: <SendOutlined className="text-blue-500" />,
      children: (
        <div>
          <Text strong>Yêu cầu được tạo</Text>
          <br />
          <Text type="secondary" className="text-sm">
            {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
          </Text>
        </div>
      ),
    },
  ];

  if (request.status !== "PENDING") {
    timelineItems.push({
      dot: getStatusIcon(request.status),
      children: (
        <div>
          <Text strong>
            {request.status === "ACCEPTED" && "Yêu cầu đã được chấp nhận"}
            {request.status === "REJECTED" && "Yêu cầu đã bị từ chối"}
            {request.status === "CANCELLED" && "Yêu cầu đã bị hủy"}
            {request.status === "COMPLETED" && "Đổi ca hoàn tất"}
          </Text>
          <br />
          {request.respondedAt && (
            <Text type="secondary" className="text-sm">
              {dayjs(request.respondedAt).format("DD/MM/YYYY HH:mm")}
            </Text>
          )}
        </div>
      ),
    });
  }

  return (
    <Modal
      title="Chi tiết yêu cầu đổi ca"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <div className="space-y-4">
        {/* Header with status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar size={48} icon={<UserOutlined />} />
            <div>
              <Title level={4} className="mb-0">
                {isCurrentUserRequester ? "Yêu cầu đến" : "Yêu cầu từ"}:{" "}
                {otherUser.name}
              </Title>
              <Text type="secondary">ID: {request.id.slice(0, 8)}...</Text>
            </div>
          </div>
          <Tag
            color={getStatusColor(request.status)}
            className="text-base px-3 py-1"
          >
            {getStatusText(request.status)}
          </Tag>
        </div>

        <Divider />

        {/* Shift swap details */}
        <Card className="bg-blue-50">
          <div className="flex items-center justify-center mb-4">
            <SwapOutlined className="text-blue-500 text-2xl mr-2" />
            <Title level={4} className="mb-0">
              Chi tiết đổi ca
            </Title>
          </div>
          <Row gutter={16}>
            <Col span={10}>
              <Card size="small" className="text-center bg-green-50">
                <Text strong className="text-green-600">
                  {isCurrentUserRequester ? "Ca của tôi" : "Ca của họ"}
                </Text>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-center space-x-1">
                    <ClockCircleOutlined className="text-gray-500" />
                    <Text className="font-medium">
                      {dayjs(mySlot.date).format("DD/MM/YYYY")}
                    </Text>
                  </div>
                  <div className="text-lg font-bold">{mySlot.type.name}</div>
                </div>
              </Card>
            </Col>
            <Col span={4} className="flex items-center justify-center">
              <SwapOutlined className="text-4xl text-blue-500" />
            </Col>
            <Col span={10}>
              <Card size="small" className="text-center bg-blue-50">
                <Text strong className="text-blue-600">
                  {isCurrentUserRequester ? "Ca của họ" : "Ca của tôi"}
                </Text>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-center space-x-1">
                    <ClockCircleOutlined className="text-gray-500" />
                    <Text className="font-medium">
                      {dayjs(theirSlot.date).format("DD/MM/YYYY")}
                    </Text>
                  </div>
                  <div className="text-lg font-bold">{theirSlot.type.name}</div>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Reason and messages */}
        <Row gutter={16}>
          {(request.reason || request.message) && (
            <Col span={12}>
              <Card
                title={
                  <div className="flex items-center space-x-2">
                    <MessageOutlined className="text-blue-500" />
                    <span>Thông tin từ người yêu cầu</span>
                  </div>
                }
                size="small"
              >
                {request.reason && (
                  <div className="mb-3">
                    <Text strong className="text-sm">
                      Lý do:
                    </Text>
                    <Paragraph className="mb-0 mt-1 text-sm">
                      {request.reason}
                    </Paragraph>
                  </div>
                )}
                {request.message && (
                  <div>
                    <Text strong className="text-sm">
                      Tin nhắn:
                    </Text>
                    <Paragraph className="mb-0 mt-1 text-sm">
                      {request.message}
                    </Paragraph>
                  </div>
                )}
              </Card>
            </Col>
          )}
          <Col span={request.reason || request.message ? 12 : 24}>
            <Card title="Timeline" size="small">
              <Timeline items={timelineItems} />

              {/* Response message if available */}
              {request.responseMessage && request.status !== "PENDING" && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <Text strong className="text-sm">
                    Phản hồi từ{" "}
                    {isCurrentUserRequester ? otherUser.name : "bạn"}:
                  </Text>
                  <Paragraph className="mb-0 mt-1 text-sm">
                    {request.responseMessage}
                  </Paragraph>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Modal>
  );
}
