import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export interface Message {
  _id: string;
  sender: string;
  content: string;
  type: 'text' | 'voice' | 'image' | 'file';
  mediaUri?: string | null;
  read: boolean;
  deleted: boolean;
  edited: boolean;
  reactions: { emoji: string; sender: string }[];
  replyTo?: string | null;
  createdAt: string;
}

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🙏'];

interface Props {
  msg: Message;
  isMe: boolean;
  repliedMsg?: Message | null;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onReact: (id: string, emoji: string) => void;
  onReply: (msg: Message) => void;
  onScrollTo?: (id: string) => void;
}

export default function MessageBubble({ msg, isMe, repliedMsg, onDelete, onEdit, onReact, onReply, onScrollTo }: Props) {
  const [menuVisible, setMenuVisible] = useState(false);

  // Formatage de l'heure
  const time = new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Grouper les réactions par emoji
  const reactionGroups = msg.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Gestion du long press pour le menu contextuel
  const handleLongPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMenuVisible(true);
  };

  // Items du menu contextuel
  const menuItems = [
    { label: 'Répondre', icon: 'reply-outline', action: () => onReply(msg), danger: false },
    { label: 'Modifier', icon: 'create-outline', action: () => onEdit(msg._id, msg.content), danger: false },
    { label: 'Transférer', icon: 'share-outline', action: () => {}, danger: false },
    { label: 'Copier', icon: 'copy-outline', action: () => {}, danger: false },
    { label: 'Supprimer', icon: 'trash-outline', action: () => onDelete(msg._id), danger: true },
  ];

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={handleLongPress}
        style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}
      >
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem, msg.deleted && styles.bubbleDeleted]}>
          {/* Aperçu du message auquel on répond */}
          {repliedMsg && !msg.deleted && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onScrollTo?.(repliedMsg._id)}
              style={[styles.replyContainer, isMe ? styles.replyContainerMe : styles.replyContainerThem]}
            >
              <View style={[styles.replyAccent, { backgroundColor: isMe ? '#FFF' : '#25D366' }]} />
              <View style={styles.replyContent}>
                <Text style={[styles.replySender, { color: isMe ? '#FFF' : '#25D366' }]} numberOfLines={1}>
                  {repliedMsg.sender === msg.sender ? (isMe ? 'Vous' : 'Lui') : repliedMsg.sender}
                </Text>
                <Text style={[styles.replyText, isMe && styles.replyTextMe]} numberOfLines={2}>
                  {repliedMsg.content}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {msg.deleted ? (
            <Text style={styles.deletedText}>🚫 Ce message a été supprimé</Text>
          ) : (
            <>
              {/* Affichage pour les images */}
              {msg.type === 'image' && msg.mediaUri && (
                <View style={[styles.imageContainer, isMe ? styles.imageContainerMe : styles.imageContainerThem]}>
                  <Image source={{ uri: msg.mediaUri }} style={styles.messageImage} resizeMode="cover" />
                </View>
              )}

              {/* Affichage pour les fichiers */}
              {msg.type === 'file' && (
                <View style={[styles.fileContainer, isMe ? styles.fileContainerMe : styles.fileContainerThem]}>
                  <Ionicons name="document-outline" size={32} color={isMe ? 'white' : '#007AFF'} />
                  <Text style={[styles.fileName, isMe && styles.fileNameMe]} numberOfLines={1}>{msg.content}</Text>
                </View>
              )}

              {/* Affichage pour le texte */}
              {msg.type === 'text' && (
                <Text style={[styles.text, isMe ? styles.textMe : styles.textThem]}>{msg.content}</Text>
              )}

              <View style={styles.meta}>
                {msg.edited && <Text style={[styles.editedLabel, isMe && styles.editedLabelMe]}>modifié</Text>}
                <Text style={[styles.time, isMe && styles.timeMe]}>{time}</Text>
                {isMe && (
                  <Ionicons
                    name={msg.read ? 'checkmark-done' : 'checkmark'}
                    size={14}
                    color={msg.read ? '#90CAF9' : 'rgba(255,255,255,0.6)'}
                    style={{ marginLeft: 2 }}
                  />
                )}
              </View>
            </>
          )}
        </View>

        {/* Réactions */}
        {Object.keys(reactionGroups).length > 0 && (
          <View style={[styles.reactions, isMe ? styles.reactionsMe : styles.reactionsThem]}>
            {Object.entries(reactionGroups).map(([emoji, count]) => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionPill}
                onPress={() => onReact(msg._id, emoji)}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* Menu contextuel iOS Style */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />

          <View style={styles.menuContainer}>
            {/* Quick emojis */}
            <View style={styles.quickEmojisContainer}>
              {QUICK_EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  activeOpacity={0.6}
                  onPress={() => { setMenuVisible(false); onReact(msg._id, e); }}
                  style={styles.quickEmojiBtn}
                >
                  <Text style={styles.quickEmoji}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bulle rappel du message */}
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem, { marginBottom: 12, opacity: 0.95 }]}>
               <Text style={[styles.text, isMe ? styles.textMe : styles.textThem]}>{msg.content}</Text>
            </View>

            {/* Liste d'actions */}
            <View style={styles.contextMenu}>
              {menuItems.map((item, idx) => (
                <View key={item.label}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setMenuVisible(false);
                      setTimeout(item.action, 150);
                    }}
                  >
                    <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>{item.label}</Text>
                    <Ionicons name={item.icon as any} size={20} color={item.danger ? '#FF3B30' : '#111'} />
                  </TouchableOpacity>
                  {idx < menuItems.length - 1 && <View style={styles.menuDivider} />}
                </View>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: { marginVertical: 3, flexDirection: 'column' },
  rowMe:   { alignItems: 'flex-end' },
  rowThem: { alignItems: 'flex-start' },

  bubble: {
    maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 1,
  },
  bubbleMe:      { backgroundColor: '#25D366', borderBottomRightRadius: 4 },
  bubbleThem:    { backgroundColor: 'white',   borderBottomLeftRadius: 4 },
  bubbleDeleted: { backgroundColor: '#F0F0F5', borderWidth: 1, borderColor: '#E0E0E0' },

  deletedText: { fontSize: 14, color: '#AAAAAA', fontStyle: 'italic' },
  text:   { fontSize: 16, lineHeight: 22 },
  textMe:   { color: 'white' },
  textThem: { color: '#0D0D0D' },

  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
  editedLabel:   { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' },
  editedLabelMe: { color: 'rgba(255,255,255,0.6)' },
  time:   { fontSize: 11, color: '#8E8E93' },
  timeMe: { color: 'rgba(255,255,255,0.7)' },

  reactions:    { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: -6, marginBottom: 4 },
  reactionsMe:  { justifyContent: 'flex-end', marginRight: 10 },
  reactionsThem:{ justifyContent: 'flex-start', marginLeft: 10 },
  reactionPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 14,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: '#EFEFEF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 11, color: '#666', marginLeft: 4, fontWeight: '700' },

  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  menuContainer: { width: '100%', alignItems: 'center' },

  quickEmojisContainer: {
    flexDirection: 'row', backgroundColor: 'white',
    borderRadius: 30, paddingHorizontal: 12, paddingVertical: 8,
    marginBottom: 12, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 5,
  },
  quickEmojiBtn: { padding: 4 },
  quickEmoji: { fontSize: 28 },

  contextMenu: {
    backgroundColor: 'white', borderRadius: 14,
    width: 250, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 15,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14
  },
  menuLabel: { fontSize: 17, color: '#000', fontWeight: '400' },
  menuLabelDanger: { color: '#FF3B30' },
  menuDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#DDD', marginHorizontal: 0 },

  // Styles pour la réponse (Reply)
  replyContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    overflow: 'hidden',
  },
  replyContainerMe: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  replyContainerThem: {
    backgroundColor: '#F5F5F5',
  },
  replyAccent: {
    width: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replySender: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    color: '#666',
  },
  replyTextMe: {
    color: 'rgba(255,255,255,0.8)',
  },

  // Styles pour les images
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
    maxWidth: 260,
  },
  imageContainerMe: {
    alignSelf: 'flex-end',
  },
  imageContainerThem: {
    alignSelf: 'flex-start',
  },
  messageImage: {
    width: 260,
    height: 200,
  },

  // Styles pour les fichiers
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    gap: 10,
    marginBottom: 6,
    minWidth: 200,
  },
  fileContainerMe: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  fileContainerThem: {
    backgroundColor: '#F5F5F5',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    flex: 1,
  },
  fileNameMe: {
    color: 'white',
  },
});
