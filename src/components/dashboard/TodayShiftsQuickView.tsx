import { Card, Tag, Collapse, Spin } from "antd";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useShiftSlots } from "../../queries/shiftSlot.queries";
import { useBranches } from "../../queries/branch.queries";
import type { ShiftSlot } from "../../types/shiftSlot";
import { ShiftSignupStatus } from "../../types/shiftSignup";

interface TodayShiftsQuickViewProps {
  branchId?: string;
  onShiftClick?: (shift: ShiftSlot) => void;
}

export function TodayShiftsQuickView({
  branchId,
  onShiftClick,
}: TodayShiftsQuickViewProps) {
  const today = dayjs();
  const todayStart = today.startOf("day").toISOString();
  const todayEnd = today.endOf("day").toISOString();

  // Get branches to use first branch if branchId not provided
  const { data: branchesData } = useBranches({ page: 1, limit: 100 });
  const effectiveBranchId =
    branchId || branchesData?.data?.[0]?.id || undefined;

  const { data: shiftSlotsData, isLoading } = useShiftSlots(
    {
      startDate: todayStart,
      endDate: todayEnd,
      page: 1,
      limit: 1000,
      branchId: effectiveBranchId,
    },
    {
      enabled: !!effectiveBranchId,
    }
  );

  const todayShifts =
    shiftSlotsData?.data?.filter((slot) =>
      dayjs(slot.date).isSame(today, "day")
    ) || [];

  // Sort shifts by start time
  const sortedShifts = [...todayShifts].sort((a, b) => {
    const startA = new Date(a.type.startDate);
    const startB = new Date(b.type.startDate);
    return startA.getTime() - startB.getTime();
  });

  if (isLoading) {
    return (
      <Card className="mb-4 border-blue-200 bg-blue-50/50">
        <div className="flex items-center justify-center py-4">
          <Spin />
        </div>
      </Card>
    );
  }

  if (sortedShifts.length === 0) {
    return null;
  }

  return (
    <Card
      className="mb-4 border-blue-200 bg-blue-50/50"
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-blue-500" />
          <span className="font-semibold text-blue-700">
            Lịch hôm nay ({today.format("DD/MM/YYYY")})
          </span>
          <Tag color="blue" className="ml-auto">
            {sortedShifts.length} ca
          </Tag>
        </div>
      }
    >
      <Collapse
        items={[
          {
            key: "today-shifts",
            label: `Xem chi tiết ${sortedShifts.length} ca làm việc`,
            children: (
              <div className="space-y-3 mt-2">
                {sortedShifts.map((shift) => {
                  const signups = shift.signups.filter(
                    (signup) => signup.status !== ShiftSignupStatus.CANCELLED
                  );
                  const type = shift.type;
                  const isAvailable = signups.length < shift.capacity;
                  return (
                    <div
                      key={shift.id}
                      className={`p-3 rounded-lg border border-gray-200 bg-white  max-w-xl ${
                        onShiftClick
                          ? "cursor-pointer hover:shadow-md transition-shadow"
                          : ""
                      }`}
                      onClick={() => onShiftClick?.(shift)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Tag
                            color={type?.name === "Ca sáng" ? "green" : "blue"}
                          >
                            {type?.name || "Ca làm việc"}
                          </Tag>
                          <span className="text-xs text-muted-foreground">
                            {shift.department?.name || "Phòng"}
                          </span>
                        </div>
                        {isAvailable ? (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-xs text-muted-foreground">
                              Còn trống ({signups.length}/{shift.capacity})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-red-500">Đã đầy</span>
                        )}
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

                      {signups.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground mb-1">
                            Nhân viên đã đăng ký ({signups.length}):
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {signups.map((signup) => {
                              const status = signup.status;
                              return (
                                <Tag
                                  key={signup.id}
                                  color={
                                    status === ShiftSignupStatus.COMPLETED
                                      ? "green"
                                      : "orange"
                                  }
                                  className="text-xs"
                                >
                                  {signup.employee?.name}{" "}
                                  {signup.employee?.role && (
                                    <b>({signup.employee?.role})</b>
                                  )}
                                </Tag>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ),
          },
        ]}
        ghost
      />
    </Card>
  );
}
