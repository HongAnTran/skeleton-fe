import type { DashboardStats } from "../../types/dashboard";

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  const statsData = [
    {
      title: "Tổng Nhân Viên",
      value: stats.totalEmployees,
      icon: "👥",
      color: "bg-blue-500",
    },
    {
      title: "Tổng Chi Nhánh",
      value: stats.totalBranches,
      icon: "🏢",
      color: "bg-green-500",
    },
    {
      title: "Tổng Phòng Ban",
      value: stats.totalDepartments,
      icon: "🏬",
      color: "bg-purple-500",
    },
    {
      title: "Tổng Ca Làm",
      value: stats.totalShifts,
      icon: "⏰",
      color: "bg-orange-500",
    },
    {
      title: "Tổng Giờ Làm",
      value: stats.totalHours.toFixed(1),
      icon: "⏱️",
      color: "bg-indigo-500",
    },
    {
      title: "TB Giờ/Nhân Viên",
      value: stats.averageHoursPerEmployee.toFixed(1),
      icon: "📊",
      color: "bg-pink-500",
    },
    {
      title: "Tỷ Lệ Sử Dụng Ca",
      value: `${stats.shiftUtilizationRate.toFixed(1)}%`,
      icon: "📈",
      color: "bg-teal-500",
    },
    {
      title: "Tỷ Lệ Chuyên Cần",
      value: `${stats.attendanceRate.toFixed(1)}%`,
      icon: "✅",
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div
              className={`${stat.color} rounded-full p-3 text-white text-2xl`}
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
