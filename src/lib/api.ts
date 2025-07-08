const API_BASE_URL = '/api';

interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  message: string;
  token: string;
  admin: {
    adminId: string;
    username: string;
    email: string;
    role: string;
    lastLogin: string;
  };
  rememberMe?: boolean;
  tokenExpiration?: string;
}

interface LogoutResponse {
  message: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
  success?: boolean;
}

interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
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
        this.clearAuthData();
        window.location.href = '/';
        throw new Error('Authentication failed. Please log in again.');
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async login(username: string, password: string, rememberMe?: boolean): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      return this.handleResponse<LoginResponse>(response);
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  }

  async logout(): Promise<LogoutResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: '',
      });

      return this.handleResponse<LogoutResponse>(response);
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return this.handleResponse<ForgotPasswordResponse>(response);
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  }

  async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  }

  clearAuthData(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
  }

  // Remember Me functionality
  saveRememberedCredentials(username: string): void {
    localStorage.setItem('rememberedUsername', username);
    localStorage.setItem('hasRememberedCredentials', 'true');
  }

  getRememberedCredentials(): { username: string } | null {
    const hasRemembered = localStorage.getItem('hasRememberedCredentials');
    const username = localStorage.getItem('rememberedUsername');
    
    if (hasRemembered === 'true' && username) {
      return { username };
    }
    
    return null;
  }

  clearRememberedCredentials(): void {
    localStorage.removeItem('rememberedUsername');
    localStorage.removeItem('hasRememberedCredentials');
  }
}

export const apiService = new ApiService();
export type { LoginResponse, LogoutResponse, ForgotPasswordResponse, ApiError }; 