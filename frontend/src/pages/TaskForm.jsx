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
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask, fetchTaskById } from '../features/tasks/taskSlice';

const TaskForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { loading, error, currentTask } = useSelector((state) => state.tasks);
  const { userInfo } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    deadline: '',
    assignedTo: '',
    team: '',
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTask && id) {
      setFormData({
        title: currentTask.title,
        description: currentTask.description,
        status: currentTask.status,
        priority: currentTask.priority,
        deadline: currentTask.deadline ? new Date(currentTask.deadline).toISOString().split('T')[0] : '',
        assignedTo: currentTask.assignedTo?._id || '',
        team: currentTask.team?._id || '',
      });
    }
  }, [currentTask, id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
                <InputLabel>Assign To</InputLabel>
                <Select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  label="Assign To"
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {/* TODO: Add team members list */}
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