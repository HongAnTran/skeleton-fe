import { useState } from "react";
import {
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
} from "antd";
import dayjs from "dayjs";
import { useBranches } from "@/queries/branch.queries";
import { useDepartments } from "@/queries/department.queries";
import type { DashboardQuery } from "@/types/dashboard";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface DashboardFiltersProps {
  onFiltersChange: (filters: DashboardQuery) => void;
  initialFilters?: DashboardQuery;
}

export function DashboardFilters({
  onFiltersChange,
  initialFilters = {},
}: DashboardFiltersProps) {
  const [filters, setFilters] = useState<DashboardQuery>({
    startDate:
      initialFilters.startDate ||
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    endDate: initialFilters.endDate || new Date().toISOString().split("T")[0],
    branchId: initialFilters.branchId || "",
    departmentId: initialFilters.departmentId || "",
  });

  // Fetch branches and departments data
  const { data: branchesData } = useBranches({ page: 1, limit: 100 });
  const { data: departmentsData } = useDepartments({ page: 1, limit: 100 });

  const handleFilterChange = (key: keyof DashboardQuery, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const newFilters = {
        ...filters,
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
      };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    }
  };

  const handleQuickDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const newFilters = {
      ...filters,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      branchId: "",
      departmentId: "",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <Text strong className="text-lg">
          Bộ Lọc Bảng Điều Khiển
        </Text>

        <Space wrap>
          <Button
            size="small"
            type={
              filters.startDate ===
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
                ? "primary"
                : "default"
            }
            onClick={() => handleQuickDateRange(7)}
          >
            7 ngày gần đây
          </Button>
          <Button
            size="small"
            type={
              filters.startDate ===
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
                ? "primary"
                : "default"
            }
            onClick={() => handleQuickDateRange(30)}
          >
            30 ngày gần đây
          </Button>
          <Button
            size="small"
            type={
              filters.startDate ===
              new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
                ? "primary"
                : "default"
            }
            onClick={() => handleQuickDateRange(90)}
          >
            90 ngày gần đây
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <div>
            <Text strong className="block mb-2">
              Khoảng Thời Gian
            </Text>
            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
              onChange={handleDateRangeChange}
              className="w-full"
              value={
                filters.startDate && filters.endDate
                  ? [dayjs(filters.startDate), dayjs(filters.endDate)]
                  : null
              }
            />
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div>
            <Text strong className="block mb-2">
              Chi Nhánh
            </Text>
            <Select
              placeholder="Chọn chi nhánh"
              value={filters.branchId || undefined}
              onChange={(value) => handleFilterChange("branchId", value || "")}
              allowClear
              className="w-full"
            >
              {branchesData?.data?.map((branch) => (
                <Select.Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div>
            <Text strong className="block mb-2">
              Phòng Ban
            </Text>
            <Select
              placeholder="Chọn phòng ban"
              value={filters.departmentId || undefined}
              onChange={(value) =>
                handleFilterChange("departmentId", value || "")
              }
              allowClear
              className="w-full"
            >
              {departmentsData?.data?.map((department) => (
                <Select.Option key={department.id} value={department.id}>
                  {department.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="flex items-end h-full">
            <Button onClick={clearFilters} className="w-full">
              Xóa Bộ Lọc
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
