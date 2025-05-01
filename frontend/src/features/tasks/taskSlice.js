import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';
import { addNotification } from '../notifications/notificationSlice';

// Fetch all tasks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().auth;
      const token = userInfo?.token || userInfo?.data?.token;
      
      if (!token) {
        throw new Error('No token found');
      }

      const { data } = await axiosInstance.get('/tasks');
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error fetching tasks'
      );
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/tasks/${taskId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error fetching task'
      );
    }
  }
);

// Create task
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { dispatch, getState }) => {
    try {
      const { userInfo } = getState().auth;
      const token = userInfo?.token || userInfo?.data?.token;
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axiosInstance.post('/tasks', taskData);
      
      // Add notification for task creation and assignment
      if (taskData.assignedTo) {
        dispatch(addNotification({
          type: 'task_assigned',
          message: `New task "${taskData.title}" has been assigned to you`,
          taskId: response.data._id,
          recipientId: taskData.assignedTo,
        }));
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creating task');
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { dispatch, getState }) => {
    try {
      const { userInfo } = getState().auth;
      const token = userInfo?.token || userInfo?.data?.token;
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axiosInstance.put(`/tasks/${taskId}`, taskData);
      
      // Add notifications for task updates
      if (taskData.status === 'completed') {
        dispatch(addNotification({
          type: 'task_completed',
          message: `Task "${response.data.title}" has been completed`,
          taskId: response.data._id,
          recipientId: response.data.assignedTo?._id,
        }));
      } else if (taskData.assignedTo && taskData.assignedTo !== response.data.assignedTo?._id) {
        dispatch(addNotification({
          type: 'task_reassigned',
          message: `Task "${response.data.title}" has been reassigned to you`,
          taskId: response.data._id,
          recipientId: taskData.assignedTo,
        }));
      } else if (taskData.status && taskData.status !== response.data.status) {
        dispatch(addNotification({
          type: 'task_updated',
          message: `Task status updated: ${response.data.title}`,
          taskId: response.data._id,
          recipientId: response.data.assignedTo?._id,
        }));
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating task');
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().auth;
      const token = userInfo?.token || userInfo?.data?.token;
      
      if (!token) {
        throw new Error('No token found');
      }

      await axiosInstance.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error deleting task'
      );
    }
  }
);

// Add comment to task
export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, comment }, { dispatch, getState }) => {
    try {
      const { userInfo } = getState().auth;
      const token = userInfo?.token || userInfo?.data?.token;
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axiosInstance.post(`/tasks/${taskId}/comments`, { text: comment });
      
      // Add notification for the comment
      dispatch(addNotification({
        type: 'task_comment',
        message: `New comment on task "${response.data.title}"`,
        taskId: response.data._id,
        recipientId: response.data.assignedTo?._id,
      }));

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error adding comment');
    }
  }
);

// Initial state
const initialState = {
  tasks: localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [],
  currentTask: null,
  loading: false,
  error: null,
};

// Create slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        localStorage.setItem('tasks', JSON.stringify(state.tasks));
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Task by ID
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = Array.isArray(state.tasks) ? [...state.tasks, action.payload] : [action.payload];
        localStorage.setItem('tasks', JSON.stringify(state.tasks));
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.map((task) =>
          task._id === action.payload._id ? action.payload : task
        );
        localStorage.setItem('tasks', JSON.stringify(state.tasks));
        state.currentTask = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        localStorage.setItem('tasks', JSON.stringify(state.tasks));
        state.currentTask = null;
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.map((task) =>
          task._id === action.payload._id ? action.payload : task
        );
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
        state.error = null;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer; 