import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Row, Col, Typography, Spin, Alert } from "antd";
import { useUserAuth } from "../../../../contexts/AuthUserContext";
import { useDashboardData } from "../../../../queries/dashboard.queries";
import {
  DashboardStatsCards,
  DashboardFilters,
  DashboardRecentActivities,
  DashboardTopPerformers,
  DashboardDepartmentPerformance,
} from "../../../../components";
import type { DashboardQuery } from "../../../../types/dashboard";

const { Title, Text } = Typography;

export const Route = createFileRoute("/u/_userLayout/_dashboardLayout/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useUserAuth();
  const [filters, setFilters] = useState<DashboardQuery>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: dashboardData, isLoading, error } = useDashboardData(filters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi Tải Bảng Điều Khiển"
        description={
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không mong muốn"
        }
        type="error"
        showIcon
      />
    );
  }

  if (!dashboardData) {
    return (
      <Alert
        message="Không Có Dữ Liệu"
        description="Không tìm thấy dữ liệu bảng điều khiển cho bộ lọc đã chọn."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <Title level={2} className="m-0">
            Chào mừng trở lại, {user?.name || "Người dùng"}! 👋
          </Title>
          <Text type="secondary">
            Cập nhật lần cuối:{" "}
            {new Date(dashboardData.generatedAt).toLocaleString()}
          </Text>
        </div>
      </Card>

      <DashboardFilters onFiltersChange={setFilters} initialFilters={filters} />

      <DashboardStatsCards stats={dashboardData.stats} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <DashboardDepartmentPerformance
            departments={dashboardData.departmentPerformance}
          />
        </Col>
        <Col xs={24} lg={8}>
          <DashboardTopPerformers performers={dashboardData.topPerformers} />
        </Col>
        <Col xs={24} lg={8}>
          <DashboardRecentActivities
            activities={dashboardData.recentActivities}
          />
        </Col>
      </Row>
    </div>
  );
}
