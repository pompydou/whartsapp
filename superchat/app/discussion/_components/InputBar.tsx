import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Message } from './MessageBubble';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach: () => void;
  onEmojiPress: () => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  editingMsg?: Message | null;
  onCancelEdit?: () => void;
  paddingBottom?: number;
}

export default function InputBar({
  value, onChangeText, onSend, onAttach, onEmojiPress,
  replyTo, onCancelReply, editingMsg, onCancelEdit, paddingBottom = 8,
}: Props) {
  const hasText = value.trim().length > 0;

  return (
    <View style={[styles.wrapper, { paddingBottom }]}>
      {/* Bannière de réponse */}
      {replyTo && !editingMsg && (
        <View style={styles.banner}>
          <View style={styles.bannerAccent} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerLabel}>Répondre à</Text>
            <Text style={styles.bannerText} numberOfLines={1}>{replyTo.content}</Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.bannerClose}>
            <Ionicons name="close" size={18} color="#888" />
          </TouchableOpacity>
        </View>
      )}

      {/* Bannière d'édition */}
      {editingMsg && (
        <View style={styles.banner}>
          <View style={[styles.bannerAccent, { backgroundColor: '#FF9500' }]} />
          <View style={styles.bannerContent}>
            <Text style={[styles.bannerLabel, { color: '#FF9500' }]}>Modifier le message</Text>
            <Text style={styles.bannerText} numberOfLines={1}>{editingMsg.content}</Text>
          </View>
          <TouchableOpacity onPress={onCancelEdit} style={styles.bannerClose}>
            <Ionicons name="close" size={18} color="#888" />
          </TouchableOpacity>
        </View>
      )}

      {/* Barre principale */}
      <View style={styles.bar}>
        <TouchableOpacity style={styles.sideBtn} onPress={onEmojiPress}>
          <Ionicons name="happy-outline" size={24} color="#8E8E93" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={editingMsg ? 'Modifier le message…' : 'Message…'}
          placeholderTextColor="#AAAAAA"
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={1000}
        />

        {!hasText && (
          <TouchableOpacity style={styles.sideBtn} onPress={onAttach} hitSlop={8}>
            <Ionicons name="add" size={30} color="#007AFF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
          <Ionicons
            name={hasText ? 'send' : 'mic'}
            size={hasText ? 18 : 20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8E8EE',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F5',
    gap: 10,
  },
  bannerAccent: {
    width: 3,
    height: 36,
    borderRadius: 2,
    backgroundColor: '#25D366',
  },
  bannerContent: { flex: 1 },
  bannerLabel: { fontSize: 12, fontWeight: '700', color: '#25D366', marginBottom: 2 },
  bannerText:  { fontSize: 13, color: '#555', lineHeight: 18 },
  bannerClose: { padding: 4 },

  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 6,
  },
  sideBtn: { padding: 6, marginBottom: 4 },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: '#0D0D0D',
    maxHeight: 120,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#25D366',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 4, elevation: 3,
  },
});
