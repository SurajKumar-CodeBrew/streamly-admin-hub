
import React from 'react';
import { TrendingUp, Users, Play, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/Dashboard/StatsCard';

const Analytics = () => {
  const analyticsData = [
    {
      title: 'Total Users',
      value: '8,429',
      change: '+18% from last month',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Content Views',
      value: '124.5K',
      change: '+25% from last month',
      changeType: 'positive' as const,
      icon: Play,
      color: 'bg-green-500'
    },
    {
      title: 'Revenue Growth',
      value: '+12.5%',
      change: 'Monthly growth rate',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Avg. Revenue/User',
      value: '$14.78',
      change: '+8% from last month',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'bg-orange-500'
    }
  ];

  const topContent = [
    { title: 'Action Movie Collection', views: 15420, category: 'Movies' },
    { title: 'Drama Series S1', views: 12340, category: 'Series' },
    { title: 'Comedy Specials', views: 9870, category: 'Comedy' },
    { title: 'Documentary Series', views: 8560, category: 'Documentary' },
    { title: 'Kids Animation', views: 7240, category: 'Kids' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="text-sm text-gray-500">
          Data updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">User growth chart would go here</p>
                <p className="text-sm text-gray-400">Integration with chart library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Revenue trends chart would go here</p>
                <p className="text-sm text-gray-400">Integration with chart library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Content */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{content.title}</h4>
                    <p className="text-sm text-gray-500">{content.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{content.views.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">views</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
