import {
  List,
  Tag,
  Typography,
  Space,
  Button,
  Card,
  Divider,
  Avatar,
  Empty,
} from "antd";
import {
  PlusOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ShiftSlot } from "../../types/shiftSlot";
import { ShiftSignupStatus } from "../../types/shiftSignup";
import { AdminShiftSignupActions } from "../AdminShiftSignupActions";

const { Text } = Typography;

interface ShiftSlotDetailItemProps {
  shift: ShiftSlot;
  onEdit: (shift: ShiftSlot) => void;
  onDelete: (id: string) => void;
  deleteLoading?: boolean;
  onClose: () => void;
}

export function ShiftSlotDetailItem({
  shift,
  onEdit,
  onDelete,
  deleteLoading = false,
  onClose,
}: ShiftSlotDetailItemProps) {
  const signups = shift.signups.filter(
    (signup) => signup.status !== ShiftSignupStatus.CANCELLED
  );

  const signupPercentage = Math.round((signups.length / shift.capacity) * 100);

  return (
    <List.Item
      actions={[
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={() => onEdit(shift)}
          key="edit"
        >
          Sửa
        </Button>,
        <Button
          type="text"
          danger
          onClick={() => onDelete(shift.id)}
          loading={deleteLoading}
          key="delete"
        >
          Xóa
        </Button>,
      ]}
    >
      <List.Item.Meta
        title={
          <Space wrap>
            <Tag color="green" icon={<EnvironmentOutlined />}>
              <Typography.Text strong className="uppercase">
                {shift.branch?.name}
              </Typography.Text>
            </Tag>
            <Tag color="green" icon={<TeamOutlined />}>
              {shift.department?.name}
            </Tag>
            <Tag color="blue" icon={<ClockCircleOutlined />}>
              {shift.type?.name}
            </Tag>
            <Tag
              color={
                signupPercentage >= 100
                  ? "red"
                  : signupPercentage >= 80
                    ? "orange"
                    : "green"
              }
            >
              {signups.length}/{shift.capacity} người
            </Tag>
          </Space>
        }
        description={
          <div className="space-y-3">
            {shift.signups.length > 0 ? (
              <div>
                <Text strong>Danh sách đăng ký:</Text>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  <Space direction="vertical" size="small" className="w-full">
                    {shift.signups.map((signup) => {
                      return (
                        <Card key={signup.id} size="small" className="w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar size="small" className="bg-blue-500">
                                {signup.employee.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <div>
                                <Text strong>{signup.employee.name}</Text>
                                <div className="text-xs text-gray-500">
                                  {dayjs(signup.createdAt).format(
                                    "DD/MM HH:mm"
                                  )}
                                </div>
                              </div>

                              {signup.status === ShiftSignupStatus.CANCELLED ? (
                                <Tag color="red">Đã hủy</Tag>
                              ) : (
                                <Tag color="green">Hoạt động</Tag>
                              )}

                              {signup.cancelReason && (
                                <div className="text-xs text-gray-500">
                                  lí do: {signup.cancelReason}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <AdminShiftSignupActions
                                shiftId={shift.id}
                                signups={[signup]}
                                showCreateButton={false}
                                showCancelButtons={true}
                              />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </Space>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text type="secondary">Chưa có ai đăng ký ca này</Text>
                  }
                />
              </div>
            )}
            <div className="mt-3">
              <AdminShiftSignupActions
                shiftId={shift.id}
                signups={[]}
                showCreateButton={true}
                showCancelButtons={false}
                onSuccess={onClose}
              />
            </div>
            {shift.note && (
              <>
                <Divider className="my-2" />
                <div>
                  <Text strong>Ghi chú: </Text>
                  <Text italic type="secondary">
                    {shift.note}
                  </Text>
                </div>
              </>
            )}
          </div>
        }
      />
    </List.Item>
  );
}
