import { useState, useMemo } from "react";
import { Card, Button, Typography, Tag, Space, Badge } from "antd";
import {
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
  TeamOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import type { Dayjs } from "dayjs";

// Cấu hình tuần bắt đầu từ Thứ 2
dayjs.extend(weekday);
dayjs.Ls.en.weekStart = 1; // 1 = Monday
import type { ShiftSlot } from "../../types/shiftSlot";
import { useEmployeeAuth } from "../../contexts/AuthEmployeeContext";
import { ShiftSignupStatus } from "../../types/shiftSignup";
import { useCreateManyShiftSignups } from "../../queries/shiftSignup.queries";
import { useMyLeaveRequests } from "../../queries/leaveRequest.queries";
import { LeaveRequestStatus } from "../../types/leaveRequest";

const { Title, Text } = Typography;

interface WeekViewProps {
  selectedDate: Dayjs;
  onWeekChange: (weekStart: Dayjs) => void;
  getShiftSlotsForDate: (date: Dayjs) => ShiftSlot[];
}

export default function ShiftSlotWeekViewEmployee({
  selectedDate,
  onWeekChange,
  getShiftSlotsForDate,
}: WeekViewProps) {
  const { employee } = useEmployeeAuth();

  const [currentWeekStart, setCurrentWeekStart] = useState(
    selectedDate.startOf("week")
  );
  const [isSelectingMode, setIsSelectingMode] = useState(false);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  const createManyMutation = useCreateManyShiftSignups();

  // Lấy các đơn xin off pending và approved của tuần hiện tại
  const weekEnd = currentWeekStart.add(6, "day");
  const { data: leaveRequestsData } = useMyLeaveRequests({
    startDateFrom: currentWeekStart.startOf("day").toISOString(),
    endDateTo: weekEnd.endOf("day").toISOString(),
  });

  // Lọc các leave requests có status PENDING hoặc APPROVED
  const activeLeaveRequests = useMemo(() => {
    if (!leaveRequestsData?.data) return [];
    return leaveRequestsData.data.filter(
      (req) =>
        req.status === LeaveRequestStatus.PENDING ||
        req.status === LeaveRequestStatus.APPROVED
    );
  }, [leaveRequestsData]);

  // Kiểm tra xem một ngày có nằm trong khoảng thời gian nghỉ phép không
  const isDateOnLeave = (date: Dayjs) => {
    return activeLeaveRequests.some((req) => {
      const startDate = dayjs(req.startDate).startOf("day");
      const endDate = dayjs(req.endDate).endOf("day");
      const dateStart = date.startOf("day");
      return (
        (dateStart.isAfter(startDate, "day") ||
          dateStart.isSame(startDate, "day")) &&
        (dateStart.isBefore(endDate, "day") || dateStart.isSame(endDate, "day"))
      );
    });
  };

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    currentWeekStart.add(i, "day")
  );

  const handlePrevWeek = () => {
    const prevWeek = currentWeekStart.subtract(1, "week");
    setCurrentWeekStart(prevWeek);
    onWeekChange(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = currentWeekStart.add(1, "week");
    setCurrentWeekStart(nextWeek);
    onWeekChange(nextWeek);
  };

  const handleStartSelecting = () => {
    setIsSelectingMode(true);
    setSelectedSlotIds([]);
  };

  const handleCancelSelecting = () => {
    setIsSelectingMode(false);
    setSelectedSlotIds([]);
  };

  const handleToggleSlot = (slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleConfirmSelection = async () => {
    if (selectedSlotIds.length === 0) return;

    try {
      await createManyMutation.mutateAsync({ slotIds: selectedSlotIds });
      setIsSelectingMode(false);
      setSelectedSlotIds([]);
    } catch (error) {
      console.error("Error creating shift signups:", error);
    }
  };

  const isToday = (date: Dayjs) => date.isSame(dayjs(), "day");

  return (
    <Card className="week-view">
      {/* Header với navigation */}
      <div className="flex flex-col lg:flex-row items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-2 justify-center flex-1">
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrevWeek}
            disabled={isSelectingMode}
          />
          <Title level={5} className="m-0 lg:min-w-[200px] text-center">
            {currentWeekStart.format("DD/MM")} -{" "}
            {currentWeekStart.add(6, "day").format("DD/MM/YYYY")}
          </Title>
          <Button
            icon={<RightOutlined />}
            onClick={handleNextWeek}
            disabled={isSelectingMode}
          />
        </div>

        <div className="md:static fixed bottom-0 left-0 right-0 z-50 md:z-auto bg-white md:bg-transparent py-3 md:py-0 -mx-6 md:mx-0 px-6 md:px-0 shadow-lg md:shadow-none border-t md:border-t-0 border-gray-200">
          <Space className="w-full md:w-auto justify-center md:justify-end">
            {!isSelectingMode ? (
              <Button type="primary" onClick={handleStartSelecting}>
                Bắt đầu đăng ký
              </Button>
            ) : (
              <>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={handleCancelSelecting}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleConfirmSelection}
                  disabled={selectedSlotIds.length === 0}
                  loading={createManyMutation.isPending}
                >
                  Xác nhận
                  {selectedSlotIds.length > 0 && (
                    <span className="ml-1">({selectedSlotIds.length})</span>
                  )}
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weekDays.map((day, index) => {
          const shifts = getShiftSlotsForDate(day);

          const dayOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index];

          return (
            <Card
              key={day.format("YYYY-MM-DD")}
              className={`
                p-4 transition-all duration-200 h-full min-h-[200px]
              `}
            >
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`text-sm text-muted-foreground ${
                      isToday(day) ? "text-green-500 font-bold" : ""
                    }`}
                  >
                    {dayOfWeek}
                  </div>
                  {isDateOnLeave(day) && (
                    <Tag color="orange" className="text-xs">
                      Nghỉ phép
                    </Tag>
                  )}
                </div>
                <div
                  className={`text-2xl font-semibold text-foreground ${
                    isToday(day) ? "text-green-500 font-bold" : ""
                  }`}
                >
                  {day.format("DD")}
                </div>
              </div>

              <div className="space-y-2">
                {shifts.length === 0 ? (
                  <div className="text-center py-2">
                    <Text type="secondary" className="text-xs">
                      Không có ca làm việc
                    </Text>
                  </div>
                ) : (
                  shifts.map((shift) => {
                    const signups = shift.signups.filter(
                      (signup) => signup.status !== ShiftSignupStatus.CANCELLED
                    );
                    const type = shift.type;
                    const isAvailable = signups.length < shift.capacity;
                    const isSelected = selectedSlotIds.includes(shift.id);
                    const isEmployeeSignedUp = signups.some(
                      (signup) => signup.employee.id === employee?.id
                    );
                    const isDayOnLeave = isDateOnLeave(day);

                    return (
                      <button
                        key={shift.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            isSelectingMode &&
                            isAvailable &&
                            !isEmployeeSignedUp &&
                            !isDayOnLeave
                          ) {
                            handleToggleSlot(shift.id);
                          }
                        }}
                        disabled={
                          !isSelectingMode ||
                          !isAvailable ||
                          isEmployeeSignedUp ||
                          isDayOnLeave
                        }
                        className={`w-full text-left p-3 rounded-lg border border-gray-200 transition-all ${
                          isSelectingMode
                            ? isSelected
                              ? "border-blue-500 bg-blue-50 border-2"
                              : isAvailable &&
                                  !isEmployeeSignedUp &&
                                  !isDayOnLeave
                                ? "border-gray-200  hover:bg-blue-50 "
                                : "border-gray-200 opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Tag
                            color={type?.name === "Ca sáng" ? "green" : "blue"}
                          >
                            {type?.name || "Ca làm việc"}
                          </Tag>
                          <div className="flex items-center gap-2">
                            {isSelectingMode && isSelected && (
                              <CheckOutlined className="text-blue-500 font-bold text-lg" />
                            )}
                            {isAvailable ? (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-xs text-muted-foreground">
                                  Còn trống (
                                  {`${signups.length}/${shift.capacity}`})
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-red-500">
                                Đã đầy
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-sm text-foreground mb-2">
                          <ClockCircleOutlined className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-mono">
                            {type?.startDate &&
                              type?.endDate &&
                              `${dayjs(type.startDate).format(
                                "HH:mm"
                              )} - ${dayjs(type.endDate).format("HH:mm")}`}
                          </span>
                        </div>

                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <TeamOutlined className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {shift.department?.name || "Phòng"}
                          </span>
                        </div>

                        {signups.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-muted-foreground mb-1">
                              Đã đăng ký ({signups.length}):
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {signups.map((signup) => {
                                const status = signup.status;
                                return (
                                  <div>
                                    <Tag
                                      key={signup.id}
                                      className="text-xs"
                                      color={
                                        status === ShiftSignupStatus.CANCELLED
                                          ? "red"
                                          : status ===
                                              ShiftSignupStatus.COMPLETED
                                            ? "green"
                                            : "orange"
                                      }
                                    >
                                      {signup.employee?.name}{" "}
                                      {signup.employee?.role && (
                                        <b>({signup.employee?.role}) </b>
                                      )}
                                    </Tag>
                                    {signup.employee.id === employee?.id && (
                                      <Tag color="green" className="text-xs">
                                        Bạn
                                      </Tag>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {shift.note && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <div className=" flex items-center gap-1">
                              <b>Ghi chú:</b>
                              <span className="text-muted-foreground">
                                {shift.note || "-"}
                              </span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}
