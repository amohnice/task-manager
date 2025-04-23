const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a team name'],
    trim: true,
    maxlength: [50, 'Team name cannot be more than 50 characters']
  },
  description: {
    type: String,
    trim: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure the creator is always a member
TeamSchema.pre('save', function(next) {
  if (this.isNew) {
    const creatorIsMember = this.members.some(
      member => member.user.toString() === this.createdBy.toString()
    );
    if (!creatorIsMember) {
      this.members.push({
        user: this.createdBy,
        role: 'admin'
      });
    }
  }
  next();
});

module.exports = mongoose.model('Team', TeamSchema); 