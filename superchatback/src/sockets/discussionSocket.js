const Discussion = require('../models/Discussion');

const _time = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
};

const discussionSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connecté : ${socket.id}`);

    socket.on('join_discussion',  (id) => { socket.join(id); });
    socket.on('leave_discussion', (id) => { socket.leave(id); });

    // ── Envoyer un message ────────────────────────────────────────────────────
    socket.on('send_message', async ({ discussionId, preview, sender, replyTo, type, mediaUri }) => {
      try {
        const d = await Discussion.findById(discussionId);
        if (!d) return socket.emit('error', { message: 'Discussion non trouvée' });

        d.messages.push({ 
          sender, 
          content: preview, 
          type: type || 'text', 
          replyTo: replyTo || null,
          mediaUri: mediaUri || null,
        });
        d.preview = preview;
        d.time    = _time();
        d.unread  = d.unread + 1;
        d.sent    = true;
        await d.save();

        const newMsg = d.messages[d.messages.length - 1];
        const disc   = { ...d.toObject(), id: d._id.toString() };

        socket.emit('message_sent', { discussion: disc, message: newMsg });
        // Envoyer new_message uniquement aux autres membres de la room, pas au sender
        socket.to(discussionId).emit('new_message', { discussion: disc, message: newMsg });
      } catch (e) {
        socket.emit('error', { message: e.message });
      }
    });

    // ── Supprimer un message ──────────────────────────────────────────────────
    socket.on('delete_message', async ({ discussionId, messageId }) => {
      try {
        const d = await Discussion.findById(discussionId);
        if (!d) return;
        const msg = d.messages.id(messageId);
        if (!msg) return;
        msg.deleted = true;
        msg.content = 'Ce message a été supprimé';
        await d.save();
        io.emit('message_deleted', { discussionId, messageId });
      } catch (e) { socket.emit('error', { message: e.message }); }
    });

    // ── Modifier un message ───────────────────────────────────────────────────
    socket.on('edit_message', async ({ discussionId, messageId, content }) => {
      try {
        const d = await Discussion.findById(discussionId);
        if (!d) return;
        const msg = d.messages.id(messageId);
        if (!msg) return;
        msg.content = content;
        msg.edited  = true;
        await d.save();
        io.emit('message_edited', { discussionId, messageId, content });
      } catch (e) { socket.emit('error', { message: e.message }); }
    });

    // ── Réaction sur un message ───────────────────────────────────────────────
    socket.on('add_reaction', async ({ discussionId, messageId, emoji, sender }) => {
      try {
        const d = await Discussion.findById(discussionId);
        if (!d) return;
        const msg = d.messages.id(messageId);
        if (!msg) return;
        msg.reactions = msg.reactions.filter(r => r.sender !== sender);
        msg.reactions.push({ emoji, sender });
        await d.save();
        io.emit('message_reaction', { discussionId, messageId, emoji, sender });
      } catch (e) { socket.emit('error', { message: e.message }); }
    });

    // ── Marquer comme lu ──────────────────────────────────────────────────────
    socket.on('mark_read', async ({ discussionId }) => {
      try {
        await Discussion.findByIdAndUpdate(discussionId, { unread: 0 });
        io.emit('discussion_read', { id: discussionId });
      } catch (e) { socket.emit('error', { message: e.message }); }
    });

    // ── Indicateur de frappe ──────────────────────────────────────────────────
    socket.on('typing',      ({ discussionId, userName }) => socket.to(discussionId).emit('user_typing',      { discussionId, userName }));
    socket.on('stop_typing', ({ discussionId })           => socket.to(discussionId).emit('user_stop_typing', { discussionId }));

    socket.on('disconnect', () => console.log(`[Socket] Déconnecté : ${socket.id}`));
  });
};

module.exports = discussionSocket;
