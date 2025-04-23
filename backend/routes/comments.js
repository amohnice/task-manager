const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Create a new comment
router.post('/', auth, async (req, res) => {
  try {
    const comment = new Comment({
      ...req.body,
      user: req.user._id
    });
    await comment.save();

    // Add comment to task
    const task = await Task.findById(req.body.task);
    task.comments.push(comment._id);
    await task.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all comments for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update comment
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['content'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates!' });
  }

  try {
    const comment = await Comment.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    updates.forEach(update => comment[update] = req.body[update]);
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Remove comment from task
    const task = await Task.findById(comment.task);
    task.comments = task.comments.filter(commentId => commentId.toString() !== comment._id.toString());
    await task.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 