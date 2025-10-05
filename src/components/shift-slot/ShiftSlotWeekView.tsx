import { useState } from "react";
import { Card, Button, Typography, Tag } from "antd";
import {
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import type { Dayjs } from "dayjs";

// Cấu hình tuần bắt đầu từ Thứ 2
dayjs.extend(weekday);
dayjs.Ls.en.weekStart = 1; // 1 = Monday
import type { ShiftSlot } from "../../types/shiftSlot";
import { ShiftSignupStatus } from "../../types/shiftSignup";

const { Title, Text } = Typography;

interface WeekViewProps {
  selectedDate: Dayjs;
  onShiftSelect: (shift: ShiftSlot) => void;
  onWeekChange: (weekStart: Dayjs) => void;
  getShiftSlotsForDate: (date: Dayjs) => ShiftSlot[];
}

export default function ShiftSlotWeekView({
  selectedDate,
  onShiftSelect,
  onWeekChange,
  getShiftSlotsForDate,
}: WeekViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    selectedDate.startOf("week")
  );

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

  const isToday = (date: Dayjs) => date.isSame(dayjs(), "day");

  return (
    <div className="week-view">
      {/* Header với navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 justify-center flex-1">
          <Button icon={<LeftOutlined />} onClick={handlePrevWeek} />
          <Title level={5} className="m-0 lg:min-w-[200px] text-center">
            {currentWeekStart.format("DD/MM")} -{" "}
            {currentWeekStart.add(6, "day").format("DD/MM/YYYY")}
          </Title>
          <Button icon={<RightOutlined />} onClick={handleNextWeek} />
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
                p-4 cursor-pointer transition-all duration-200 h-full min-h-[200px]
                ${isToday(day) ? "bg-blue-50" : ""}
                hover:shadow-md hover:border-blue-300
              `}
            >
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="text-sm text-muted-foreground">{dayOfWeek}</div>
                <div className="text-2xl font-semibold text-foreground">
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
                    const isAvailable = signups.length < shift.capacity; // Default max signups

                    return (
                      <button
                        key={shift.id}
                        className={`w-full cursor-pointer text-left p-3 rounded-lg border transition-all ${
                          isAvailable
                            ? "border-gray-300 hover:border-primary/50 hover:bg-secondary/80 hover:border-blue-300"
                            : "border-gray-300 bg-muted/30 opacity-50 cursor-not-allowed"
                        }`}
                        onClick={() => onShiftSelect(shift)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Tag
                            color={type?.name === "Ca sáng" ? "green" : "blue"}
                          >
                            {type?.name || "Ca làm việc"}
                          </Tag>
                          {isAvailable ? (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-xs text-muted-foreground">
                                Còn trống (
                                {`${signups.length}/${shift.capacity}`})
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Đã đầy
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-sm text-foreground mb-2">
                          <ClockCircleOutlined className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-mono">
                            {type?.startDate &&
                              type?.endDate &&
                              `${dayjs(type.startDate).format("HH:mm")} - ${dayjs(type.endDate).format("HH:mm")}`}
                          </span>
                        </div>

                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <TeamOutlined className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {shift.department?.name || "Phòng"}
                          </span>
                        </div>

                        {signups.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <div className="text-xs text-muted-foreground mb-1">
                              Đã đăng ký ({signups.length}):
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {signups.map((signup) => (
                                <Tag
                                  key={signup.id}
                                  color="gold"
                                  className="text-xs"
                                >
                                  {signup.employee?.name}
                                </Tag>
                              ))}
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
    </div>
  );
}
