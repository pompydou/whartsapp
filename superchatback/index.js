require('dotenv').config();

const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const cors     = require('cors');

const connectDB          = require('./src/config/db');
const authRoutes         = require('./src/routes/authRoutes');
const discussionRoutes   = require('./src/routes/discussionRoutes');
const backupRoutes       = require('./src/routes/backupRoutes');
const discussionSocket   = require('./src/sockets/discussionSocket');

// ─── Connexion MongoDB ────────────────────────────────────────────────────────
connectDB();

// ─── App Express ──────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
});

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Rendre io accessible dans les controllers si besoin
app.set('io', io);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);         // Authentification
app.use('/api/discussions', discussionRoutes);  // Discussions
app.use('/api/backup',     backupRoutes);       // Sauvegarde

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Sockets ──────────────────────────────────────────────────────────────────
discussionSocket(io);

// ─── Démarrage ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[Server] Démarré sur http://localhost:${PORT}`);
});
