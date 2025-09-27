import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Typography, Button } from "antd";
import { UserOutlined, TeamOutlined, LoginOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Title level={1} className="text-gray-900 mb-4">
            Chào mừng bạn đến với hệ thống
          </Title>
          <Text className="text-lg text-gray-600">
            Vui lòng chọn loại tài khoản của bạn để tiếp tục
          </Text>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* User Login Card */}
          <Card
            className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0"
            bodyStyle={{ padding: "2rem" }}
          >
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                  <UserOutlined className="text-4xl text-blue-600" />
                </div>
                <Title level={3} className="text-gray-900 mb-3">
                  Quản trị viên
                </Title>
                <Text className="text-gray-600 block mb-6">
                  Dành cho quản trị viên hệ thống
                </Text>
              </div>

              <Link to="/u/login">
                <Button
                  type="primary"
                  size="large"
                  className="w-full h-12 text-lg font-medium"
                  icon={<LoginOutlined />}
                >
                  Đăng nhập với tài khoản quản trị viên
                </Button>
              </Link>
            </div>
          </Card>

          {/* Employee Login Card */}
          <Card
            className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0"
            bodyStyle={{ padding: "2rem" }}
          >
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <TeamOutlined className="text-4xl text-green-600" />
                </div>
                <Title level={3} className="text-gray-900 mb-3">
                  Nhân viên
                </Title>
                <Text className="text-gray-600 block mb-6">
                  Dành cho nhân viên
                </Text>
              </div>

              <Link to="/e/login">
                <Button
                  type="primary"
                  size="large"
                  className="w-full h-12 text-lg font-medium bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                  icon={<LoginOutlined />}
                >
                  Đăng nhập với tài khoản nhân viên
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Text type="secondary" className="text-sm">
            © 2025 Hệ thống quản lý. Tất cả quyền được bảo lưu.
          </Text>
        </div>
      </div>
    </div>
  );
}
