import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Snackbar,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../features/auth/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (userInfo?.data) {
      setFormData(prevData => ({
        ...prevData,
        name: userInfo.data.name || '',
        email: userInfo.data.email || '',
      }));
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only include password fields if they are filled
    const updateData = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      if (!formData.currentPassword) {
        alert('Please enter your current password');
        return;
      }
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    dispatch(updateProfile(updateData))
      .then((result) => {
        if (result.type === 'auth/updateProfile/fulfilled') {
          setSuccessMessage('Profile updated successfully!');
          // Clear password fields after successful update
          setFormData(prevData => ({
            ...prevData,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }));
        }
      })
      .catch((error) => {
        console.error('Profile update error:', error);
      });
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  sx={{ width: 100, height: 100, mb: 2 }}
                  alt={userInfo?.data?.name || ''}
                >
                  {userInfo?.data?.name?.[0] || ''}
                </Avatar>
                <Typography variant="h6">{userInfo?.data?.name || ''}</Typography>
                <Typography color="text.secondary">{userInfo?.data?.email || ''}</Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Member Since"
                    secondary={userInfo?.data?.createdAt ? new Date(userInfo.data.createdAt).toLocaleDateString() : ''}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Role"
                    secondary={userInfo?.data?.isAdmin ? 'Admin' : 'User'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Update Profile
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      helperText="Required only if changing password"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      helperText="Leave blank to keep current password"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </Container>
  );
};

export default Profile; 