import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Play, Tv, Film, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface CategoryResponse {
  message: string;
  data: {
    totalItems: number;
    categories: string[];
  };
}

const CategoryDetails = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Configuration for different types
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'live-tv':
        return {
          title: 'Live TV Categories',
          apiType: 'live',
          icon: Radio,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200'
        };
      case 'movies':
        return {
          title: 'Movie Categories',
          apiType: 'movies',
          icon: Film,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200'
        };
      case 'series':
        return {
          title: 'Series Categories',
          apiType: 'series',
          icon: Tv,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200'
        };
      default:
        return {
          title: 'Categories',
          apiType: type,
          icon: Play,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getTypeConfig(type || '');

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/categories?type=${config.apiType}`, {
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

      const data: CategoryResponse = await response.json();
      
      if (data.data && data.data.categories) {
        setCategories(data.data.categories);
        setTotalItems(data.data.totalItems);
        toast({
          title: "Success",
          description: `${config.title} loaded successfully!`,
          variant: "default",
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (type) {
      fetchCategories();
    }
  }, [type]);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CategorySkeleton = () => (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
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
            onClick={() => navigate('/dashboard/content')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Content</span>
          </Button>
          <div className="flex items-center space-x-3">
            <div className={`${config.bgColor} p-2 rounded-lg`}>
              <config.icon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Loading...' : `${totalItems} total items`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search categories..." 
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
            Found {filteredCategories.length} categories matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <Badge variant="secondary">
            {isLoading ? '...' : filteredCategories.length} categories
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 9 }).map((_, index) => (
              <CategorySkeleton key={index} />
            ))
          ) : filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => (
              <Card 
                key={index} 
                className={`bg-white shadow-sm border ${config.borderColor} hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => navigate(`/dashboard/content/categories/${type}/content?category=${encodeURIComponent(category)}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`${config.bgColor} p-2 rounded-lg`}>
                      <config.icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {category}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Category #{index + 1}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <config.icon className={`h-12 w-12 ${config.color} mx-auto mb-4 opacity-50`} />
              <p className="text-gray-500 mb-2">No categories found</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSearchTerm('')}
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

export default CategoryDetails; 