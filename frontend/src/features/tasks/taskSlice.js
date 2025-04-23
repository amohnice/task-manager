import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Fetch all tasks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState }) => {
    const userInfo = getState().auth.userInfo;
    
    if (!userInfo?.data?.token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axiosInstance.get('/tasks');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error.response?.data || error.message);
      throw error;
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

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/tasks', taskData);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error creating task'
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/tasks/${taskId}`, taskData);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error updating task'
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error deleting task'
      );
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
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
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
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
        localStorage.setItem('tasks', JSON.stringify(state.tasks));
        state.currentTask = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer; 