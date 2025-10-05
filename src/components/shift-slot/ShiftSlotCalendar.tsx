import { useEffect, useState } from "react";
import {
  Calendar,
  Card,
  Badge,
  Button,
  Typography,
  Drawer,
  Select,
  Row,
  Col,
  List,
  Flex,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import type { Dayjs } from "dayjs";

// Cấu hình tuần bắt đầu từ Thứ 2
dayjs.extend(weekday);
dayjs.Ls.en.weekStart = 1; // 1 = Monday
import {
  useCreateShiftSlot,
  useCreateManyShiftSlots,
  useUpdateShiftSlot,
  useDeleteShiftSlot,
  useShiftSlots,
} from "../../queries/shiftSlot.queries";
import { useBranches } from "../../queries/branch.queries";
import { ShiftSlotForm } from "./ShiftSlotForm";
import { ShiftSlotDetailItem } from "./ShiftSlotDetailItem";
import ShiftSlotWeekView from "./ShiftSlotWeekView";
import type { ShiftSlot } from "../../types/shiftSlot";
import { useShiftSlotTypes } from "../../queries/shiftSlotType.queries";
import { useDepartments } from "../../queries/department.queries";

const { Title, Text } = Typography;

type ViewMode = "week" | "month";

export function ShiftSlotCalendar() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedWeek, setSelectedWeek] = useState(dayjs().startOf("week"));
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [branchFilter, setBranchFilter] = useState<string>();
  const [departmentFilter, setDepartmentFilter] = useState<string>();
  const [typeFilter, setTypeFilter] = useState<string>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShiftSlot, setEditingShiftSlot] = useState<ShiftSlot | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDayShifts, setSelectedDayShifts] = useState<ShiftSlot[]>([]);

  // Determine date range based on view mode
  const startDate =
    viewMode === "week"
      ? selectedWeek.startOf("week")
      : selectedMonth.startOf("month");
  const endDate =
    viewMode === "week"
      ? selectedWeek.endOf("week")
      : selectedMonth.endOf("month");

  const { data: shiftSlots } = useShiftSlots({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    page: 1,
    limit: 1000,
    branchId: branchFilter,
    typeId: typeFilter,
    departmentId: departmentFilter,
  });

  const { data: branchesData } = useBranches({
    page: 1,
    limit: 100,
  });

  const { data: shiftSlotTypesData } = useShiftSlotTypes({
    page: 1,
    limit: 100,
  });

  const { data: departmentsData } = useDepartments({
    page: 1,
    limit: 100,
  });

  const createShiftSlotMutation = useCreateShiftSlot();
  const createManyShiftSlotsMutation = useCreateManyShiftSlots();
  const updateShiftSlotMutation = useUpdateShiftSlot();
  const deleteShiftSlotMutation = useDeleteShiftSlot();

  useEffect(() => {
    if (branchesData?.data) {
      if (branchesData?.data.length > 0) {
        setBranchFilter(branchesData?.data[0].id);
      }
    }
  }, [branchesData?.data]);

  const getShiftSlotsForDate = (date: Dayjs) => {
    const shifts =
      shiftSlots?.data?.filter((slot) =>
        dayjs(slot.date).isSame(date, "day")
      ) || [];

    return shifts.sort((a, b) => {
      const startDate = new Date(a.type.startDate);
      const endDate = new Date(b.type.endDate);
      return startDate.getTime() - endDate.getTime();
    });
  };

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    const shifts = getShiftSlotsForDate(date);

    if (shifts.length > 0) {
      setSelectedDayShifts(shifts);
      setIsDetailModalOpen(true);
    } else {
      // handleCreate();
    }
  };

  const handleWeekChange = (weekStart: Dayjs) => {
    setSelectedWeek(weekStart);
  };

  const dateCellRender = (date: Dayjs) => {
    const shifts = getShiftSlotsForDate(date);
    if (shifts.length === 0) return null;
    return (
      <div className="w-full">
        {shifts.map((shift) => (
          <div key={shift.id} className="mb-1">
            <Badge
              status={
                shift.signups.length === shift.capacity ? "success" : "default"
              }
              text={
                <Text ellipsis className="text-xs">
                  {shift.type?.name} - ({shift.signups.length})
                </Text>
              }
            />
          </div>
        ))}
      </div>
    );
  };

  const headerRender = ({ value, onChange }: any) => {
    return (
      <div className="flex items-center justify-between p-2">
        <Button
          icon={<LeftOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            const prev = value.subtract(1, "month");
            onChange(prev);
            setSelectedMonth(prev);
          }}
        />
        <Title level={4} className="m-0">
          Tháng {value.format("MM/YYYY")}
        </Title>
        <Button
          icon={<RightOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            const next = value.add(1, "month");
            onChange(next);
            setSelectedMonth(next);
          }}
        />
      </div>
    );
  };

  const handleCreate = () => {
    setEditingShiftSlot(null);
    setIsModalOpen(true);
  };

  const handleEdit = (shiftSlot: ShiftSlot) => {
    setEditingShiftSlot(shiftSlot);
    setIsModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteShiftSlotMutation.mutateAsync(id);
      setIsDetailModalOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingShiftSlot(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingShiftSlot) {
        await updateShiftSlotMutation.mutateAsync({
          id: editingShiftSlot.id,
          data: formData,
        });
      } else {
        await createShiftSlotMutation.mutateAsync(formData);
      }
      handleModalClose();
    } catch (error) {
      // Error is handled by the mutations
    }
  };

  const handleFormSubmitMany = async (formData: any) => {
    try {
      await createManyShiftSlotsMutation.mutateAsync(formData);
      handleModalClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleShiftSelect = (shift: ShiftSlot) => {
    setSelectedDate(dayjs(shift.date));
    setSelectedDayShifts([shift]);
    setIsDetailModalOpen(true);
  };

  return (
    <div>
      <Flex align="center" wrap gap={8} style={{ marginBottom: 16 }}>
        <Button.Group>
          <Button
            type={viewMode === "week" ? "primary" : "default"}
            icon={<UnorderedListOutlined />}
            onClick={() => setViewMode("week")}
          >
            Tuần
          </Button>
          <Button
            type={viewMode === "month" ? "primary" : "default"}
            icon={<CalendarOutlined />}
            onClick={() => setViewMode("month")}
          >
            Tháng
          </Button>
        </Button.Group>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm ca làm việc
        </Button>
      </Flex>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Flex className="w-full" align="center" gap={8}>
              <Typography.Text strong>Chi nhánh</Typography.Text>
              <Select
                placeholder="Lọc theo chi nhánh"
                value={branchFilter}
                onChange={setBranchFilter}
                className="w-full flex-1"
              >
                {branchesData?.data?.map((branch) => (
                  <Select.Option key={branch.id} value={branch.id}>
                    {branch.name}
                  </Select.Option>
                ))}
              </Select>
            </Flex>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Flex className="w-full" align="center" gap={8}>
              <Typography.Text strong className=" shrink-0">
                Phòng ban
              </Typography.Text>
              <Select
                allowClear
                placeholder="Lọc theo phòng ban"
                value={departmentFilter}
                onChange={setDepartmentFilter}
                className="w-full"
              >
                {departmentsData?.data?.map((department) => (
                  <Select.Option key={department.id} value={department.id}>
                    {department.name}
                  </Select.Option>
                ))}
              </Select>
            </Flex>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Lọc theo loại ca"
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
              className="w-full"
            >
              {shiftSlotTypesData?.data?.map((type) => (
                <Select.Option key={type.id} value={type.id}>
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              onClick={() => {
                setBranchFilter(undefined);
                setTypeFilter(undefined);
                setDepartmentFilter(undefined);
              }}
              className="w-full"
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {viewMode === "week" ? (
        <ShiftSlotWeekView
          selectedDate={selectedDate}
          onShiftSelect={handleShiftSelect}
          onWeekChange={handleWeekChange}
          getShiftSlotsForDate={getShiftSlotsForDate}
        />
      ) : (
        <Calendar
          cellRender={dateCellRender}
          headerRender={headerRender}
          onSelect={handleDateSelect}
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
      )}

      <Drawer
        title={editingShiftSlot ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc"}
        open={isModalOpen}
        onClose={handleModalClose}
        placement="right"
        footer={
          <div className="flex justify-end">
            <Button onClick={handleModalClose}>Đóng</Button>
          </div>
        }
        width={800}
      >
        <ShiftSlotForm
          shiftSlot={editingShiftSlot}
          onSubmit={handleFormSubmit}
          onSubmitMany={handleFormSubmitMany}
          onCancel={handleModalClose}
          loading={
            createShiftSlotMutation.isPending ||
            createManyShiftSlotsMutation.isPending ||
            updateShiftSlotMutation.isPending
          }
        />
      </Drawer>
      <Drawer
        title={`Ca làm việc - ${selectedDate.format("DD/MM/YYYY")}`}
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        placement="right"
        width={900}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>
          </div>
        }
      >
        <List
          itemLayout="vertical"
          dataSource={selectedDayShifts}
          renderItem={(shift) => (
            <ShiftSlotDetailItem
              onClose={() => setIsDetailModalOpen(false)}
              key={shift.id}
              shift={shift}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleteLoading={deleteShiftSlotMutation.isPending}
            />
          )}
        />
      </Drawer>
    </div>
  );
}
