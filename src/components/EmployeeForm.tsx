import { useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Divider,
  Row,
  Col,
} from "antd";
import type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../types/employee";
import { useBranches } from "../queries/branch.queries";
import { useDepartments } from "../queries/department.queries";

const { Text } = Typography;

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (data: CreateEmployeeDto | UpdateEmployeeDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function EmployeeForm({
  employee,
  onSubmit,
  onCancel,
  loading = false,
  submitText,
  cancelText = "Hủy",
}: EmployeeFormProps) {
  const [form] = Form.useForm();

  const isEditing = !!employee;

  const defaultSubmitText = isEditing ? "Cập nhật" : "Thêm";
  const finalSubmitText = submitText || `${defaultSubmitText} nhân viên`;

  const { data: branchesData, isLoading: branchesLoading } = useBranches({
    page: 1,
    limit: 1000,
  });

  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartments({
      page: 1,
      limit: 1000,
    });

  const handleSubmit = async (values: any) => {
    try {
      if (isEditing && employee) {
        const updateData: UpdateEmployeeDto = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          branchId: values.branchId || undefined,
          departmentId: values.departmentId || undefined,
          active: values.active,
        };

        // Only include password if it's provided
        if (values.password && values.password.trim()) {
          updateData.password = values.password;
        }

        await onSubmit(updateData);
      } else {
        const createData: CreateEmployeeDto = {
          name: values.name,
          email: values.email,
          password: values.password,
          phone: values.phone || undefined,
          branchId: values.branchId || undefined,
          departmentId: values.departmentId || undefined,
          active: values.active ?? true,
        };
        await onSubmit(createData);
      }
      form.resetFields();
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    if (employee) {
      form.setFieldsValue({
        name: employee.name,
        email: employee.account?.email || "", // Assuming email comes from user relation
        phone: employee.phone,
        branchId: employee.branchId,
        departmentId: employee.departmentId,
        active: employee.active,
      });
    } else {
      form.resetFields();
    }
  }, [employee, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ active: true, provider: "local" }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Tên đầy đủ"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhân viên!" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
              { max: 100, message: "Tên không được quá 100 ký tự!" },
            ]}
          >
            <Input placeholder="Nhập tên đầy đủ nhân viên" autoComplete="off" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="employee@example.com" autoComplete="off" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              {
                pattern: /^[+]?[\d\s-()]+$/,
                message: "Số điện thoại không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="+1234567890" autoComplete="off" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={
              isEditing
                ? [{ min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }]
                : [
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                  ]
            }
            extra={
              isEditing ? (
                <Text type="secondary">
                  Để trống nếu không muốn thay đổi mật khẩu
                </Text>
              ) : undefined
            }
          >
            <Input.Password
              autoComplete="off"
              placeholder={
                isEditing ? "Nhập mật khẩu mới (tùy chọn)" : "Nhập mật khẩu"
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider>Thông tin bổ sung</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Chi nhánh" name="branchId">
            <Select
              placeholder="Chọn chi nhánh"
              allowClear
              loading={branchesLoading}
              showSearch
              optionFilterProp="children"
            >
              {branchesData?.data?.map((branch) => (
                <Select.Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Phòng ban" name="departmentId">
            <Select
              placeholder="Chọn phòng ban"
              allowClear
              loading={departmentsLoading}
              showSearch
              optionFilterProp="children"
            >
              {departmentsData?.data?.map((department) => (
                <Select.Option key={department.id} value={department.id}>
                  {department.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item className="mb-0">
        <Space className="w-full justify-end">
          <Button onClick={handleCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {finalSubmitText}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
