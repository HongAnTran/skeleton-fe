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
} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  TeamOutlined,
  ScheduleOutlined,
  TableOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useUserAuth } from "@/contexts/AuthUserContext";
import type { MenuProps } from "antd";
import { useLocation, useRouter } from "@tanstack/react-router";

const { Header, Sider, Content } = Layout;
interface UserDashboardLayoutProps {
  children: React.ReactNode;
}

const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { user, logout } = useUserAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const location = useLocation();

  const router = useRouter();

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
    {
      key: "/u",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      onClick: () => handleMenuClick("/u"),
    },
    {
      key: "/u/shift-slots",
      icon: <TableOutlined />,
      label: "Ca làm việc",
      onClick: () => handleMenuClick("/u/shift-slots"),
    },
    {
      key: "/u/shift-slot-types",
      icon: <ScheduleOutlined />,
      label: "Cài đặt ca làm việc",
      onClick: () => handleMenuClick("/u/shift-slot-types"),
    },
    {
      key: "/u/employees",
      icon: <TeamOutlined />,
      label: "Nhân viên",
      onClick: () => handleMenuClick("/u/employees"),
    },
    {
      key: "/u/leave-requests",
      icon: <FileTextOutlined />,
      label: "Đơn xin nghỉ",
      onClick: () => handleMenuClick("/u/leave-requests"),
    },
    {
      key: "/u/tasks",
      icon: <UnorderedListOutlined />,
      label: "Nhiệm vụ",
      onClick: () => handleMenuClick("/u/tasks"),
    },
    {
      key: "/u/branchs",
      icon: <HomeOutlined />,
      label: "Chi nhánh",
      onClick: () => handleMenuClick("/u/branchs"),
    },
    {
      key: "/u/departments",
      icon: <TeamOutlined />,
      label: "Phòng ban",
      onClick: () => handleMenuClick("/u/departments"),
    },
    // {
    //   key: "/u/settings",
    //   icon: <SettingOutlined />,
    //   label: "Cài đặt",
    //   onClick: () => handleMenuClick("/u/settings"),
    // },
  ];

  const handleMenuButtonClick = () => {
    if (isMobile) {
      setDrawerVisible(!drawerVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const userMenuItems: MenuProps["items"] = [
    // {
    //   key: "1",
    //   icon: <UserOutlined />,
    //   label: "Tài khoản",
    // },
    // {
    //   type: "divider",
    // },
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
            <img src="/logo.webp" alt="logo" className="w-10 h-10" />
          ) : (
            <div className="flex items-center gap-2">
              <img src="/logo.webp" alt="logo" className="w-10 h-10" />
              <div className="text-sm font-semibold">Trang Quản Trị</div>
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
            position: "fixed",
            height: "100vh",
            left: 0,
            top: 0,
            zIndex: 1000,
          }}
        >
          {renderSidebarContent()}
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="text-center">
            <img src="/logo.webp" alt="logo" className="w-10 h-10" />
            <div className="text-sm font-semibold">ADMIN</div>
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
            position: "sticky",
            top: 0,
            zIndex: 999,
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
            <span className={isMobile ? "hidden sm:inline" : ""}>
              Xin chào, {user?.name || "User"}!
            </span>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Avatar style={{ cursor: "pointer" }} icon={<UserOutlined />} />
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: isMobile ? "16px 8px" : "24px 16px",
            marginLeft: isMobile ? "16px" : collapsed ? "80px" : "200px",
            padding: isMobile ? 16 : 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            transition: "margin-left 0.2s",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserDashboardLayout;
