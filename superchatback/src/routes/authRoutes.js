const express = require('express');
const router  = express.Router();
const {
  register,
  loginRequest,
  verifyCode,
  resendCode,
  updateEmail,
  getMe,
  authMiddleware,
} = require('../controllers/authController');

// ─── Routes publiques ─────────────────────────────────────────────────────────
router.post('/register',       register);       // Initier inscription
router.post('/login-request',  loginRequest);   // Initier connexion
router.post('/verify-code',    verifyCode);     // Vérifier code SMS
router.post('/resend-code',    resendCode);     // Renvoyer code

// ─── Routes protégées (nécessitent un token) ─────────────────────────────────
router.patch('/user/email',  authMiddleware, updateEmail);  // Mettre à jour email
router.get('/user/me',       authMiddleware, getMe);        // Infos utilisateur

module.exports = router;
