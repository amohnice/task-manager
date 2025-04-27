const Team = require('../models/Team');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
exports.getTeams = async (req, res) => {
  try {
    // Find all teams
    const teams = await Team.find()
    .populate('members.user', 'name email')
    .populate('createdBy', 'name email')
    .sort('-createdAt');

    // Update user's teams array if it's empty
    const user = await User.findById(req.user.id);
    if (!user.teams || user.teams.length === 0) {
      const teamIds = teams.map(team => team._id);
      await User.findByIdAndUpdate(req.user.id, {
        $set: { teams: teamIds }
      }, { new: true });
    }

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is a member of the team or the creator
    const isMember = team.members.some(member => member.user._id.toString() === req.user.id);
    const isCreator = team.createdBy._id.toString() === req.user.id;

    if (!isMember && !isCreator) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this team'
      });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create team
// @route   POST /api/teams
// @access  Private
exports.createTeam = async (req, res) => {
  try {
    // Set the creator and add them as an admin member
    req.body.createdBy = req.user.id;
    req.body.members = [{
      user: req.user.id,
      role: 'admin'
    }];
    
    const team = await Team.create(req.body);

    // Update user's teams array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { teams: team._id }
    }, { new: true });

    // Populate the created team with user details
    const populatedTeam = await Team.findById(team._id)
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTeam
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
exports.updateTeam = async (req, res) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Make sure user is team admin
    const isAdmin = team.members.some(
      member => member.user.toString() === req.user.id && member.role === 'admin'
    );
    if (!isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this team'
      });
    }

    team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Make sure user is team admin
    const isAdmin = team.members.some(
      member => member.user.toString() === req.user.id && member.role === 'admin'
    );
    if (!isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this team'
      });
    }

    await team.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private
exports.addMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    const { email, role } = req.body;

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Make sure user is team admin
    const isAdmin = team.members.some(
      member => member.user.toString() === req.user.id && member.role === 'admin'
    );
    if (!isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to add members'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const isMember = team.members.some(
      member => member.user.toString() === user._id.toString()
    );
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team'
      });
    }

    // Add member
    team.members.push({ user: user._id, role });
    await team.save();

    // Create notification
    await Notification.create({
      user: user._id,
      type: 'team-invite',
      message: `You have been added to the team "${team.name}" as a ${role}`
    });

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members
// @access  Private
exports.removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    const { userId } = req.body;

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Make sure user is team admin
    const isAdmin = team.members.some(
      member => member.user.toString() === req.user.id && member.role === 'admin'
    );
    if (!isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to remove members'
      });
    }

    // Check if user to be removed exists
    const memberToRemove = team.members.find(
      member => member.user.toString() === userId
    );
    if (!memberToRemove) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in team'
      });
    }

    // Remove member
    team.members = team.members.filter(
      member => member.user.toString() !== userId
    );
    await team.save();

    // Create notification
    await Notification.create({
      user: userId,
      type: 'team-remove',
      message: `You have been removed from the team "${team.name}"`
    });

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
