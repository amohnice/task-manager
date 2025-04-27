import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { fetchTeams } from '../features/teams/teamSlice';

const TeamList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { teams = [], loading, error } = useSelector((state) => state.teams);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    // Get the token from either location
    const token = userInfo?.token || userInfo?.data?.token;
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    dispatch(fetchTeams()).catch((error) => {
      console.error('Error fetching teams:', error);
    });
  }, [dispatch, navigate, userInfo]);

  const handleMenuClick = (event, team) => {
    setAnchorEl(event.currentTarget);
    setSelectedTeam(team);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTeam(null);
  };

  const handleViewTeam = () => {
    if (selectedTeam) {
      navigate(`/teams/${selectedTeam._id}`);
    }
    handleMenuClose();
  };

  const handleEditTeam = () => {
    if (selectedTeam) {
      navigate(`/teams/${selectedTeam._id}/edit`);
    }
    handleMenuClose();
  };

  // Ensure we're working with arrays and handle the data structure correctly
  const teamsData = Array.isArray(teams) ? teams : [];

  const filteredTeams = teamsData.filter((team) => {
    if (!team || !team.name) return false;
    return team.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Teams
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/teams/create')}
          >
            Create Team
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <List>
          {filteredTeams.map((team) => (
            <ListItem
              key={team._id}
              button
              onClick={() => navigate(`/teams/${team._id}`)}
            >
              <ListItemText
                primary={team.name}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      display="block"
                    >
                      {team.description}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {team.members?.length || 0} members
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClick(e, team);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {filteredTeams.length === 0 && (
            <ListItem>
              <ListItemText primary="No teams found" />
            </ListItem>
          )}
        </List>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewTeam}>View Details</MenuItem>
          <MenuItem onClick={handleEditTeam}>Edit Team</MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
};

export default TeamList; 