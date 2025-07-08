import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useApi = <T = any>(options?: UseApiOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const makeRequest = useCallback(async (
    endpoint: string,
    requestOptions: RequestInit = {}
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.makeAuthenticatedRequest<T>(endpoint, requestOptions);
      setData(response);
      options?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    makeRequest,
    reset
  };
};

export default useApi; 