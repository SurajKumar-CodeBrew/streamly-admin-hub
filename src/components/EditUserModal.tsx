import React, { useState, useEffect } from 'react';
import { User, Mail, Edit3, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { apiService, type UserDetailsResponse, type UpdateUserResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onSuccess?: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, userId, onSuccess }) => {
  const [userDetails, setUserDetails] = useState<UserDetailsResponse['user'] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    isActive: false,
    resendActivationCode: false,
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [step, setStep] = useState<'loading' | 'form' | 'success'>('loading');
  const [updatedUser, setUpdatedUser] = useState<any>(null);
  const [activationCodeInfo, setActivationCodeInfo] = useState<any>(null);
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
    setStep('loading');

    try {
      const response = await apiService.getUserDetails(userId);
      setUserDetails(response.user);
      setFormData({
        name: response.user.name,
        isActive: response.user.isActive,
        resendActivationCode: false,
      });
      setStep('form');
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the user.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userId) return;

    setUpdating(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        isActive: formData.isActive,
        ...(formData.resendActivationCode && { resendActivationCode: true })
      };

      const response = await apiService.updateUser(userId, updateData);
      
      setUpdatedUser(response.user);
      setActivationCodeInfo(response.activationCode);
      setStep('success');
      
      toast({
        title: "User Updated Successfully",
        description: `${formData.name} has been updated.`,
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Update user error:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = () => {
    setStep('loading');
    setUserDetails(null);
    setFormData({
      name: '',
      isActive: false,
      resendActivationCode: false,
    });
    setUpdatedUser(null);
    setActivationCodeInfo(null);
    setLoading(false);
    setUpdating(false);
    onClose();
  };

  const handleEditAnother = () => {
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'loading' ? (
          <>
            <DialogHeader>
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
        ) : step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Edit3 className="h-4 w-4 text-blue-600" />
                </div>
                Edit User Details
              </DialogTitle>
              <DialogDescription>
                Update user information and manage account settings.
              </DialogDescription>
            </DialogHeader>

            {userDetails && (
              <div className="space-y-4">
                {/* User Info Display */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold">
                      {userDetails.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{userDetails.name}</h3>
                      <p className="text-sm text-gray-500">{userDetails.email}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={userDetails.isActive ? 'default' : 'secondary'}>
                          {userDetails.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={userDetails.isEmailVerified ? 'default' : 'secondary'}>
                          {userDetails.isEmailVerified ? 'Verified' : 'Not Verified'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter full name"
                        className="pl-10"
                        required
                        disabled={updating}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={userDetails.email}
                        className="pl-10 bg-gray-50"
                        disabled
                        title="Email cannot be changed"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Email address cannot be modified</p>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <Label htmlFor="isActive" className="text-sm font-medium">
                        Account Status
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Control whether the user can access the system
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                      disabled={updating}
                    />
                  </div>

                  {!userDetails.isEmailVerified && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="resendActivationCode" 
                        checked={formData.resendActivationCode}
                        onCheckedChange={(checked) => handleInputChange('resendActivationCode', checked)}
                        disabled={updating}
                      />
                      <Label htmlFor="resendActivationCode" className="text-sm cursor-pointer">
                        Resend activation code to user's email
                      </Label>
                    </div>
                  )}

                  {formData.resendActivationCode && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-xs text-orange-700 font-medium">Resend Activation Code</p>
                          <p className="text-xs text-orange-600 mt-1">
                            A new activation code will be sent to {userDetails.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Update User'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                User Updated Successfully
              </DialogTitle>
              <DialogDescription>
                The user information has been updated.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Updated Details:</p>
                    <div className="text-sm text-green-700 mt-1 space-y-1">
                      <p><strong>Name:</strong> {updatedUser?.name}</p>
                      <p><strong>Email:</strong> {updatedUser?.email}</p>
                      <p><strong>Status:</strong> {updatedUser?.isActive ? 'Active' : 'Inactive'}</p>
                      <p><strong>Email Verified:</strong> {updatedUser?.isEmailVerified ? 'Yes' : 'No'}</p>
                      <p><strong>Updated:</strong> {updatedUser?.updatedAt ? new Date(updatedUser.updatedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {activationCodeInfo && activationCodeInfo.sent && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Activation Code Sent</p>
                      <p className="text-sm text-blue-600 mt-1">{activationCodeInfo.note}</p>
                      <p className="text-xs text-blue-500 mt-1">
                        Code: {activationCodeInfo.code} (Expires: {new Date(activationCodeInfo.expiresAt).toLocaleString()})
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleEditAnother}
                  variant="outline"
                  className="flex-1"
                >
                  Edit Another User
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal; 