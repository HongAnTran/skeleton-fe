import { useState } from "react";
import { Card, Button, Typography, Badge, Row, Col, Tag } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import type { Dayjs } from "dayjs";

// Cấu hình tuần bắt đầu từ Thứ 2
dayjs.extend(weekday);
dayjs.Ls.en.weekStart = 1; // 1 = Monday
import type { ShiftSlot } from "../types/shiftSlot";
import { useEmployeeAuth } from "../contexts/AuthEmployeeContext";
import { ShiftSignupStatus } from "../types/shiftSignup";

const { Title, Text } = Typography;

interface WeekViewProps {
  selectedDate: Dayjs;
  onDateSelect: (date: Dayjs) => void;
  onWeekChange: (weekStart: Dayjs) => void;
  getShiftSlotsForDate: (date: Dayjs) => ShiftSlot[];
}

export default function ShiftSlotWeekViewEmployee({
  selectedDate,
  onDateSelect,
  onWeekChange,
  getShiftSlotsForDate,
}: WeekViewProps) {
  const { employee } = useEmployeeAuth();

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
    <Card className="week-view">
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

      <Row gutter={[7, 7]}>
        {weekDays.map((day, index) => {
          const shifts = getShiftSlotsForDate(day);

          const dayOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index];

          return (
            <Col
              xs={24}
              sm={12}
              md={6}
              lg={6}
              xl={5}
              key={day.format("YYYY-MM-DD")}
            >
              <Card
                size="small"
                className={`
                  cursor-pointer transition-all duration-200 h-full min-h-[120px]
                  ${isToday(day) ? "bg-blue-50" : ""}
                  hover:shadow-md hover:border-blue-300
                `}
                onClick={() => onDateSelect(day)}
              >
                <div className="text-center mb-2 border-b border-gray-200 pb-2">
                  <div className="text-xs text-gray-500 font-medium">
                    {dayOfWeek}
                  </div>
                  <div
                    className={`
                      text-lg font-bold
                      ${isToday(day) ? "text-blue-600" : ""}
                    `}
                  >
                    {day.format("DD")}
                  </div>
                </div>
                <div className="space-y-1">
                  {shifts.length === 0 ? (
                    <div className="text-center py-2">
                      <Text type="secondary" className="text-xs">
                        Không có ca làm việc
                      </Text>
                    </div>
                  ) : (
                    shifts.map((shift) => {
                      const signups = shift.signups.filter(
                        (signup) =>
                          signup.status !== ShiftSignupStatus.CANCELLED
                      );
                      return (
                        <div key={shift.id} className="text-xs">
                          <Badge
                            status={
                              signups.length === shift.capacity
                                ? "success"
                                : "default"
                            }
                            text={
                              <>
                                <Text className=" font-bold">
                                  {shift.type?.name} ({signups.length} /{" "}
                                  {shift.capacity})
                                </Text>
                                <ul className="text-xs ml-8 list-decimal">
                                  {signups.map((signup) => (
                                    <li
                                      key={signup.id}
                                      className="flex items-center justify-between gap-2 mb-1"
                                    >
                                      <Tag color="green">
                                        {signup.employee?.name}
                                      </Tag>
                                      {signup.employee?.id === employee?.id && (
                                        <Tag color="blue">Bạn</Tag>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            }
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
}
