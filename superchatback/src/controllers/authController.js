const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const jwt = require('jsonwebtoken');

// ─── Configuration JWT ────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'superchat-secret-key-change-in-production';
const JWT_EXPIRATION = '30d';

// ─── Générer un token JWT ─────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

// ─── CODE DE VÉRIFICATION FIXE POUR LES TESTS ─────────────────────────────────
const TEST_CODE = '123456';
const CODE_EXPIRY_MINUTES = 10;

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Initie l'inscription : crée un utilisateur et génère un code de vérification
const register = async (req, res) => {
  try {
    const { fullName, phone, countryCode = '+228' } = req.body;

    // Validation des champs requis
    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Nom et téléphone requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ phone, countryCode });
    if (existingUser) {
      return res.status(409).json({ error: 'Ce numéro est déjà inscrit' });
    }

    // Créer l'utilisateur (non vérifié pour l'instant)
    const user = await User.create({
      fullName,
      phone,
      countryCode,
      isVerified: false,
    });

    // Créer le code de vérification (123456 pour les tests)
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    await VerificationCode.create({
      phone,
      countryCode,
      code: TEST_CODE,  // Code fixe pour les tests
      type: 'register',
      expiresAt,
    });

    res.json({
      success: true,
      message: 'Code de vérification envoyé',
      userId: user._id,
      testCode: TEST_CODE,  // À retirer en production
    });
  } catch (e) {
    console.error('[Auth] Register error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// ─── POST /api/auth/login-request ─────────────────────────────────────────────
// Initie la connexion : génère un code de vérification pour un utilisateur existant
const loginRequest = async (req, res) => {
  try {
    const { phone, countryCode = '+228' } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Téléphone requis' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ phone, countryCode });
    if (!user) {
      return res.status(404).json({ error: 'Ce numéro n\'est pas inscrit' });
    }

    // Créer le code de vérification
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    await VerificationCode.create({
      phone,
      countryCode,
      code: TEST_CODE,  // Code fixe pour les tests
      type: 'login',
      expiresAt,
    });

    res.json({
      success: true,
      message: 'Code de vérification envoyé',
      userId: user._id,
      testCode: TEST_CODE,  // À retirer en production
    });
  } catch (e) {
    console.error('[Auth] Login request error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// ─── POST /api/auth/verify-code ───────────────────────────────────────────────
// Vérifie le code et retourne un token JWT
const verifyCode = async (req, res) => {
  try {
    const { phone, code, countryCode = '+228', type } = req.body;

    if (!phone || !code || !type) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Trouver le code de vérification le plus récent
    const verificationCode = await VerificationCode.findOne({
      phone,
      countryCode,
      code,
      type,
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!verificationCode) {
      return res.status(400).json({ error: 'Code invalide ou expiré' });
    }

    // Vérifier si le code est expiré
    if (verificationCode.isExpired()) {
      return res.status(400).json({ error: 'Code expiré' });
    }

    // Marquer le code comme utilisé
    verificationCode.isUsed = true;
    await verificationCode.save();

    // Trouver l'utilisateur
    const user = await User.findOne({ phone, countryCode });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Marquer l'utilisateur comme vérifié
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // Générer le token JWT
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Vérification réussie',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        countryCode: user.countryCode,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (e) {
    console.error('[Auth] Verify code error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// ─── POST /api/auth/resend-code ───────────────────────────────────────────────
// Renvoie un nouveau code de vérification
const resendCode = async (req, res) => {
  try {
    const { phone, countryCode = '+228', type } = req.body;

    if (!phone || !type) {
      return res.status(400).json({ error: 'Téléphone et type requis' });
    }

    // Créer un nouveau code
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    await VerificationCode.create({
      phone,
      countryCode,
      code: TEST_CODE,  // Code fixe pour les tests
      type,
      expiresAt,
    });

    res.json({
      success: true,
      message: 'Nouveau code envoyé',
      testCode: TEST_CODE,
    });
  } catch (e) {
    console.error('[Auth] Resend code error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// ─── PATCH /api/user/email ────────────────────────────────────────────────────
// Met à jour l'email de l'utilisateur
const updateEmail = async (req, res) => {
  try {
    const { userId } = req.user;  // Via middleware d'authentification
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { email },
      { new: true }
    ).select('-__v');

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (e) {
    console.error('[User] Update email error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// ─── GET /api/user/me ─────────────────────────────────────────────────────────
// Retourne les infos de l'utilisateur connecté
const getMe = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId).select('-__v');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        countryCode: user.countryCode,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        status: user.status,
        lastSeen: user.lastSeen,
      },
    });
  } catch (e) {
    console.error('[User] Get me error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// ─── Middleware d'authentification JWT ────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = { userId: decoded.userId };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

module.exports = {
  register,
  loginRequest,
  verifyCode,
  resendCode,
  updateEmail,
  getMe,
  authMiddleware,
};
