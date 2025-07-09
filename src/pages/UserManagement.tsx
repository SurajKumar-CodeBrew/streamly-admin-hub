import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import CreateUserModal from '@/components/CreateUserModal';
import EditUserModal from '@/components/EditUserModal';
import ViewUserModal from '@/components/ViewUserModal';

interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  subscription?: string;
  joinDate?: string;
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
  isEmailVerified?: boolean;
}

interface ApiUser {
  _id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  subscription_status?: string;
  createdAt: string;
  updatedAt: string;
  otp?: string | null;
  otpExpiresAt?: string | null;
}

interface ApiResponse {
  message: string;
  data: {
    users: ApiUser[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics: {
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
    };
  };
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: apiResponse, loading, error, makeRequest } = useApi<ApiResponse>({
    onSuccess: (data) => {
      console.log('Users fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    }
  });

  const fetchUsers = async (page: number = 1) => {
    try {
      await makeRequest(`/admin/users?page=${page}&limit=10`);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Transform API data to match our interface
  const users: User[] = apiResponse?.data?.users ? apiResponse.data.users.map((user: ApiUser) => ({
    id: user.userId, // Use userId instead of _id for the API calls
    name: user.name,
    email: user.email,
    phone: user.phone || 'N/A',
    status: user.isActive ? 'active' : 'inactive',
    subscription: user.subscription_status || 'Basic',
    joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    lastActive: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A',
    isEmailVerified: user.isEmailVerified
  })) : [];

  // Get statistics from API response
  const stats = apiResponse?.data?.statistics || {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  };

  // Get pagination info from API response
  const pagination = apiResponse?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      fetchUsers(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      fetchUsers(currentPage - 1);
    }
  };

  const handleRefresh = () => {
    fetchUsers(currentPage);
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleCreateUserSuccess = () => {
    // Refresh the user list after successful creation
    fetchUsers(1); // Go back to first page to see the new user
    setCurrentPage(1);
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowViewModal(true);
  };

  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowEditModal(true);
  };

  const handleEditUserSuccess = () => {
    // Refresh the user list after successful update
    fetchUsers(currentPage);
    // Close the modal
    setShowEditModal(false);
    setSelectedUserId(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
              <p className="text-sm text-red-700 mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Total Users</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Active Users</div>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Inactive Users</div>
            <div className="text-2xl font-bold text-red-600">{stats.inactiveUsers}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All Users ({stats.totalUsers})
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
              >
                Active ({stats.activeUsers})
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('inactive')}
                size="sm"
              >
                Inactive ({stats.inactiveUsers})
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm || filterStatus !== 'all' ? 'No users found matching your criteria.' : 'No users available.'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Verified
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name?.toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.isEmailVerified ? 'default' : 'secondary'}>
                          {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.subscription}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.joinDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="View Details"
                            onClick={() => handleViewUser(user.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Edit User"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800" title="Delete User">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        {apiResponse && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
              <div>
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of{' '}
                {pagination.totalUsers} users
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                {pagination.totalPages > 1 && (
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrevPage || loading}
                      onClick={handlePrevPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage || loading}
                      onClick={handleNextPage}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateUserModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateUserSuccess}
      />

      <ViewUserModal 
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
      />

      <EditUserModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onSuccess={handleEditUserSuccess}
      />
    </>
  );
};

export default UserManagement;
