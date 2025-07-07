
import React from 'react';
import { Plus, Edit, Trash2, Crown, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SubscriptionPlans = () => {
  const plans = [
    {
      id: '1',
      name: 'Basic',
      price: '$9.99',
      period: 'month',
      features: ['HD Streaming', '1 Device', 'Limited Content'],
      subscribers: 234,
      status: 'active',
      icon: Star,
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Premium',
      price: '$19.99',
      period: 'month',
      features: ['4K Streaming', '4 Devices', 'Full Content Library', 'Download'],
      subscribers: 567,
      status: 'active',
      icon: Crown,
      color: 'bg-purple-500'
    },
    {
      id: '3',
      name: 'Ultimate',
      price: '$29.99',
      period: 'month',
      features: ['4K Streaming', 'Unlimited Devices', 'Full Content', 'Download', 'Early Access'],
      subscribers: 123,
      status: 'active',
      icon: Zap,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className={`${plan.color} p-3 rounded-xl`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                  {plan.status}
                </Badge>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">/{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {plan.subscribers} active subscribers
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Plan Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">924</div>
            <div className="text-sm text-gray-600">Total Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">$18,456</div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">61.4%</div>
            <div className="text-sm text-gray-600">Premium Conversion</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
