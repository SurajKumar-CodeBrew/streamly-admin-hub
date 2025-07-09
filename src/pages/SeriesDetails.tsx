import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Play, Tv, Calendar, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { getHighQualityImage } from '@/lib/utils';

interface Episode {
  title: string;
  logo: string;
  group: string;
  url: string;
}

interface SeriesResponse {
  message: string;
  data: {
    seriesTitle: string;
    totalEpisodes: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    episodes: Episode[];
  };
}

const SeriesDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get URL parameters
  const seriesTitle = searchParams.get('title');
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const poster = searchParams.get('poster');
  
  // Component state
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [seriesData, setSeriesData] = useState<SeriesResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch series episodes
  const fetchSeriesEpisodes = async (page: number = 1) => {
    if (!seriesTitle) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // URL encode the series title
      const encodedTitle = encodeURIComponent(seriesTitle);
      
      const response = await fetch(`/api/admin/series-episodes?title=${encodedTitle}&page=${page}&pageSize=20`, {
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

      const data: SeriesResponse = await response.json();
      
      if (data.data) {
        setSeriesData(data.data);
        setEpisodes(data.data.episodes);
        setCurrentPage(page);
        
        toast({
          title: "Success",
          description: `Episodes loaded successfully!`,
          variant: "default",
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching series episodes:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load episodes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (seriesTitle) {
      fetchSeriesEpisodes(1);
    }
  }, [seriesTitle]);

  // Filter episodes based on search term
  const filteredEpisodes = episodes.filter(episode =>
    episode.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Extract season and episode info from title
  const parseEpisodeInfo = (title: string) => {
    const match = title.match(/S(\d+)\s*E(\d+)/i);
    if (match) {
      return {
        season: parseInt(match[1]),
        episode: parseInt(match[2]),
        seasonText: `S${match[1]}`,
        episodeText: `E${match[2]}`
      };
    }
    return null;
  };

  // Group episodes by season
  const groupedEpisodes = filteredEpisodes.reduce((acc, episode) => {
    const episodeInfo = parseEpisodeInfo(episode.title);
    const season = episodeInfo?.season || 1;
    
    if (!acc[season]) {
      acc[season] = [];
    }
    acc[season].push(episode);
    return acc;
  }, {} as Record<number, Episode[]>);



  // Handle episode click
  const handleEpisodeClick = (episode: Episode) => {
    const playerUrl = `/dashboard/content/player?${new URLSearchParams({
      url: episode.url,
      title: episode.title,
      poster: getHighQualityImage(episode.logo),
      category: category || '',
      type: 'series'
    }).toString()}`;
    
    navigate(playerUrl);
    
    toast({
      title: "Playing Episode",
      description: `Playing "${episode.title}"`,
      variant: "default",
    });
  };

  // Handle back navigation
  const handleBack = () => {
    if (type && category) {
      navigate(`/dashboard/content/categories/${type}/content?category=${encodeURIComponent(category)}`);
    } else {
      navigate('/dashboard/content');
    }
  };

  // Loading skeleton for episodes
  const EpisodeSkeleton = () => (
    <Card className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="aspect-[16/9] relative">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  );

  // Show error if no series title
  if (!seriesTitle) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Series Selected</h2>
            <p className="text-gray-600 mb-4">Please select a series to view episodes.</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Content</span>
          </Button>
          <div className="flex items-center space-x-4">
            {poster && (
              <img
                src={getHighQualityImage(poster)}
                alt={seriesTitle}
                className="w-16 h-24 object-cover rounded-lg shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {seriesData?.seriesTitle || seriesTitle}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center space-x-1">
                  <Tv className="h-4 w-4" />
                  <span>{seriesData?.totalEpisodes || 0} Episodes</span>
                </div>
                {category && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{category}</span>
                  </div>
                )}
              </div>
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
              placeholder="Search episodes..."
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
            Found {filteredEpisodes.length} episodes matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Episodes by Season */}
      {Object.keys(groupedEpisodes).length > 0 ? (
        Object.entries(groupedEpisodes)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([season, seasonEpisodes]) => (
            <div key={season} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Tv className="h-5 w-5 text-blue-600" />
                  <span>Season {season}</span>
                </h2>
                <Badge variant="secondary">
                  {seasonEpisodes.length} episodes
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 8 }).map((_, index) => (
                    <EpisodeSkeleton key={index} />
                  ))
                ) : (
                  seasonEpisodes.map((episode, index) => {
                    const episodeInfo = parseEpisodeInfo(episode.title);
                    return (
                      <Card 
                        key={index} 
                        className="bg-white shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden group cursor-pointer"
                        onClick={() => handleEpisodeClick(episode)}
                      >
                        <div className="aspect-[16/9] relative overflow-hidden">
                          {episode.logo ? (
                            <img
                              src={getHighQualityImage(episode.logo)}
                              alt={episode.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjggNzJIMTkyVjEwOEgxMjhWNzJaIiBmaWxsPSIjOUI5Q0EwIi8+CjxwYXRoIGQ9Ik0xNDQgODhIMjA4VjEwNEgxNDRWODhaIiBmaWxsPSIjOUI5Q0EwIi8+Cjwvc3ZnPg==';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Play className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {episodeInfo && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="bg-black/60 text-white">
                                {episodeInfo.seasonText}{episodeInfo.episodeText}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {episode.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {episodeInfo ? `Episode ${episodeInfo.episode}` : 'Episode'}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          ))
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Tv className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No episodes found</p>
          <p className="text-gray-400 text-sm">
            {searchTerm ? 'Try adjusting your search terms' : 'This series appears to have no episodes available'}
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

      {/* Pagination */}
      {seriesData && seriesData.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSeriesEpisodes(currentPage - 1)}
            disabled={!seriesData.hasPrevPage || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {seriesData.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSeriesEpisodes(currentPage + 1)}
            disabled={!seriesData.hasNextPage || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default SeriesDetails; 