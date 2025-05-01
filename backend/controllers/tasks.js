const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ]
    })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('team', 'name')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('team', 'name')
      .populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const task = await Task.create(req.body);

    // Create notification if task is assigned to someone
    if (req.body.assignedTo) {
      await Notification.create({
        user: req.body.assignedTo,
        type: 'task-assigned',
        message: `You have been assigned to task: ${task.title}`,
        relatedTask: task._id
      });
    }

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Make sure user is task creator
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Create notification if task status is updated
    if (req.body.status && task.assignedTo) {
      await Notification.create({
        user: task.assignedTo,
        type: 'task-updated',
        message: `Task status updated: ${task.title}`,
        relatedTask: task._id
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.deleteOne({_id:req.params.id});

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Make sure user is task creator
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.remove();

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

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text
    };

    task.comments.unshift(comment);
    await task.save();

    // Create notification for task creator and assigned user
    if (task.createdBy.toString() !== req.user.id) {
      await Notification.create({
        user: task.createdBy,
        type: 'comment-added',
        message: `New comment on task: ${task.title}`,
        relatedTask: task._id
      });
    }

    if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
      await Notification.create({
        user: task.assignedTo,
        type: 'comment-added',
        message: `New comment on task: ${task.title}`,
        relatedTask: task._id
      });
    }

    res.status(200).json({
      success: true,
      data: task.comments
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}; 
