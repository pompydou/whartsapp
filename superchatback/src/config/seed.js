require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose   = require('mongoose');
const connectDB  = require('./db');
const Discussion = require('../models/Discussion');

const SEED_DATA = [
  { name: 'Marie Dupont',    preview: 'Salut ! Comment ça va ?',    time: '10:30', unread: 2,  avatarColor: '#FF6B6B', type: 'text',       online: true  },
  { name: 'Jean Martin',     preview: '0:17',                        time: '09:15', unread: 0,  avatarColor: '#4ECDC4', type: 'voice'                     },
  { name: 'Groupe Famille',  preview: 'Sophie: Photo envoyée',       time: 'Hier',  unread: 5,  avatarColor: '#A29BFE', type: 'group',      muted: true   },
  { name: 'Paul Durand',     preview: 'Appel vidéo',                 time: 'Hier',  unread: 0,  avatarColor: '#FD79A8', type: 'video-call'                },
  { name: 'Emma Petit',      preview: "D'accord, à demain !",        time: '15/03', unread: 0,  avatarColor: '#FDCB6E', type: 'text',       sent: true    },
  { name: 'Lucas Robert',    preview: 'Tu as vu le match ?',         time: '14/03', unread: 1,  avatarColor: '#00B894', type: 'text',       online: true  },
  { name: 'Travail SkoPay',  preview: 'Réunion à 14h confirmée',     time: '14/03', unread: 3,  avatarColor: '#6C5CE7', type: 'group'                     },
  { name: 'Kofi Mensah',     preview: 'Ok je vois ça demain matin',  time: '13/03', unread: 0,  avatarColor: '#E17055', type: 'text'                      },
  { name: 'Amara Diallo',    preview: 'Merci beaucoup frère 🙏',     time: '12/03', unread: 0,  avatarColor: '#74B9FF', type: 'text',       sent: true    },
  { name: 'Dev Togo 🇹🇬',   preview: 'Nouveau post dans le groupe', time: '11/03', unread: 12, avatarColor: '#55EFC4', type: 'group',      muted: true   },
  { name: 'Sarah Kouassi',   preview: 'On se voit ce soir ?',        time: '11/03', unread: 0,  avatarColor: '#FF9FF3', type: 'text',       online: true  },
  { name: 'Thomas Bamba',    preview: '1:23',                        time: '10/03', unread: 0,  avatarColor: '#54A0FF', type: 'voice'                     },
  { name: 'Équipe Football', preview: 'Match dimanche à 15h',        time: '10/03', unread: 8,  avatarColor: '#48DBFB', type: 'group'                     },
  { name: 'Fatou Traoré',    preview: 'Merci pour ton aide !',       time: '09/03', unread: 0,  avatarColor: '#FF6348', type: 'text',       sent: true    },
  { name: 'David Koffi',     preview: "Tu peux m'appeler ?",         time: '09/03', unread: 2,  avatarColor: '#1DD1A1', type: 'text',       online: true  },
];

const seed = async () => {
  await connectDB();
  await Discussion.deleteMany({});
  await Discussion.insertMany(SEED_DATA);
  console.log(`[Seed] ${SEED_DATA.length} discussions insérées`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('[Seed] Erreur :', err);
  process.exit(1);
});
