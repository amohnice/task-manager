import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { fetchTeamById, clearCurrentTeam } from '../features/teams/teamSlice';

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { currentTeam, loading, error } = useSelector((state) => state.teams);

  useEffect(() => {
    if (!userInfo?.data?.token) {
      navigate('/login');
      return;
    }

    if (id) {
      dispatch(fetchTeamById(id));
    }

    return () => {
      dispatch(clearCurrentTeam());
    };
  }, [dispatch, id, navigate, userInfo]);

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
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/teams')}
          sx={{ mt: 2 }}
        >
          Back to Teams
        </Button>
      </Box>
    );
  }

  if (!currentTeam) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Team not found</Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/teams')}
          sx={{ mt: 2 }}
        >
          Back to Teams
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            {currentTeam.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/teams/${id}/edit`)}
          >
            Edit Team
          </Button>
        </Box>

        <Typography variant="body1" paragraph>
          {currentTeam.description}
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Members
        </Typography>
        {currentTeam.members?.length > 0 ? (
          <Box>
            {currentTeam.members.map((member) => (
              <Box key={member._id} sx={{ mb: 1 }}>
                <Typography>
                  {member.user?.name} ({member.user?.email}) - {member.role}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No members in this team</Typography>
        )}
      </Paper>
    </Box>
  );
};

const TeamDetailsComponent = TeamDetails;
export default TeamDetailsComponent; 