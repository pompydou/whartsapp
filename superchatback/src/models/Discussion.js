const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema({
  emoji:  { type: String, required: true },
  sender: { type: String, required: true },
}, { _id: false });

const MessageSchema = new mongoose.Schema(
  {
    sender:    { type: String, required: true },
    content:   { type: String, required: true },
    type:      { type: String, enum: ['text', 'voice', 'image', 'file'], default: 'text' },
    mediaUri:  { type: String, default: null },  // URI pour images/documents
    read:      { type: Boolean, default: false },
    deleted:   { type: Boolean, default: false },
    edited:    { type: Boolean, default: false },
    reactions: [ReactionSchema],
    replyTo:   { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

const DiscussionSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    preview:     { type: String, default: '' },
    time:        { type: String, default: '' },
    unread:      { type: Number, default: 0, min: 0 },
    avatarColor: { type: String, default: '#25D366' },
    type:        { type: String, enum: ['text', 'voice', 'video-call', 'group'], default: 'text' },
    muted:       { type: Boolean, default: false },
    sent:        { type: Boolean, default: false },
    online:      { type: Boolean, default: false },
    messages:    [MessageSchema],
  },
  { timestamps: true }
);

DiscussionSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Discussion', DiscussionSchema);
