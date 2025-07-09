import React, { useState, useEffect } from 'react';
import { User, Mail, Eye, Calendar, Shield, Key, RefreshCw, Copy, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiService, type UserDetailsResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, userId }) => {
  const [userDetails, setUserDetails] = useState<UserDetailsResponse['user'] | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch user details when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);

    try {
      const response = await apiService.getUserDetails(userId);
      setUserDetails(response.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load user details.",
        variant: "destructive",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleClose = () => {
    setUserDetails(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        {loading ? (
          <>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                </div>
                Loading User Details
              </DialogTitle>
              <DialogDescription>
                Fetching user information...
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
                User Details
              </DialogTitle>
              <DialogDescription>
                Complete information about the selected user.
              </DialogDescription>
            </DialogHeader>

            {userDetails && (
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                {/* User Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold">
                      {userDetails.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{userDetails.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {userDetails.email}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={userDetails.isActive ? 'default' : 'secondary'} className="text-xs">
                          {userDetails.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={userDetails.isEmailVerified ? 'default' : 'secondary'} className="text-xs">
                          {userDetails.isEmailVerified ? 'Verified' : 'Not Verified'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-3">
                  <h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Basic Information
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900 truncate">{userDetails.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(userDetails.name, 'Name')}
                          className="h-5 w-5 p-0 ml-1"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-2 rounded">
                      <label className="text-xs font-medium text-gray-500 uppercase">Username</label>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900 truncate">{userDetails.username}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(userDetails.username, 'Username')}
                          className="h-5 w-5 p-0 ml-1"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-2 rounded">
                      <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900 truncate">{userDetails.email}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(userDetails.email, 'Email')}
                          className="h-5 w-5 p-0 ml-1"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-2 rounded">
                      <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                      <p className="text-sm text-gray-900">
                        {userDetails.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Information */}
                <div className="space-y-3">
                  <h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Information
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <label className="text-xs font-medium text-gray-500 uppercase">Email Verification</label>
                      <p className="text-sm text-gray-900">
                        {userDetails.isEmailVerified ? 'Verified ✓' : 'Not Verified ✗'}
                      </p>
                    </div>

                    {userDetails.otp && (
                      <div className="bg-orange-50 border border-orange-200 p-2 rounded">
                        <label className="text-xs font-medium text-orange-700 uppercase flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          Current OTP
                        </label>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-mono text-orange-900">{userDetails.otp}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(userDetails.otp!, 'OTP')}
                            className="h-5 w-5 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        {userDetails.otpExpiresAt && (
                          <p className="text-xs text-orange-600">
                            Expires: {formatDate(userDetails.otpExpiresAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* System Information */}
                <div className="space-y-3">
                  <h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    System Information
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <label className="text-xs font-medium text-gray-500 uppercase">User ID</label>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-mono text-gray-900 truncate">{userDetails.userId}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(userDetails.userId, 'User ID')}
                          className="h-5 w-5 p-0 ml-1"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-2 rounded">
                      <label className="text-xs font-medium text-gray-500 uppercase">Database ID</label>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-mono text-gray-900 truncate">{userDetails._id}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(userDetails._id, 'Database ID')}
                          className="h-5 w-5 p-0 ml-1"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-2 rounded">
                      <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                      <p className="text-sm text-gray-900">{formatDate(userDetails.createdAt)}</p>
                    </div>

                    <div className="bg-gray-50 p-2 rounded">
                      <label className="text-xs font-medium text-gray-500 uppercase">Updated</label>
                      <p className="text-sm text-gray-900">{formatDate(userDetails.updatedAt)}</p>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Fixed at bottom */}
            {userDetails && (
              <div className="flex-shrink-0 pt-3 border-t border-gray-200">
                <Button
                  onClick={handleClose}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserModal; 