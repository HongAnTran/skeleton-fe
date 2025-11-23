import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShiftSlotTable, ShiftSlotCalendar } from "@/components";
import { Radio, Space } from "antd";
import { TableOutlined, CalendarOutlined } from "@ant-design/icons";

export const Route = createFileRoute(
  "/u/_userLayout/_dashboardLayout/shift-slots"
)({
  component: RouteComponent,
});

type ViewMode = "table" | "calendar";

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
              Xem lịch
            </Space>
          </Radio.Button>
          <Radio.Button value="table">
            <Space>
              <TableOutlined />
              Xem bảng
            </Space>
          </Radio.Button>
        </Radio.Group>
      </div>

      {viewMode === "table" ? <ShiftSlotTable /> : <ShiftSlotCalendar />}
    </div>
  );
}
