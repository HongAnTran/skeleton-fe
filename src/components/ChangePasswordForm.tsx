import { Form, Input, Button, Card } from "antd";
import { LockOutlined } from "@ant-design/icons";
import type { ChangePasswordRequest } from "../types/auth";

interface ChangePasswordFormProps {
  onSubmit: (values: ChangePasswordRequest) => Promise<void>;
  loading?: boolean;
}

export function ChangePasswordForm({
  onSubmit,
  loading = false,
}: ChangePasswordFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = async (values: ChangePasswordRequest) => {
    await onSubmit({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    });
    form.resetFields();
  };

  return (
    <Card title="Đổi mật khẩu" className="max-w-2xl">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Mật khẩu hiện tại"
          name="oldPassword"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu hiện tại!",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu hiện tại"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu mới!",
            },
            {
              min: 6,
              message: "Mật khẩu phải có ít nhất 6 ký tự!",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu mới"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            {
              required: true,
              message: "Vui lòng xác nhận mật khẩu mới!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Xác nhận mật khẩu mới"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

