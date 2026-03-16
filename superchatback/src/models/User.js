const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    fullName:      { type: String, required: true, trim: true },
    phone:         { type: String, required: true, unique: true, trim: true },
    countryCode:   { type: String, required: true, default: '+228' },
    email:         { type: String, default: null },
    avatar:        { type: String, default: null },  // URL de la photo de profil
    isVerified:    { type: Boolean, default: false },
    lastSeen:      { type: Date, default: Date.now },
    status:        { type: String, default: '☁️  Dans les nuages' },
  },
  { timestamps: true }
);

// Index pour recherche rapide par téléphone
UserSchema.index({ phone: 1, countryCode: 1 });

module.exports = mongoose.model('User', UserSchema);
