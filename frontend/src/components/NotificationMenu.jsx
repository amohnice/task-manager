import { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead, markAllAsRead, clearNotifications } from '../features/notifications/notificationSlice';
import { formatDistanceToNow } from 'date-fns';

const NotificationMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    // Fetch notifications when component mounts
    dispatch(fetchNotifications());
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearNotifications());
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 400 },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {notifications.length > 0 && (
            <Box>
              <Button size="small" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
              <Button size="small" color="error" onClick={handleClearAll}>
                Clear all
              </Button>
            </Box>
          )}
        </Box>

        <Divider />

        {loading ? (
          <MenuItem key="loading">
            <Typography variant="body2" color="text.secondary">
              Loading notifications...
            </Typography>
          </MenuItem>
        ) : !notifications || notifications.length === 0 ? (
          <MenuItem key="empty">
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleMarkAsRead(notification._id)}
              sx={{
                bgcolor: notification.read ? 'inherit' : 'action.hover',
                py: 1.5,
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" color="text.primary">
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.createdAt ? (
                    formatDistanceToNow(new Date(notification.createdAt), { 
                      addSuffix: true,
                      includeSeconds: true
                    })
                  ) : 'Just now'}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu; 