
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Play, Plus, Search, Filter, TrendingUp, Film, Tv, Radio, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import UploadM3UModal from '@/components/UploadM3UModal';
import { useToast } from '@/components/ui/use-toast';

interface MediaStatistics {
  totalLive: number;
  totalMovies: number;
  totalSeries: number;
  totalItems: number;
}

interface StatisticsResponse {
  message: string;
  data: {
    statistics: MediaStatistics;
    timestamps: {
      createdAt: string;
      lastUpdated: string;
    };
    hasData: boolean;
    recordId: string;
  };
  adminInfo: {
    requestedBy: string;
    requestedAt: string;
  };
}

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('playlists');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [statistics, setStatistics] = useState<MediaStatistics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [nextRefreshIn, setNextRefreshIn] = useState(300); // 5 minutes in seconds
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Dynamic playlists based on statistics
  const getDynamicPlaylists = () => {
    if (!statistics) return [];
    
    return [
      {
        id: 'movies',
        name: 'Movies',
        type: 'VOD',
        channels: statistics.totalMovies,
        status: 'active',
        icon: Film,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        lastUpdated: lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'N/A',
        navigationPath: '/dashboard/content/categories/movies'
      },
      {
        id: 'live-tv',
        name: 'Live TV',
        type: 'Live Channels',
        channels: statistics.totalLive,
        status: 'active',
        icon: Radio,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        lastUpdated: lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'N/A',
        navigationPath: '/dashboard/content/categories/live-tv'
      },
      {
        id: 'series',
        name: 'Series',
        type: 'VOD',
        channels: statistics.totalSeries,
        status: 'active',
        icon: Tv,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        lastUpdated: lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'N/A',
        navigationPath: '/dashboard/content/categories/series'
      }
    ];
  };

  const content = [
    {
      id: '1',
      title: 'The Great Adventure',
      type: 'Movie',
      category: 'Action',
      duration: '2h 15m',
      status: 'active',
      views: 1250
    },
    {
      id: '2',
      title: 'Mystery Series S1',
      type: 'Series',
      category: 'Drama',
      duration: '8 episodes',
      status: 'active',
      views: 3420
    }
  ];

  const fetchMediaStatistics = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin/media-statistics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Check if it's a 404 error (endpoint not found)
        if (response.status === 404) {
          // Use mock data as fallback when endpoint is not available
          const mockStatistics: MediaStatistics = {
            totalLive: 0,
            totalMovies: 0,
            totalSeries: 0,
            totalItems: 0
          };
          setStatistics(mockStatistics);
          setLastUpdated(null);
          toast({
            title: "Info",
            description: "Media statistics endpoint is not available. Using mock data.",
            variant: "default",
          });
          return;
        }

        let errorMessage = `Request failed with status ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }

        if (response.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminToken');
          window.location.href = '/';
          throw new Error('Authentication failed. Please log in again.');
        }

        throw new Error(errorMessage);
      }

      const data: StatisticsResponse = await response.json();
      
      // Check if the response has the expected structure
      if (data.data && data.data.statistics) {
        setStatistics(data.data.statistics);
        setLastUpdated(data.data.timestamps.lastUpdated);
        setNextRefreshIn(300); // Reset countdown to 5 minutes
        toast({
          title: "Success",
          description: "Media statistics loaded successfully!",
          variant: "default",
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      
      // If the error is due to network issues or endpoint not available, show mock data
      if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('404'))) {
        const mockStatistics: MediaStatistics = {
          totalLive: 0,
          totalMovies: 0,
          totalSeries: 0,
          totalItems: 0
        };
        setStatistics(mockStatistics);
        setLastUpdated(null);
        toast({
          title: "Info",
          description: "Backend endpoint not available. Contact your system administrator.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load media statistics",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingStats(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMediaStatistics();
  }, []);

  // Update current time every minute for dynamic timestamps
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Auto-refresh statistics and countdown timer
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setNextRefreshIn(prev => {
        if (prev <= 1) {
          fetchMediaStatistics();
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000); // Update every second

    return () => clearInterval(countdownTimer);
  }, []);

  const handleManualRefresh = () => {
    fetchMediaStatistics();
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCardClick = (navigationPath: string) => {
    navigate(navigationPath);
  };

  const handleUploadSuccess = () => {
    // Refresh statistics after successful upload
    fetchMediaStatistics();
    console.log('M3U playlist uploaded successfully!');
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatLastUpdated = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = currentTime; // Use dynamic current time instead of new Date()
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ title, value, icon: Icon, color }: { 
    title: string; 
    value: number; 
    icon: React.ElementType;
    color: string;
  }) => (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{formatNumber(value)}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {statistics === null ? "Loading..." : value > 0 ? "Items in library" : "No items found"}
        </p>
      </CardContent>
    </Card>
  );

  const StatCardSkeleton = () => (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <div className="flex items-center gap-4">
          {/* Last Updated Display */}
          {lastUpdated && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span>Last updated:</span>
                <span className="font-medium">{formatLastUpdated(lastUpdated)}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <span>Next refresh:</span>
                <span className="font-medium text-blue-600">{formatCountdown(nextRefreshIn)}</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="text-gray-600"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Playlist
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>
        </div>
      </div>

      {/* Media Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : statistics ? (
          <>
            <StatCard 
              title="Live Channels" 
              value={statistics.totalLive} 
              icon={Radio}
              color="text-red-500"
            />
            <StatCard 
              title="Movies" 
              value={statistics.totalMovies} 
              icon={Film}
              color="text-blue-500"
            />
            <StatCard 
              title="Series" 
              value={statistics.totalSeries} 
              icon={Tv}
              color="text-green-500"
            />
            <StatCard 
              title="Total Items" 
              value={statistics.totalItems} 
              icon={TrendingUp}
              color="text-purple-500"
            />
          </>
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Failed to load statistics</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsLoadingStats(true);
                fetchMediaStatistics();
              }}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="content">Content Library</TabsTrigger>
        </TabsList>

        <TabsContent value="playlists" className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search playlists..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Playlists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingStats ? (
              // Loading skeleton cards
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </>
            ) : getDynamicPlaylists().length > 0 ? (
              getDynamicPlaylists().map((playlist) => (
                <Card 
                  key={playlist.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleCardClick(playlist.navigationPath)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${playlist.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                      <playlist.icon className={`h-6 w-6 ${playlist.color}`} />
                    </div>
                    <Badge variant={playlist.status === 'active' ? 'default' : 'secondary'}>
                      {playlist.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {playlist.type} • {formatNumber(playlist.channels)} items
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Updated: {playlist.lastUpdated}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        // Add manage functionality here later
                        toast({
                          title: "Info",
                          description: "Manage functionality coming soon!",
                          variant: "default",
                        });
                      }}
                      className="hover:bg-gray-100"
                    >
                      Manage
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No playlist data available</p>
                <Button 
                  variant="outline" 
                  onClick={handleManualRefresh}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Content Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search content..." className="pl-10" />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {content.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mr-4">
                            <Play className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">ID: {item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload M3U Modal */}
      <UploadM3UModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default ContentManagement;
