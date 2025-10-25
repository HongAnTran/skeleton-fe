import React from "react";
import { Card, Row, Col, Statistic, Row as AntRow, Col as AntCol } from "antd";
import { useTaskInstanceStatistics } from "../../queries/task.queries";
import { TaskInstanceTable } from "./TaskInstanceTable";

export const TaskDashboard: React.FC = () => {
  const { data: statistics, isLoading } = useTaskInstanceStatistics();

  const statsCards = [
    {
      title: "Tổng nhiệm vụ",
      value: statistics?.total || 0,
      color: "#1890ff",
    },
    {
      title: "Chờ thực hiện",
      value: statistics?.pending || 0,
      color: "#faad14",
    },
    {
      title: "Đang thực hiện",
      value: statistics?.inProgress || 0,
      color: "#13c2c2",
    },
    {
      title: "Đã hoàn thành",
      value: statistics?.completed || 0,
      color: "#52c41a",
    },
    {
      title: "Đã phê duyệt",
      value: statistics?.approved || 0,
      color: "#722ed1",
    },
    {
      title: "Bị từ chối",
      value: statistics?.rejected || 0,
      color: "#f5222d",
    },
    {
      title: "Hết hạn",
      value: statistics?.expired || 0,
      color: "#fa8c16",
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard Nhiệm vụ</h2>

      <AntRow gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsCards.map((stat, index) => (
          <AntCol xs={24} sm={12} md={8} lg={6} xl={4} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{ color: stat.color }}
                loading={isLoading}
              />
            </Card>
          </AntCol>
        ))}
      </AntRow>

      <Card title="Nhiệm vụ gần đây">
        <TaskInstanceTable />
      </Card>
    </div>
  );
};
