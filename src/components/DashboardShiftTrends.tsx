import type { ShiftTrend } from "../types/dashboard";

interface DashboardShiftTrendsProps {
  trends: ShiftTrend[];
}

export function DashboardShiftTrends({ trends }: DashboardShiftTrendsProps) {
  const maxShifts = Math.max(...trends.map((t) => t.totalShifts));
  const maxHours = Math.max(...trends.map((t) => t.totalHours));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Xu Hướng Ca Làm (7 Ngày Gần Đây)
      </h3>
      <div className="space-y-4">
        {trends.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Không có dữ liệu xu hướng
          </p>
        ) : (
          trends.map((trend, index) => {
            const shiftPercentage =
              maxShifts > 0 ? (trend.totalShifts / maxShifts) * 100 : 0;
            const hoursPercentage =
              maxHours > 0 ? (trend.totalHours / maxHours) * 100 : 0;

            return (
              <div
                key={index}
                className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(trend.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-sm text-gray-500">
                    {trend.utilizationRate.toFixed(1)}% sử dụng
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ca Làm</span>
                    <span className="font-medium">{trend.totalShifts}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${shiftPercentage}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giờ Làm</span>
                    <span className="font-medium">
                      {trend.totalHours.toFixed(1)}h
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${hoursPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
