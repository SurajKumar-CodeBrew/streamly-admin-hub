
import React from 'react';
import { Users, DollarSign, Play, Activity } from 'lucide-react';
import StatsCard from '@/components/Dashboard/StatsCard';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$124,590',
      change: '+12% from last month',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Registered Users',
      value: '8,429',
      change: '+18% from last month',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Subscriptions',
      value: '6,891',
      change: '+5% from last month',
      changeType: 'positive' as const,
      icon: Play,
      color: 'bg-purple-500'
    },
    {
      title: 'Daily Active Users',
      value: '2,341',
      change: '+8% from yesterday',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'bg-orange-500'
    }
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'Subscribed to Premium Plan', time: '2 minutes ago' },
    { id: 2, user: 'Sarah Wilson', action: 'Uploaded new content', time: '15 minutes ago' },
    { id: 3, user: 'Mike Johnson', action: 'Updated profile', time: '1 hour ago' },
    { id: 4, user: 'Emma Davis', action: 'Cancelled subscription', time: '2 hours ago' },
    { id: 5, user: 'Alex Chen', action: 'Created new playlist', time: '3 hours ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
