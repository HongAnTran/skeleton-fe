import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Space,
  theme,
  Drawer,
  Tag,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  TableOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useEmployeeAuth } from "../../contexts/AuthEmployeeContext";
import type { MenuProps } from "antd";
import { useLocation, useRouter } from "@tanstack/react-router";

const { Header, Sider, Content } = Layout;

interface EmployeeDashboardLayoutProps {
  children: React.ReactNode;
}

const EmployeeDashboardLayout: React.FC<EmployeeDashboardLayoutProps> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { employee, logout } = useEmployeeAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const router = useRouter();
  const location = useLocation();

  // Check if screen is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleMenuClick = (path: string) => {
    router.navigate({ to: path });
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  const menuItems: MenuProps["items"] = [
    // {
    //   key: "/e",
    //   icon: <DashboardOutlined />,
    //   label: "Tổng quan",
    //   onClick: () => handleMenuClick("/e"),
    // },
    {
      key: "/e/shift-slots",
      icon: <TableOutlined />,
      label: "Ca làm việc",
      onClick: () => handleMenuClick("/e/shift-slots"),
    },
    // {
    //   key: "/e/change-shift-requests",
    //   icon: <SwapOutlined />,
    //   label: "Yêu cầu đổi ca",
    //   onClick: () => handleMenuClick("/e/change-shift-requests"),
    // },
    // {
    //   key: "/e/tasks",
    //   icon: <UnorderedListOutlined />,
    //   label: "Nhiệm vụ",
    //   onClick: () => handleMenuClick("/e/tasks"),
    // },
  ];

  const handleMenuButtonClick = () => {
    if (isMobile) {
      setDrawerVisible(!drawerVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const employeeMenuItems: MenuProps["items"] = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: "Tài khoản",
    },
    {
      type: "divider",
    },
    {
      key: "3",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: logout,
    },
  ];

  const renderSidebarContent = () => (
    <>
      <div className="p-4">
        <div className="flex items-center justify-center">
          {!isMobile && collapsed ? (
            <Avatar
              size="large"
              icon={<TeamOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            />
          ) : (
            <div className="text-center">
              <Avatar
                size="large"
                icon={<TeamOutlined />}
                style={{ backgroundColor: "#1890ff" }}
                className="mb-2"
              />
              <div className="text-sm font-semibold">Hi Táo Thơm</div>
            </div>
          )}
        </div>
      </div>
      <Menu
        theme="light"
        mode="inline"
        defaultSelectedKeys={[location.pathname]}
        items={menuItems}
        style={{ border: "none" }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: colorBgContainer,
            boxShadow: "2px 0 8px 0 rgba(0,0,0,0.15)",
          }}
        >
          {renderSidebarContent()}
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="text-center">
            <Avatar
              size="large"
              icon={<TeamOutlined />}
              style={{ backgroundColor: "#1890ff" }}
              className="mb-2"
            />
            <div className="text-sm font-semibold">Hi Táo Thơm</div>
          </div>
        }
        placement="left"
        closable={true}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible && isMobile}
        width={280}
        styles={{
          body: { padding: 0 },
        }}
      >
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          items={menuItems}
          style={{ border: "none" }}
        />
      </Drawer>

      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            icon={
              isMobile ? (
                <MenuUnfoldOutlined />
              ) : collapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            onClick={handleMenuButtonClick}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />

          <Space>
            <Tag color="green" icon={<EnvironmentOutlined />}>
               {employee?.branch?.name}
            </Tag>
            <span className={isMobile ? "hidden sm:inline" : ""}>
              Chào, {employee?.name || "Employee"}!
            </span>
            <Dropdown
              menu={{ items: employeeMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Avatar
                style={{ cursor: "pointer", backgroundColor: "#1890ff" }}
                icon={<TeamOutlined />}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: isMobile ? "16px 8px" : "24px 16px",
            padding: isMobile ? 16 : 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default EmployeeDashboardLayout;
