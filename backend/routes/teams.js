const express = require('express');
const router = express.Router();
const {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember
} = require('../controllers/teams');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getTeams)
  .post(protect, createTeam);

router.route('/:id')
  .get(protect, getTeam)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

router.route('/:id/members')
  .post(protect, addMember)
  .delete(protect, removeMember);

module.exports = router; 