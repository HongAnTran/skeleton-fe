import { createFileRoute, useRouter, redirect } from "@tanstack/react-router";
import { Button, Form, Input, Card, Typography, message, Spin } from "antd";
import { tokenStorage } from "../../../utils/token";
import type { LoginRequest } from "../../../types/auth";
import { useEmployeeAuth } from "../../../contexts/AuthEmployeeContext";

const { Title, Text } = Typography;

export const Route = createFileRoute("/e/_employeeLayout/login")({
  beforeLoad: () => {
    if (tokenStorage.isAuthenticated()) {
      throw redirect({
        to: "/e",
      });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { login: loginEmployee, loading: loadingEmployee } = useEmployeeAuth();
  const onFinish = async (values: LoginRequest) => {
    try {
      await loginEmployee(values);
      message.success("Đăng nhập thành công!");
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get("redirect") || "/e";
      router.navigate({ to: redirectTo });
    } catch (error: any) {
      message.error(error.message || "Đăng nhập thất bại!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <div className="text-center mb-8">
            <Title level={2} className="text-gray-900">
              Đăng nhập
            </Title>
            <Text type="secondary">Trang đăng nhập cho nhân viên</Text>
          </div>
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email!",
                },
                {
                  type: "email",
                  message: "Email không hợp lệ!",
                },
              ]}
            >
              <Input placeholder="user@example.com" autoComplete="username" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu!",
                },
                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự!",
                },
              ]}
            >
              <Input.Password
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={loadingEmployee}
                disabled={loadingEmployee}
              >
                {loadingEmployee ? <Spin size="small" /> : null}
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
