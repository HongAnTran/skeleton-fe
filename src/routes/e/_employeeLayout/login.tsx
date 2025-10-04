import {
  createFileRoute,
  useRouter,
  redirect,
  Link,
} from "@tanstack/react-router";
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
          <div className="flex  flex-col items-center gap-4">
            <Link to="/">
              <img src="/logo.webp" alt="logo" className="w-10 h-10" />
            </Link>
            <Title level={2} className="text-gray-900">
              Đăng nhập
            </Title>
            <Text>Trang đăng nhập cho nhân viên</Text>
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
              name="emailOrUsername"
              label="Email hoặc tên đăng nhập"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email hoặc tên đăng nhập!",
                },
              ]}
            >
              <Input
                placeholder="user@example.com hoặc tên đăng nhập"
                autoComplete="username"
              />
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

          <Link to="/u/login">
            <Button type="link" className="w-full">
              Chuyển đến trang đăng nhập quản trị viên
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
