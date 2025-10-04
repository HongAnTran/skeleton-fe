import { useState } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Avatar,
} from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEmployees } from "../queries/employee.queries";
import { useShiftSignupsByEmployee } from "../queries/shiftSignup.queries";
import type { CreateShiftSwapRequestDto } from "../types/shiftSwap";
import type { ShiftSignup } from "../types/shiftSignup";
import { useEmployeeAuth } from "../contexts/AuthEmployeeContext";

const { Text } = Typography;

interface CreateShiftSwapModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateShiftSwapRequestDto) => Promise<void>;
  loading?: boolean;
  currentEmployeeId: string;
}

export function CreateShiftSwapModal({
  open,
  onCancel,
  onSubmit,
  loading = false,
  currentEmployeeId,
}: CreateShiftSwapModalProps) {
  const { employee } = useEmployeeAuth();
  const [form] = Form.useForm();
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>();
  const [selectedRequesterSlot, setSelectedRequesterSlot] =
    useState<ShiftSignup>();
  const [selectedTargetSlot, setSelectedTargetSlot] = useState<ShiftSignup>();

  // Get employees for dropdown
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({
    page: 1,
    limit: 100,
    branchId: employee?.branchId,
    departmentId: employee?.departmentId,
  });

  const { data: myShiftsData, isLoading: myShiftsLoading } =
    useShiftSignupsByEmployee({
      employeeId: currentEmployeeId,
    });

  // Get target employee's shift slots
  const { data: targetShiftsData, isLoading: targetShiftsLoading } =
    useShiftSignupsByEmployee(
      {
        employeeId: targetEmployeeId!,
      },
      {
        enabled: !!targetEmployeeId,
      }
    );

  const handleSubmit = async (values: any) => {
    try {
      if (!selectedRequesterSlot || !selectedTargetSlot) return;

      const data: CreateShiftSwapRequestDto = {
        targetId: values.targetId,
        requesterSlotId: selectedRequesterSlot?.slotId,
        targetSlotId: selectedTargetSlot?.slotId,
        reason: values.reason,
        message: values.message,
      };
      await onSubmit(data);
      handleCancel();
    } catch (error) {
      // Error is handled by parent
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setTargetEmployeeId(undefined);
    setSelectedRequesterSlot(undefined);
    setSelectedTargetSlot(undefined);
    onCancel();
  };

  const handleTargetEmployeeChange = (employeeId: string) => {
    setTargetEmployeeId(employeeId);
    // Reset target slot when changing employee
    form.setFieldValue("targetSlotId", undefined);
    setSelectedTargetSlot(undefined);
  };

  const handleRequesterSlotChange = (slotId: string) => {
    const slot = myShiftsData?.data?.find((s) => s.id === slotId);
    setSelectedRequesterSlot(slot);
  };

  const handleTargetSlotChange = (slotId: string) => {
    const slot = targetShiftsData?.data?.find((s) => s.id === slotId);
    setSelectedTargetSlot(slot);
  };

  // Filter out current employee from target options
  const targetEmployeeOptions = employeesData?.data?.filter(
    (emp) => emp.id !== currentEmployeeId
  );

  const renderShiftSlotOption = (slot: ShiftSignup) => (
    <Select.Option key={slot.id} value={slot.id}>
      <div className="py-1">
        <div className="flex items-center justify-between">
          <Text strong>{slot.slot.type?.name}</Text>
          <Tag color="blue">{dayjs(slot.slot.date).format("DD/MM")}</Tag>
        </div>
      </div>
    </Select.Option>
  );

  const renderShiftPreview = (slot?: ShiftSignup, title?: string) => {
    if (!slot) return null;

    return (
      <Card size="small" className="mt-2">
        <div className="text-center">
          <Text strong className="text-sm">
            {title}
          </Text>
          <div className="mt-1 space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <ClockCircleOutlined className="text-gray-500" />
              <Text className="text-sm">
                {dayjs(slot.slot.date).format("DD/MM/YYYY")}
              </Text>
            </div>
            <div className="text-sm text-gray-600">{slot.slot.type?.name}</div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Modal
      title="Tạo yêu cầu đổi ca"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Chọn nhân viên muốn đổi ca"
              name="targetId"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn nhân viên muốn đổi ca!",
                },
              ]}
            >
              <Select
                placeholder="Chọn nhân viên"
                loading={employeesLoading}
                onChange={handleTargetEmployeeChange}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option: any) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {targetEmployeeOptions?.map((employee) => (
                  <Select.Option key={employee.id} value={employee.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar size="small" icon={<UserOutlined />} />
                      <span>{employee.name}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Chọn ca của bạn"
              name="requesterSlotId"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ca của bạn!",
                },
              ]}
            >
              <Select
                placeholder="Chọn ca của bạn"
                loading={myShiftsLoading}
                onChange={handleRequesterSlotChange}
                showSearch
                optionFilterProp="children"
              >
                {myShiftsData?.data?.map(renderShiftSlotOption)}
              </Select>
            </Form.Item>
            {renderShiftPreview(selectedRequesterSlot, "Ca của bạn")}
          </Col>

          <Col span={12}>
            <Form.Item
              label="Chọn ca của họ"
              name="targetSlotId"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ca của họ!",
                },
              ]}
            >
              <Select
                placeholder="Chọn ca của họ"
                loading={targetShiftsLoading}
                onChange={handleTargetSlotChange}
                disabled={!targetEmployeeId}
                showSearch
                optionFilterProp="children"
              >
                {targetShiftsData?.data?.map(renderShiftSlotOption)}
              </Select>
            </Form.Item>
            {renderShiftPreview(selectedTargetSlot, "Ca của họ")}
          </Col>
        </Row>

        {/* Preview swap */}
        {selectedRequesterSlot && selectedTargetSlot && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <Row gutter={16}>
              <Col span={10}>
                <div className="text-center">
                  <Text className="text-sm text-green-600">Bạn sẽ làm</Text>
                  <div className="text-sm font-medium">
                    {selectedTargetSlot.slot.type?.name} -{" "}
                    {dayjs(selectedTargetSlot.slot.date).format("DD/MM")}
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
                  <Text className="text-sm text-blue-600">Họ sẽ làm</Text>
                  <div className="text-sm font-medium">
                    {selectedRequesterSlot.slot.type?.name} -{" "}
                    {dayjs(selectedRequesterSlot.slot.date).format("DD/MM")}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Lý do đổi ca" name="reason">
              <Input placeholder="Ví dụ: Có việc gia đình" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="mb-0 mt-6">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel} disabled={loading}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Gửi yêu cầu đổi ca
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
