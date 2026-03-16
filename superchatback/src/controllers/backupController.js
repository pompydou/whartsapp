const nodemailer = require('nodemailer');
const Discussion = require('../models/Discussion');

// ─── Config email (à mettre dans .env) ───────────────────────────────────────
const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password Gmail (pas le vrai mot de passe)
  },
});

// ─── POST /api/backup/export ──────────────────────────────────────────────────
// Exporte toutes les discussions + messages en JSON et envoie par email
const exportBackup = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: '"email" requis' });

    const discussions = await Discussion.find().lean();

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      discussions,
    };

    const json = JSON.stringify(backup, null, 2);

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"SuperChat Backup" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Sauvegarde SuperChat — ${new Date().toLocaleDateString('fr-FR')}`,
      text: 'Votre sauvegarde SuperChat est en pièce jointe.',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#25D366">SuperChat — Sauvegarde</h2>
          <p>Votre sauvegarde du <strong>${new Date().toLocaleDateString('fr-FR')}</strong> est en pièce jointe.</p>
          <p style="color:#888;font-size:13px">
            ${discussions.length} discussion(s) exportée(s).<br>
            Conservez ce fichier pour restaurer vos données plus tard.
          </p>
        </div>
      `,
      attachments: [{
        filename: `superchat-backup-${Date.now()}.json`,
        content: json,
        contentType: 'application/json',
      }],
    });

    res.json({ success: true, message: `Sauvegarde envoyée à ${email}` });
  } catch (e) {
    console.error('[Backup] Export error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// ─── POST /api/backup/import ──────────────────────────────────────────────────
// Importe un fichier JSON de sauvegarde (body: { backup: {...} })
const importBackup = async (req, res) => {
  try {
    const { backup } = req.body;
    if (!backup || !backup.discussions) {
      return res.status(400).json({ error: 'Format de sauvegarde invalide' });
    }

    // On supprime les _id pour laisser Mongo en générer de nouveaux
    // et éviter les conflits si la DB n'est pas vide
    const toInsert = backup.discussions.map(({ _id, __v, ...d }) => d);

    await Discussion.insertMany(toInsert, { ordered: false });

    res.json({ success: true, imported: toInsert.length });
  } catch (e) {
    console.error('[Backup] Import error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// ─── GET /api/backup/download ─────────────────────────────────────────────────
// Télécharge directement le JSON sans email (utile pour debug / local)
const downloadBackup = async (req, res) => {
  try {
    const discussions = await Discussion.find().lean();
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      discussions,
    };
    res.setHeader('Content-Disposition', `attachment; filename="superchat-backup-${Date.now()}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(backup, null, 2));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = { exportBackup, importBackup, downloadBackup };
