import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskById, deleteTask } from '../features/tasks/taskSlice';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTask: task, loading, error } = useSelector((state) => state.tasks);
  const [comment, setComment] = useState('');

  useEffect(() => {
    dispatch(fetchTaskById(id));
  }, [dispatch, id]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(id));
      navigate('/tasks');
    }
  };

  const handleAddComment = () => {
    // TODO: Implement comment functionality
    setComment('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container>
        <Typography>Task not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            {task.title}
          </Typography>
          <Box>
            <IconButton
              color="primary"
              onClick={() => navigate(`/tasks/${id}/edit`)}
            >
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Description
            </Typography>
            <Typography>{task.description}</Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={task.status}
                color={getStatusColor(task.status)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Priority
              </Typography>
              <Chip
                label={task.priority}
                color={
                  task.priority === 'high'
                    ? 'error'
                    : task.priority === 'medium'
                    ? 'warning'
                    : 'success'
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Due Date
              </Typography>
              <Typography>
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Assigned To
              </Typography>
              <Typography>{task.assignedTo?.name || 'Unassigned'}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
          <List>
            {task.comments?.map((comment) => (
              <ListItem key={comment._id}>
                <ListItemAvatar>
                  <Avatar>{comment.user.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={comment.user.name}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {comment.text}
                      </Typography>
                      <br />
                      {new Date(comment.createdAt).toLocaleString()}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <IconButton
              color="primary"
              onClick={handleAddComment}
              disabled={!comment.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TaskDetails; 