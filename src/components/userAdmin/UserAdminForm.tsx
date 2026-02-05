import { useEffect } from "react";
import { Form, Input, Button, Space, Typography, Row, Col } from "antd";
import type {
  CreateUserAdminDto,
  UpdateUserAdminDto,
  UserAdmin,
} from "@/types/userAdmin";

const { Text } = Typography;

interface UserAdminFormProps {
  userAdmin?: UserAdmin | null;
  onSubmit: (data: CreateUserAdminDto | UpdateUserAdminDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function UserAdminForm({
  userAdmin,
  onSubmit,
  onCancel,
  loading = false,
  submitText,
  cancelText = "Hủy",
}: UserAdminFormProps) {
  const [form] = Form.useForm();

  const isEditing = !!userAdmin;

  const defaultSubmitText = isEditing ? "Cập nhật" : "Thêm";
  const finalSubmitText = submitText || `${defaultSubmitText} user admin`;

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (isEditing && userAdmin) {
      const updateData: UpdateUserAdminDto = {
        name: values.name as string,
        email: values.email as string,
        username: values.username as string,
        phone: values.phone as string,
      };
      await onSubmit(updateData);
    } else {
      const createData: CreateUserAdminDto = {
        name: values.name as string,
        email: values.email as string,
        password: values.password as string,
        username: values.username as string,
        phone: values.phone as string,
      };
      await onSubmit(createData);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    if (userAdmin) {
      form.setFieldsValue({
        name: userAdmin.name,
        email: userAdmin.account?.email ?? "",
        username: userAdmin.account?.username ?? "",
        phone: userAdmin.phone ?? "",
      });
    } else {
      form.resetFields();
    }
  }, [userAdmin, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ provider: "local" }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Tên hiển thị"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên!" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
              { max: 100, message: "Tên không được quá 100 ký tự!" },
            ]}
          >
            <Input placeholder="John Doe" autoComplete="off" />
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
            <Input placeholder="admin@example.com" autoComplete="off" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="+1234567890" autoComplete="off" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              {
                min: 3,
                max: 20,
                message: "Tên đăng nhập từ 3–20 ký tự!",
              },
            ]}
          >
            <Input
              disabled={isEditing}
              placeholder="admin_user123"
              autoComplete="off"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
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
