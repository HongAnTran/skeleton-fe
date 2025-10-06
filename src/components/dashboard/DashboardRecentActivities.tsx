import type { RecentActivity } from "../../types/dashboard";

interface DashboardRecentActivitiesProps {
  activities: RecentActivity[];
}

export function DashboardRecentActivities({
  activities,
}: DashboardRecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "shift_signup":
        return "📝";
      case "shift_cancel":
        return "❌";
      case "shift_swap":
        return "🔄";
      case "attendance":
        return "✅";
      default:
        return "📋";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "shift_signup":
        return "text-green-600 bg-green-100";
      case "shift_cancel":
        return "text-red-600 bg-red-100";
      case "shift_swap":
        return "text-blue-600 bg-blue-100";
      case "attendance":
        return "text-emerald-600 bg-emerald-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Vừa xong";
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Hoạt Động Gần Đây
      </h3>
      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Không có hoạt động gần đây
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(
                  activity.type
                )}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {activity.employeeName}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {activity.branchName}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {activity.departmentName}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs text-gray-500">
                  {formatDate(activity.date)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
