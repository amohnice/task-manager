import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/users/userSlice';
import taskReducer from '../features/tasks/taskSlice';
import teamReducer from '../features/teams/teamSlice';
import notificationReducer from '../features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    tasks: taskReducer,
    teams: teamReducer,
    notifications: notificationReducer,
  },
}); 