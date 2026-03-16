const Discussion = require('../models/Discussion');

const _time = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
};

// ─── GET /api/discussions ─────────────────────────────────────────────────────
const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find().select('-messages').sort({ updatedAt: -1 });
    res.json(discussions);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ─── GET /api/discussions/:id ─────────────────────────────────────────────────
const getDiscussionById = async (req, res) => {
  try {
    const d = await Discussion.findById(req.params.id);
    if (!d) return res.status(404).json({ error: 'Discussion non trouvée' });
    res.json(d);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ─── GET /api/discussions/:id/messages ───────────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const d = await Discussion.findById(req.params.id).select('messages name avatarColor online');
    if (!d) return res.status(404).json({ error: 'Discussion non trouvée' });
    res.json({ messages: d.messages, name: d.name, avatarColor: d.avatarColor, online: d.online });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ─── GET /api/discussions/:id/message/:msgId ─────────────────────────────────
const getMessageById = async (req, res) => {
  try {
    const d = await Discussion.findById(req.params.id).select('messages');
    if (!d) return res.status(404).json({ error: 'Discussion non trouvée' });
    const msg = d.messages.id(req.params.msgId);
    if (!msg) return res.status(404).json({ error: 'Message non trouvé' });
    res.json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ─── POST /api/discussions ────────────────────────────────────────────────────
const createDiscussion = async (req, res) => {
  try {
    const { name, avatarColor, type } = req.body;
    if (!name) return res.status(400).json({ error: '"name" requis' });
    const d = await Discussion.create({ name, avatarColor, type });
    res.status(201).json(d);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ─── POST /api/discussions/:id/message ───────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { preview, sender, type, replyTo, mediaUri } = req.body;
    if (!preview || !sender) return res.status(400).json({ error: '"preview" et "sender" requis' });

    const d = await Discussion.findById(req.params.id);
    if (!d) return res.status(404).json({ error: 'Discussion non trouvée' });

    const msg = { 
      sender, 
      content: preview, 
      type: type || 'text', 
      replyTo: replyTo || null,
      mediaUri: mediaUri || null,
    };
    d.messages.push(msg);
    d.preview = preview;
    d.time    = _time();
    d.unread  = d.unread + 1;
    d.sent    = false;
    await d.save();

    const newMsg = d.messages[d.messages.length - 1];
    const io = req.app.get('io');
    if (io) io.emit('new_message', { discussion: { ...d.toObject(), id: d._id }, message: newMsg });

    res.json({ success: true, message: newMsg });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ─── PATCH /api/discussions/:id/read ─────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const d = await Discussion.findByIdAndUpdate(req.params.id, { unread: 0 }, { new: true }).select('-messages');
    if (!d) return res.status(404).json({ error: 'Discussion non trouvée' });
    const io = req.app.get('io');
    if (io) io.emit('discussion_read', { id: d._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ─── DELETE /api/discussions/:id/message/:msgId ───────────────────────────────
const deleteMessage = async (req, res) => {
  try {
    const d = await Discussion.findById(req.params.id);
    if (!d) return res.status(404).json({ error: 'Discussion non trouvée' });

    const msg = d.messages.id(req.params.msgId);
    if (!msg) return res.status(404).json({ error: 'Message non trouvé' });

    msg.deleted = true;
    msg.content = 'Ce message a été supprimé';
    await d.save();

    const io = req.app.get('io');
    if (io) io.emit('message_deleted', { discussionId: req.params.id, messageId: req.params.msgId });

    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ─── PATCH /api/discussions/:id/message/:msgId/edit ──────────────────────────
const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: '"content" requis' });

    const d = await Discussion.findById(req.params.id);
    if (!d) return res.status(404).json({ error: 'Discussion non trouvée' });

    const msg = d.messages.id(req.params.msgId);
    if (!msg) return res.status(404).json({ error: 'Message non trouvé' });

    msg.content = content;
    msg.edited  = true;
    await d.save();

    const io = req.app.get('io');
    if (io) io.emit('message_edited', { discussionId: req.params.id, messageId: req.params.msgId, content });

    res.json({ success: true, message: msg });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ─── POST /api/discussions/:id/message/:msgId/reaction ───────────────────────
const addReaction = async (req, res) => {
  try {
    const { emoji, sender } = req.body;
    if (!emoji || !sender) return res.status(400).json({ error: '"emoji" et "sender" requis' });

    const d = await Discussion.findById(req.params.id);
    if (!d) return res.status(404).json({ error: 'Discussion non trouvée' });

    const msg = d.messages.id(req.params.msgId);
    if (!msg) return res.status(404).json({ error: 'Message non trouvé' });

    // Retirer l'ancienne réaction du même sender si elle existe
    msg.reactions = msg.reactions.filter(r => r.sender !== sender);
    msg.reactions.push({ emoji, sender });
    await d.save();

    const io = req.app.get('io');
    if (io) io.emit('message_reaction', { discussionId: req.params.id, messageId: req.params.msgId, emoji, sender });

    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ─── PATCH /api/discussions/:id/message/:msgId/read ──────────────────────────
const markMessageRead = async (req, res) => {
  try {
    const d = await Discussion.findById(req.params.id);
    if (!d) return res.status(404).json({ error: 'Discussion non trouvée' });

    const msg = d.messages.id(req.params.msgId);
    if (!msg) return res.status(404).json({ error: 'Message non trouvé' });

    msg.read = true;
    await d.save();

    const io = req.app.get('io');
    if (io) io.emit('message_read', { discussionId: req.params.id, messageId: req.params.msgId });

    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ─── DELETE /api/discussions/:id ─────────────────────────────────────────────
const deleteDiscussion = async (req, res) => {
  try {
    const d = await Discussion.findByIdAndDelete(req.params.id);
    if (!d) return res.status(404).json({ error: 'Discussion non trouvée' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = {
  getDiscussions, getDiscussionById, getMessages, getMessageById,
  createDiscussion, sendMessage, markAsRead,
  deleteMessage, editMessage, addReaction, markMessageRead,
  deleteDiscussion,
};
