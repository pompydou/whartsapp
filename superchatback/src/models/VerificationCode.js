const mongoose = require('mongoose');

const VerificationCodeSchema = new mongoose.Schema(
  {
    phone:        { type: String, required: true, trim: true },
    countryCode:  { type: String, required: true, default: '+228' },
    code:         { type: String, required: true, length: 6 },
    type:         { type: String, enum: ['register', 'login'], required: true },
    expiresAt:    { type: Date, required: true },
    isUsed:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index pour recherche rapide et expiration
VerificationCodeSchema.index({ phone: 1, countryCode: 1, createdAt: -1 });
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Méthode pour vérifier si le code est expiré
VerificationCodeSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

module.exports = mongoose.model('VerificationCode', VerificationCodeSchema);
