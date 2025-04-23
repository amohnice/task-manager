import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Autocomplete,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  fetchTeamById,
  createTeam,
  updateTeam,
} from '../features/teams/teamSlice';
import { fetchUsers } from '../features/users/userSlice';

const TeamForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const { currentTeam, loading: teamLoading, error: teamError } = useSelector(
    (state) => state.teams
  );
  const { users, loading: usersLoading, error: usersError } = useSelector(
    (state) => state.users
  );

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [],
  });

  useEffect(() => {
    if (!userInfo?.data?.token) {
      navigate('/login');
      return;
    }

    dispatch(fetchUsers());

    if (id) {
      dispatch(fetchTeamById(id));
    }
  }, [dispatch, id, navigate, userInfo]);

  useEffect(() => {
    if (currentTeam && id) {
      setFormData({
        name: currentTeam.name || '',
        description: currentTeam.description || '',
        members: currentTeam.members || [],
      });
    }
  }, [currentTeam, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo?.data?.token) {
      navigate('/login');
      return;
    }

    try {
      const teamData = {
        ...formData,
        members: formData.members.map(member => ({
          user: member.user?._id || member.user,
          role: member.role || 'member'
        }))
      };

      if (id) {
        await dispatch(updateTeam({ teamId: id, teamData })).unwrap();
      } else {
        await dispatch(createTeam(teamData)).unwrap();
      }
      navigate('/teams');
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  if (teamLoading || usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (teamError || usersError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {teamError || usersError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {id ? 'Edit Team' : 'Create Team'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Team Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
          <Autocomplete
            multiple
            options={users || []}
            getOptionLabel={(option) => option.name || ''}
            value={formData.members.map(member => member.user)}
            onChange={(_, newValue) => {
              setFormData({ 
                ...formData, 
                members: newValue.map(user => ({
                  user: user._id,
                  role: 'member'
                }))
              });
            }}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Team Members"
                margin="normal"
              />
            )}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!formData.name}
            >
              {id ? 'Update Team' : 'Create Team'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              sx={{ ml: 2 }}
              onClick={() => navigate('/teams')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default TeamForm; 