import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Play, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { getHighQualityImage } from '@/lib/utils';

interface ContentItem {
  title: string;
  logo: string;
  group: string;
  url: string;
}

interface ContentResponse {
  message: string;
  data: {
    category: string;
    totalItems: number;
    data: {
      movies?: ContentItem[];
      series?: ContentItem[];
      channels?: ContentItem[];
    };
  };
}

const ContentList = () => {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Configuration for different types
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'live-tv':
        return {
          title: 'Live Channels',
          dataKey: 'channels',
          itemType: 'Channel'
        };
      case 'movies':
        return {
          title: 'Movies',
          dataKey: 'movies',
          itemType: 'Movie'
        };
      case 'series':
        return {
          title: 'Series',
          dataKey: 'series',
          itemType: 'Series'
        };
      default:
        return {
          title: 'Content',
          dataKey: 'movies',
          itemType: 'Item'
        };
    }
  };

  const config = getTypeConfig(type || '');

  const fetchCategoryContent = async () => {
    if (!category) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // URL encode the category parameter
      const encodedCategory = encodeURIComponent(category);
      const apiType = type === 'live-tv' ? 'live' : type;
      
      const response = await fetch(`/api/admin/category-data?type=${apiType}&category=${encodedCategory}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
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

      const data: ContentResponse = await response.json();
      
      if (data.data) {
        setCategoryName(data.data.category);
        setTotalItems(data.data.totalItems);
        
        // Get the appropriate data array based on content type
        const items = data.data.data[config.dataKey as keyof typeof data.data.data] || [];
        setContentItems(items);
        
        toast({
          title: "Success",
          description: `${config.title} loaded successfully!`,
          variant: "default",
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching category content:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (category && type) {
      fetchCategoryContent();
    }
  }, [category, type]);



  // Filter content based on search term
  const filteredContent = contentItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWatchContent = (item: ContentItem) => {
    // For series, navigate to series details page, otherwise go to video player
    if (type === 'series') {
      const seriesUrl = `/dashboard/content/series?${new URLSearchParams({
        title: item.title,
        poster: getHighQualityImage(item.logo),
        category: category || '',
        type: type || ''
      }).toString()}`;
      
      navigate(seriesUrl);
      
      toast({
        title: "Opening Series",
        description: `Loading episodes for "${item.title}"`,
        variant: "default",
      });
    } else {
      // For movies and live channels, go directly to video player
      const playerUrl = `/dashboard/content/player?${new URLSearchParams({
        url: item.url,
        title: item.title,
        poster: getHighQualityImage(item.logo),
        category: category || '',
        type: type || ''
      }).toString()}`;
      
      navigate(playerUrl);
      
      toast({
        title: "Opening Video Player",
        description: `Playing "${item.title}"`,
        variant: "default",
      });
    }
  };

  const ContentSkeleton = () => (
    <Card className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="aspect-[2/3] relative">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dashboard/content/categories/${type}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Categories</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {categoryName || category}
            </h1>
            <p className="text-sm text-gray-500">
              {isLoading ? 'Loading...' : `${totalItems} ${config.itemType.toLowerCase()}s available`}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder={`Search ${config.title.toLowerCase()}...`}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        {searchTerm && (
          <div className="mt-4 text-sm text-gray-500">
            Found {filteredContent.length} items matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{config.title}</h2>
          <Badge variant="secondary">
            {isLoading ? '...' : filteredContent.length} items
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 12 }).map((_, index) => (
              <ContentSkeleton key={index} />
            ))
          ) : filteredContent.length > 0 ? (
            filteredContent.map((item, index) => (
                             <Card 
                 key={index} 
                 className="bg-white shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden group cursor-pointer"
                 onClick={() => handleWatchContent(item)}
              >
                                 <div className="aspect-[2/3] relative overflow-hidden">
                   {item.logo ? (
                     <img
                       src={getHighQualityImage(item.logo)}
                       alt={item.title}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDI0MCAzNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMzYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05NiAxNDRIMTQ0VjE5Mkg5NlYxNDRaIiBmaWxsPSIjOUI5Q0EwIi8+CjxwYXRoIGQ9Ik0xMTIgMTYwSDE2MFYxNzZIMTEyVjE2MFoiIGZpbGw9IiM5QjlDQTAiLz4KPC9zdmc+';
                       }}
                     />
                   ) : (
                     <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                       <Play className="h-12 w-12 text-gray-400" />
                     </div>
                   )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-2">
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {config.itemType}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No content found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm ? 'Try adjusting your search terms' : 'This category appears to be empty'}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentList; 