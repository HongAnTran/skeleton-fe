import { useState } from "react";
import { Button, Popconfirm, Modal, Form, Input, Select } from "antd";
import { UserDeleteOutlined, UserAddOutlined } from "@ant-design/icons";
import {
  useCancelShiftSignupByAdmin,
  useCreateShiftSignupByAdmin,
} from "../queries/shiftSignup.queries";
import { useEmployees } from "../queries/employee.queries";
import type { ShiftSignup } from "../types/shiftSignup";
import { ShiftSignupStatus } from "../types/shiftSignup";

interface AdminShiftSignupActionsProps {
  shiftId: string;
  signups: ShiftSignup[];
  onSuccess?: () => void;
  showCreateButton?: boolean;
  showCancelButtons?: boolean;
}

export function AdminShiftSignupActions({
  shiftId,
  signups,
  onSuccess,
  showCreateButton = true,
  showCancelButtons = true,
}: AdminShiftSignupActionsProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSignupId, setSelectedSignupId] = useState<string>("");
  const [form] = Form.useForm();

  const cancelByAdminMutation = useCancelShiftSignupByAdmin();
  const createByAdminMutation = useCreateShiftSignupByAdmin();
  const { data: employeesData } = useEmployees({
    page: 1,
    limit: 100,
  });

  const handleCancelByAdmin = (signupId: string) => {
    setSelectedSignupId(signupId);
    setIsCancelModalOpen(true);
  };

  const handleCreateByAdmin = () => {
    setIsCreateModalOpen(true);
  };

  const handleCancelSubmit = async (values: { cancelReason: string }) => {
    try {
      await cancelByAdminMutation.mutateAsync({
        id: selectedSignupId,
        cancelReason: values.cancelReason,
      });
      setIsCancelModalOpen(false);
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCreateSubmit = async (values: { employeeId: string }) => {
    try {
      await createByAdminMutation.mutateAsync({
        slotId: shiftId,
        employeeId: values.employeeId,
      });
      setIsCreateModalOpen(false);
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <>
      {/* Cancel Buttons for each signup */}
      {showCancelButtons && signups.length > 0 && (
        <div>
          {signups.map((signup) => (
            <div key={signup.id}>
              {signup.status !== ShiftSignupStatus.CANCELLED && (
                <Popconfirm
                  title="Xác nhận hủy"
                  description="Bạn có chắc chắn muốn hủy đăng ký này?"
                  onConfirm={() => handleCancelByAdmin(signup.id)}
                  okText="Hủy"
                  cancelText="Không"
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<UserDeleteOutlined />}
                    title="Hủy đăng ký"
                  >
                    Hủy
                  </Button>
                </Popconfirm>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Button */}
      {showCreateButton && (
        <Button
          type="dashed"
          icon={<UserAddOutlined />}
          onClick={handleCreateByAdmin}
          className="w-full"
        >
          Tạo đăng ký cho nhân viên
        </Button>
      )}

      {/* Cancel Modal */}
      <Modal
        title="Hủy đăng ký ca làm việc"
        open={isCancelModalOpen}
        onCancel={() => setIsCancelModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={cancelByAdminMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleCancelSubmit}>
          <Form.Item
            name="cancelReason"
            label="Lý do hủy"
            rules={[{ required: true, message: "Vui lòng nhập lý do hủy" }]}
          >
            <Input.TextArea
              placeholder="Nhập lý do hủy đăng ký ca làm việc..."
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Modal */}
      <Modal
        title="Tạo đăng ký ca làm việc cho nhân viên"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createByAdminMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit}>
          <Form.Item
            name="employeeId"
            label="Chọn nhân viên"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
          >
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {employeesData?.data?.map((employee) => (
                <Select.Option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.account.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
