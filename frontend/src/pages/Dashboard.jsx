import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Task as TaskIcon,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../features/tasks/taskSlice';
import { fetchTeams } from '../features/teams/teamSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { tasks = [], loading: tasksLoading, error: tasksError } = useSelector((state) => state.tasks);
  const { teams = [], loading: teamsLoading, error: teamsError } = useSelector((state) => state.teams);
  const { userInfo } = useSelector((state) => state.auth);

  const fetchData = useCallback(() => {
    const token = userInfo?.data?.token;
    if (token) {
      dispatch(fetchTasks());
      dispatch(fetchTeams());
    }
  }, [dispatch, userInfo?.data?.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Not set';
    }
    return date.toLocaleDateString();
  };

  // Ensure we're working with arrays and handle the data structure correctly
  const tasksData = Array.isArray(tasks) ? tasks : tasks.data || [];
  const teamsData = Array.isArray(teams) ? teams : teams.data || [];

  const recentTasks = [...tasksData]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentTeams = [...teamsData]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (tasksLoading || teamsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        {(tasksError || teamsError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {tasksError || teamsError}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Overview
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <TaskIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Total Tasks"
                    secondary={tasksData.length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <GroupIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Total Teams"
                    secondary={teamsData.length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <NotificationsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Notifications"
                    secondary="0 unread"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Tasks
              </Typography>
              <List>
                {recentTasks.map((task) => (
                  <ListItem key={task._id}>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          display="block"
                        >
                          {task.description}
                        </Typography>
                      }
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={task.status}
                        color={getStatusColor(task.status)}
                        size="small"
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Due: {formatDate(task.deadline)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
                {recentTasks.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No tasks found" />
                  </ListItem>
                )}
              </List>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Teams
              </Typography>
              <List>
                {recentTeams.map((team) => (
                  <ListItem key={team._id}>
                    <ListItemText
                      primary={team.name}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {team.description}
                          </Typography>
                          <br />
                          {team.members?.length || 0} members
                        </>
                      }
                    />
                  </ListItem>
                ))}
                {recentTeams.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No teams found" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 