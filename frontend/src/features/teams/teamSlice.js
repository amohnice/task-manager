import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Fetch all teams
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (_, { getState }) => {
    const userInfo = getState().auth.userInfo;
    const token = userInfo?.token || userInfo?.data?.token;
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axiosInstance.get('/teams');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

// Fetch single team
export const fetchTeamById = createAsyncThunk(
  'teams/fetchTeamById',
  async (teamId, { getState }) => {
    const userInfo = getState().auth.userInfo;
    const token = userInfo?.token || userInfo?.data?.token;
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axiosInstance.get(`/teams/${teamId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching team:', error.response?.data || error.message);
      throw error;
    }
  }
);

// Create team
export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { getState }) => {
    const userInfo = getState().auth.userInfo;
    const token = userInfo?.token || userInfo?.data?.token;
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axiosInstance.post('/teams', teamData);
    return response.data.data;
  }
);

// Update team
export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ teamId, teamData }, { getState }) => {
    const userInfo = getState().auth.userInfo;
    const token = userInfo?.token || userInfo?.data?.token;
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axiosInstance.put(`/teams/${teamId}`, teamData);
    return response.data.data;
  }
);

// Delete team
export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId, { getState }) => {
    const userInfo = getState().auth.userInfo;
    const token = userInfo?.token || userInfo?.data?.token;
    if (!token) {
      throw new Error('No authentication token found');
    }

    await axiosInstance.delete(`/teams/${teamId}`);
    return teamId;
  }
);

// Initial state
const initialState = {
  teams: [],
  currentTeam: null,
  loading: false,
  error: null,
};

// Create slice
const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload.data || [];
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch team by ID
      .addCase(fetchTeamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTeam = action.payload;
      })
      .addCase(fetchTeamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = [...state.teams, action.payload];
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.map((team) =>
          team._id === action.payload._id ? action.payload : team
        );
        state.currentTeam = action.payload;
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.filter((team) => team._id !== action.payload);
        state.currentTeam = null;
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentTeam } = teamSlice.actions;
export default teamSlice.reducer; 