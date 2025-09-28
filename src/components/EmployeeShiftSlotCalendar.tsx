import { useState } from "react";
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
  Modal,
  Tag,
} from "antd";
import {
  CalendarOutlined,
  UnorderedListOutlined,
  LeftOutlined,
  RightOutlined,
  CheckOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import type { Dayjs } from "dayjs";

// Cấu hình tuần bắt đầu từ Thứ 2
dayjs.extend(weekday);
dayjs.Ls.en.weekStart = 1; // 1 = Monday

import { useShiftSlotsByEmployee } from "../queries/shiftSlot.queries";
import { useShiftSlotTypes } from "../queries/shiftSlotType.queries";
import {
  useCancelShiftSignup,
  useCreateShiftSignup,
} from "../queries/shiftSignup.queries";
import type { ShiftSlot } from "../types/shiftSlot";
import ShiftSlotWeekViewEmployee from "./ShiftSlotWeekViewEmployee";
import { useEmployeeAuth } from "../contexts/AuthEmployeeContext";
import type { ShiftSignup } from "../types/shiftSignup";
import { ShiftSignupCancelModal } from "./ShiftSignupCancelModal";

const { Title, Text } = Typography;

type ViewMode = "week" | "month";

interface EmployeeShiftSlotDetailItemProps {
  shift: ShiftSlot;
  onSignup: (shiftSlot: ShiftSlot) => void;
  onCancel: (shiftSlotSignup: ShiftSignup) => void;
}

function EmployeeShiftSlotDetailItem({
  shift,
  onSignup,
  onCancel,
}: EmployeeShiftSlotDetailItemProps) {
  const { employee } = useEmployeeAuth();
  const isAtCapacity = shift.signups.length >= shift.capacity;

  return (
    <List.Item>
      <Card size="small" className="w-full">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="mb-2">
              <Text strong className="text-lg">
                {shift.type?.name || "N/A"}
              </Text>
            </div>

            <div className="mb-2">
              <Text type="secondary">
                Thời gian: {dayjs(shift.type?.startDate).format("HH:mm")} -{" "}
                {dayjs(shift.type?.endDate).format("HH:mm")}
              </Text>
            </div>

            <div className="mb-2">
              <Text type="secondary">
                Tối đa: {shift.signups.length}/{shift.capacity} người
              </Text>
              <div className="mt-1">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${(shift.signups.length / shift.capacity) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {shift.note && (
              <div className="mb-2">
                <Text type="secondary">Ghi chú: {shift.note}</Text>
              </div>
            )}

            <div className="mb-2">
              {shift.signups && shift.signups.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {shift.signups.map((signup, index) => (
                      <div key={index}>
                        <Tag color="blue">{signup.employee?.name}</Tag>

                        {signup.employee.id === employee?.id && (
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => onCancel(signup)}
                          >
                            Hủy
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="ml-4">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onSignup(shift)}
              disabled={isAtCapacity}
              size="large"
            >
              {isAtCapacity ? "Đã đầy" : "Đăng ký"}
            </Button>
          </div>
        </div>
      </Card>
    </List.Item>
  );
}

export function EmployeeShiftSlotCalendar() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedWeek, setSelectedWeek] = useState(dayjs().startOf("week"));
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [typeFilter, setTypeFilter] = useState<string>();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDayShifts, setSelectedDayShifts] = useState<ShiftSlot[]>([]);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [selectedShiftForSignup, setSelectedShiftForSignup] =
    useState<ShiftSlot | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedSignup, setSelectedSignup] = useState<ShiftSignup | null>(
    null
  );
  const [cancelReason, setCancelReason] = useState("");
  const cancelShiftSignupMutation = useCancelShiftSignup();

  const startDate =
    viewMode === "week"
      ? selectedWeek.startOf("week")
      : selectedMonth.startOf("month");
  const endDate =
    viewMode === "week"
      ? selectedWeek.endOf("week")
      : selectedMonth.endOf("month");

  const { data: shiftSlots, refetch } = useShiftSlotsByEmployee({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    typeId: typeFilter,
  });

  const { data: shiftSlotTypesData } = useShiftSlotTypes({
    page: 1,
    limit: 1000,
  });

  const createShiftSignupMutation = useCreateShiftSignup();

  const filteredShiftSlots = shiftSlots?.filter((slot) => {
    if (typeFilter && slot.type?.id !== typeFilter) return false;
    return true;
  });

  const getShiftSlotsForDate = (date: Dayjs) => {
    return (
      filteredShiftSlots?.filter((slot) =>
        dayjs(slot.date).isSame(date, "day")
      ) || []
    );
  };

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    const shifts = getShiftSlotsForDate(date);

    if (shifts.length > 0) {
      setSelectedDayShifts(shifts);
      setIsDetailModalOpen(true);
    }
  };

  const handleWeekChange = (weekStart: Dayjs) => {
    setSelectedWeek(weekStart);
  };

  const handleSignup = (shiftSlot: ShiftSlot) => {
    setSelectedShiftForSignup(shiftSlot);
    setIsSignupModalOpen(true);
  };

  const handleConfirmSignup = async () => {
    if (!selectedShiftForSignup) return;

    try {
      await createShiftSignupMutation.mutateAsync({
        slotId: selectedShiftForSignup.id,
      });
      setIsSignupModalOpen(false);
      setSelectedShiftForSignup(null);
      setIsDetailModalOpen(false);
      refetch();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCancelSignup = (shiftSlotSignup: ShiftSignup) => {
    setSelectedSignup(shiftSlotSignup);
    setIsCancelModalOpen(true);
  };
  const handleConfirmCancel = async () => {
    if (!selectedSignup) return;
    await cancelShiftSignupMutation.mutateAsync({
      id: selectedSignup.id,
      data: {
        cancelReason: cancelReason,
      },
    });

    setIsCancelModalOpen(false);
    setSelectedSignup(null);
    setCancelReason("");
    refetch();
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
                shift.signups.length >= shift.capacity
                  ? "success"
                  : shift.signups.length > 0
                    ? "processing"
                    : "default"
              }
              text={
                <Text ellipsis className="text-xs">
                  {shift.type?.name} - ({shift.signups.length}/{shift.capacity})
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

  return (
    <Card>
      <div className="mb-4">
        <Title level={4} className="m-0">
          Đăng Ký Ca Làm Việc
        </Title>
        <Text type="secondary">
          Bấm vào ngày để xem chi tiết ca làm việc và đăng ký
        </Text>
      </div>

      <div className="mb-4">
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
      </div>

      <Card size="small" className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
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
          <Col xs={24} sm={12} md={8}>
            <Button
              onClick={() => {
                setTypeFilter(undefined);
              }}
              className="w-full"
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {viewMode === "week" ? (
        <ShiftSlotWeekViewEmployee
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
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
          validRange={[dayjs(), dayjs().add(1, "month")]}
        />
      )}

      <Drawer
        title={`Ca làm việc - ${selectedDate.format("DD/MM/YYYY")}`}
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        placement="right"
        width={900}
      >
        <List
          itemLayout="vertical"
          dataSource={selectedDayShifts}
          renderItem={(shift) => (
            <EmployeeShiftSlotDetailItem
              key={shift.id}
              shift={shift}
              onSignup={handleSignup}
              onCancel={handleCancelSignup}
            />
          )}
        />
      </Drawer>

      {/* Signup Confirmation Modal */}
      <Modal
        title="Xác nhận đăng ký ca làm việc"
        open={isSignupModalOpen}
        onOk={handleConfirmSignup}
        onCancel={() => {
          setIsSignupModalOpen(false);
          setSelectedShiftForSignup(null);
        }}
        okText="Đăng ký"
        cancelText="Hủy"
        confirmLoading={createShiftSignupMutation.isPending}
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        {selectedShiftForSignup && (
          <div className="space-y-4">
            <div>
              <Text strong>Chi tiết ca làm việc:</Text>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-2">
                <Text type="secondary">
                  Loại ca: {selectedShiftForSignup.type?.name}
                </Text>
              </div>
              <div className="mb-2">
                <Text type="secondary">
                  Ngày:{" "}
                  {dayjs(selectedShiftForSignup.date).format("DD/MM/YYYY")}
                </Text>
              </div>
              <div className="mb-2">
                <Text type="secondary">
                  Thời gian:{" "}
                  {dayjs(selectedShiftForSignup.type?.startDate).format(
                    "HH:mm"
                  )}{" "}
                  -{" "}
                  {dayjs(selectedShiftForSignup.type?.endDate).format("HH:mm")}
                </Text>
              </div>
              <div>
                <Text type="secondary">
                  Đã đăng ký: {selectedShiftForSignup.signups.length}/
                  {selectedShiftForSignup.capacity} người
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ShiftSignupCancelModal
        open={isCancelModalOpen}
        signup={selectedSignup}
        cancelReason={cancelReason}
        onCancelReasonChange={setCancelReason}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </Card>
  );
}
