import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  IconButton,
  Alert,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getCurrentUser } from '../redux/slices/authSlice';

const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [avatar, setAvatar] = useState(user.avatar_url);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      console.log(user);
      setFormData({
        ...formData,
        name: user.username || '',
        email: user.email || '',
      });
      setAvatarPreview(user.avatar_url || '');
    }
  }, [user]);

  const handleChange = (e) => {

     const nextData = { ...formData, [e.target.name]: e.target.value, };
  
  setFormData(nextData);



    // Password validation
   if (e.target.name === 'newPassword' || e.target.name === 'confirmPassword') {
    const { newPassword, confirmPassword } = nextData;
    
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match');
        } else {
          setPasswordError('');
        }
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      
      if (avatar) {
        formDataToSend.append('media', avatar);
      }

      await axios.put(
        `${API_URL}/profile/me`,
        formDataToSend,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      dispatch(getCurrentUser());
      toast.success('Profile updated successfully');
    } catch (error) {
      console.log(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (!formData.currentPassword || !formData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        { withCredentials: true }
      );

      toast.success('Password changed successfully');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid size={{xs:12, md:6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Divider className="my-4" />

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar
                    src={avatarPreview}
                    sx={{ width: 80, height: 80 }}
                  />
                  <div>
                    <input
                      accept="image/*"
                      id="avatar-upload"
                      type="file"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="avatar-upload">
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="span"
                      >
                        <PhotoCameraIcon />
                      </IconButton>
                    </label>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Click to change avatar
                    </Typography>
                  </div>
                </div>

                <TextField sx={{pb:2}}
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  disabled
                  helperText="Email cannot be changed"
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  className="mt-2"
                >
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid size={{xs:12, md:6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Divider className="my-4" />

              <form onSubmit={handleChangePassword} className="space-y-4">
                <TextField sx={{pb:2}}
                  fullWidth
                  type="password"
                  label="Current Password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />

                <TextField sx={{pb:2}}
                  fullWidth
                  type="password"
                  label="New Password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />

                <TextField sx={{pb:2}}
                  fullWidth 
                  type="password"
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!passwordError}
                  helperText={passwordError}
                  required
                />

                {passwordError && (
                  <Alert severity="error" className="mt-2">
                    {passwordError}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !!passwordError}
                  className="mt-2"
                >
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid size={{xs:12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider  className="my-4" />

              <Grid sx={{pt:2}} container spacing={2}>
                <Grid size={{xs:12, sm:4}}>
                  <Typography variant="body2" color="textSecondary">
                    Member Since
                  </Typography>
                  <Typography variant="body1">
                    {user?.createdAt }
                  </Typography>
                </Grid>
                <Grid size={{xs:12, sm:4}}>
                  <Typography variant="body2" color="textSecondary">
                    Account Status
                  </Typography>
                  <Typography variant="body1" className="text-green-600">
                    Active
                  </Typography>
                </Grid>
                <Grid size={{xs:12, sm:4}}>
                  <Typography variant="body2" color="textSecondary">
                    Role
                  </Typography>
                  <Typography variant="body1" className="text-green-600">
                    {user?.role}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ProfilePage;