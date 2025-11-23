import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  EmployeeShiftSlotCalendar,
  EmployeeShiftSignupTable,
} from "@/components";
import { Radio, Space } from "antd";
import { CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";

export const Route = createFileRoute(
  "/e/_employeeLayout/_dashboardLayout/shift-slots"
)({
  component: RouteComponent,
});

type ViewMode = "calendar" | "signup-table";

function RouteComponent() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  return (
    <div className="">
      <div className="mb-4">
        <Radio.Group
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="calendar">
            <Space>
              <CalendarOutlined />
              Đăng ký ca làm việc
            </Space>
          </Radio.Button>
          <Radio.Button value="signup-table">
            <Space>
              <CheckCircleOutlined />
              Ca đã đăng ký
            </Space>
          </Radio.Button>
        </Radio.Group>
      </div>

      {viewMode === "calendar" ? (
        <EmployeeShiftSlotCalendar />
      ) : (
        <EmployeeShiftSignupTable />
      )}
    </div>
  );
}
