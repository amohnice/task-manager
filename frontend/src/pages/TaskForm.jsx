import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Autocomplete,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask, fetchTaskById } from '../features/tasks/taskSlice';
import { fetchUsers } from '../features/users/userSlice';
import { fetchTeams } from '../features/teams/teamSlice';

const TaskForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { loading, error, currentTask } = useSelector((state) => state.tasks);
  const { userInfo } = useSelector((state) => state.auth);
  const { users = [] } = useSelector((state) => state.users);
  const { teams = [] } = useSelector((state) => state.teams);

  const initialFormData = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    deadline: '',
    assignedTo: '',
    team: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const token = userInfo?.token || userInfo?.data?.token;
    if (!token) {
      navigate('/login');
      return;
    }

    dispatch(fetchUsers());
    dispatch(fetchTeams());

    if (id) {
      dispatch(fetchTaskById(id));
    }
  }, [dispatch, id, navigate, userInfo]);

  useEffect(() => {
    if (id) {
      if (currentTask) {
        setFormData({
          title: currentTask.title || '',
          description: currentTask.description || '',
          status: currentTask.status || 'todo',
          priority: currentTask.priority || 'medium',
          deadline: currentTask.deadline ? new Date(currentTask.deadline).toISOString().split('T')[0] : '',
          assignedTo: currentTask.assignedTo?._id || '',
          team: currentTask.team?._id || '',
        });
      }
    } else {
      setFormData(initialFormData);
    }
  }, [currentTask, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    // Prepare task data, converting empty strings to null for ObjectId fields
    const taskData = {
      ...formData,
      deadline: new Date(formData.deadline).toISOString(),
      assignedTo: formData.assignedTo || null,
      team: formData.team || null,
    };

    if (id) {
      dispatch(updateTask({ taskId: id, taskData }));
    } else {
      dispatch(createTask(taskData));
    }
    navigate('/tasks');
  };

  // Get team members for the selected team
  const selectedTeam = teams.find(team => team._id === formData.team);
  const teamMembers = selectedTeam?.members?.map(member => member.user) || [];
  const availableUsers = formData.team ? teamMembers : users;

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Task' : 'Create Task'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!formData.title}
                helperText={!formData.title ? 'Title is required' : ''}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!formData.description}
                helperText={!formData.description ? 'Description is required' : ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!formData.deadline}
                helperText={!formData.deadline ? 'Deadline is required' : ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Team</InputLabel>
                <Select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  label="Team"
                >
                  <MenuItem value="">No Team</MenuItem>
                  {teams.map((team) => (
                    <MenuItem key={team._id} value={team._id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  label="Assign To"
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {availableUsers.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tasks')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : id ? 'Update' : 'Create'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default TaskForm; 