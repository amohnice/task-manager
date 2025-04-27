import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Fetch notifications for the current user
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().auth;
      const token = userInfo?.token || userInfo?.data?.token;
      
      if (!token) {
        throw new Error('No token found');
      }

      const { data } = await axiosInstance.get('/notifications');
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error fetching notifications'
      );
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/notifications/${notificationId}/read`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error marking notification as read'
      );
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const { recipientId, ...notification } = action.payload;
      
      // Always add the notification to the state
      state.notifications.unshift({
        ...notification,
        _id: Date.now().toString(),
        read: false,
        createdAt: new Date().toISOString(),
      });
      state.unreadCount += 1;
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true;
        }
      });
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark Notification as Read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const notification = state.notifications.find(n => n._id === action.payload._id);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount -= 1;
        }
        state.error = null;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer; 