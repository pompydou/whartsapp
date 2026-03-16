const express = require('express');
const router  = express.Router();
const {
  getDiscussions, getDiscussionById, getMessages, getMessageById,
  createDiscussion, sendMessage, markAsRead,
  deleteMessage, editMessage, addReaction, markMessageRead,
  deleteDiscussion,
} = require('../controllers/discussionController');

// ─── Routes de discussions ────────────────────────────────────────────────────
router.get('/',      getDiscussions);
router.post('/',     createDiscussion);

// Routes spécifiques avec :id (ordre important !)
router.get('/:id/messages',         getMessages);
router.get('/:id/message/:msgId',   getMessageById);
router.post('/:id/message',         sendMessage);
router.delete('/:id/message/:msgId',deleteMessage);
router.patch('/:id/message/:msgId/edit',    editMessage);
router.post('/:id/message/:msgId/reaction', addReaction);
router.patch('/:id/message/:msgId/read',    markMessageRead);
router.patch('/:id/read',           markAsRead);
router.get('/:id',                  getDiscussionById);
router.delete('/:id',               deleteDiscussion);

module.exports = router;
