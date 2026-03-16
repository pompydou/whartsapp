import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getSocket } from '@/services/socket';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// Import des composants modulaires
import ChatHeader from './_components/ChatHeader';
import InputBar from './_components/InputBar';
import EmojiPicker from './_components/EmojiPicker';
import AttachmentMenu from './_components/AttachmentMenu';
import MessageBubble, { Message } from './_components/MessageBubble';

// ─── Constantes ───────────────────────────────────────────────────────────────
const MY_ID = 'moi';
const BASE_URL = 'http://10.1.0.240:3000/api';

// ─── Séparateur de date style WhatsApp ───────────────────────────────────────
function DateSeparator({ date }: { date: string }) {
  return (
    <View style={styles.dateSeparator}>
      <View style={styles.dateSeparatorLine} />
      <Text style={styles.dateSeparatorText}>{date}</Text>
      <View style={styles.dateSeparatorLine} />
    </View>
  );
}

// ─── Indicateur "en train d'écrire" ──────────────────────────────────────────
function TypingIndicator({ name }: { name: string }) {
  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDot} />
        <View style={styles.typingDot} />
        <View style={styles.typingDot} />
      </View>
      <Text style={styles.typingText}>{name} écrit…</Text>
    </View>
  );
}

// ─── Bouton scroll vers le bas ───────────────────────────────────────────────
function ScrollToBottomButton({ onPress, unreadCount }: { onPress: () => void; unreadCount: number }) {
  if (unreadCount === 0) return null;
  
  return (
    <TouchableOpacity style={styles.scrollToBottom} onPress={onPress} activeOpacity={0.8}>
      {unreadCount > 0 && (
        <View style={styles.scrollToBottomBadge}>
          <Text style={styles.scrollToBottomBadgeText}>{unreadCount}</Text>
        </View>
      )}
      <Ionicons name="chevron-down" size={24} color="white" />
    </TouchableOpacity>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function ConversationScreen() {
  const { id, name, avatarColor, online } = useLocalSearchParams<{
    id: string; name: string; avatarColor: string; online: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const scrollEnabled = useRef(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [attachVisible, setAttachVisible] = useState(false);
  const [replyMsg, setReplyMsg] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Chargement des messages ────────────────────────────────────────────────
  useEffect(() => {
    loadMessages();
  }, [id]);

  const loadMessages = async () => {
    try {
      const res = await fetch(`${BASE_URL}/discussions/${id}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('[Error] Loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Socket.io ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join_discussion', id);

    socket.on('new_message', ({ message }: any) => {
      setMessages(prev => {
        const exists = prev.find(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    });

    socket.on('message_sent', ({ message }: any) => {
      setMessages(prev => {
        const exists = prev.find(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    });

    socket.on('message_deleted', ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.map(m => 
        m._id === messageId ? { ...m, deleted: true, content: 'Ce message a été supprimé' } : m
      ));
    });

    socket.on('message_edited', ({ messageId, content }: { messageId: string, content: string }) => {
      setMessages(prev => prev.map(m => 
        m._id === messageId ? { ...m, content, edited: true } : m
      ));
    });

    socket.on('message_reaction', ({ messageId, emoji, sender }: any) => {
      setMessages(prev => prev.map(m => {
        if (m._id !== messageId) return m;
        const filtered = m.reactions?.filter(r => r.sender !== sender) || [];
        return { ...m, reactions: [...filtered, { emoji, sender }] };
      }));
    });

    socket.on('user_typing', ({ discussionId }: { discussionId: string }) => {
      if (discussionId === id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    socket.on('user_stop_typing', ({ discussionId }: { discussionId: string }) => {
      if (discussionId === id) setIsTyping(false);
    });

    return () => {
      socket.emit('leave_discussion', id);
      socket.off('new_message');
      socket.off('message_sent');
      socket.off('message_deleted');
      socket.off('message_edited');
      socket.off('message_reaction');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [id]);

  // ── Scroll handlers ────────────────────────────────────────────────────────
  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleScrollToMessage = (messageId: string) => {
    const index = messages.findIndex(m => m._id === messageId);
    if (index !== -1) {
      listRef.current?.scrollToIndex({ index, animated: true, viewOffset: 100 });
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    setShowScrollButton(!isCloseToBottom);
  };

  // ── Actions d'envoi ────────────────────────────────────────────────────────
  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const socket = getSocket();

    if (editingMsg) {
      socket.emit('edit_message', { discussionId: id, messageId: editingMsg._id, content: text });
      setEditingMsg(null);
    } else {
      socket.emit('send_message', {
        discussionId: id,
        preview: text,
        sender: MY_ID,
        replyTo: replyMsg?._id || null,
        type: 'text',
      });
      setReplyMsg(null);
    }

    setInputText('');
  };

  const handleSendMedia = async (uri: string, type: 'image' | 'file', content?: string) => {
    const socket = getSocket();
    
    socket.emit('send_message', {
      discussionId: id,
      preview: content || 'Média',
      sender: MY_ID,
      replyTo: replyMsg?._id || null,
      type: type,
      mediaUri: uri,
    });
    
    setReplyMsg(null);
    setAttachVisible(false);
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Accès à la caméra nécessaire');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as any,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleSendMedia(result.assets[0].uri, 'image', '📷 Photo');
      }
    } catch (error) {
      console.error('[Camera] Error:', error);
    }
  };

  const handleLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Accès à la galerie nécessaire');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleSendMedia(result.assets[0].uri, 'image', '🖼️ Image');
      }
    } catch (error) {
      console.error('[Library] Error:', error);
    }
  };

  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const doc = result.assets[0];
        await handleSendMedia(doc.uri, 'file', doc.name || 'Document');
      }
    } catch (error) {
      console.error('[Document] Error:', error);
    }
  };

  const handleAttachSelect = (type: 'camera' | 'library' | 'document' | 'location' | 'contact') => {
    switch (type) {
      case 'camera': return handleCamera();
      case 'library': return handleLibrary();
      case 'document': return handleDocument();
      case 'location': return Alert.alert('Bientôt', 'Localisation bientôt disponible');
      case 'contact': return Alert.alert('Bientôt', 'Contact bientôt disponible');
    }
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    const socket = getSocket();
    socket.emit('typing', { discussionId: id, userName: 'Moi' });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { discussionId: id });
    }, 2000);
  };

  const handleReact = (messageId: string, emoji: string) => {
    const socket = getSocket();
    socket.emit('add_reaction', { discussionId: id, messageId, emoji, sender: MY_ID });
  };

  const handleDelete = (messageId: string) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer ce message ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => {
        const socket = getSocket();
        socket.emit('delete_message', { discussionId: id, messageId });
      }},
    ]);
  };

  const handleEditInit = (messageId: string, content: string) => {
    const msg = messages.find(m => m._id === messageId);
    if (msg) {
      setEditingMsg(msg);
      setReplyMsg(null);
      setInputText(content);
    }
  };

  const handleReplyInit = (msg: Message) => {
    setReplyMsg(msg);
    setEditingMsg(null);
  };

  // ── Rendu ──────────────────────────────────────────────────────────────────
  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.sender === MY_ID;
    const currDate = new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const prevDate = index > 0 ? new Date(messages[index - 1].createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
    const showDate = currDate !== prevDate;

    const repliedMsg = item.replyTo ? messages.find(m => m._id === item.replyTo) || null : null;

    return (
      <View>
        {showDate && <DateSeparator date={currDate} />}
        <MessageBubble
          msg={item}
          isMe={isMe}
          repliedMsg={repliedMsg}
          onReply={handleReplyInit}
          onEdit={handleEditInit}
          onDelete={handleDelete}
          onReact={handleReact}
          onScrollTo={handleScrollToMessage}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerState, { paddingTop: insets.top + 100 }]}>
        <ActivityIndicator size="large" color="#25D366" />
        <Text style={styles.centerStateText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ChatHeader
        name={name || 'Inconnu'}
        avatarColor={avatarColor || '#25D366'}
        online={online === 'true'}
        onBack={() => router.back()}
        onCall={() => Alert.alert('Appel', `Appel audio de ${name}…`)}
        onVideoCall={() => Alert.alert('Vidéo', `Appel vidéo de ${name}…`)}
        onMute={() => Alert.alert('Sourdine', 'Notifications coupées')}
        onSearch={() => Alert.alert('Recherche', 'Recherche bientôt disponible')}
        onClearChat={() => Alert.alert('Vider', 'Voulez-vous vider la discussion ?')}
        onDeleteChat={() => Alert.alert('Supprimer', 'Supprimer cette discussion ?')}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.messagesList, { paddingBottom: 16 }]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        {isTyping && <TypingIndicator name={name || ''} />}

        <ScrollToBottomButton 
          onPress={scrollToBottom} 
          unreadCount={unreadCount}
        />

        <InputBar
          value={inputText}
          onChangeText={handleTyping}
          onSend={handleSend}
          onAttach={() => setAttachVisible(true)}
          onEmojiPress={() => setEmojiVisible(true)}
          paddingBottom={insets.bottom + 8}
          replyTo={replyMsg}
          onCancelReply={() => setReplyMsg(null)}
          editingMsg={editingMsg}
          onCancelEdit={() => { setEditingMsg(null); setInputText(''); }}
        />
      </KeyboardAvoidingView>

      <EmojiPicker
        visible={emojiVisible}
        onClose={() => setEmojiVisible(false)}
        onSelect={(emoji) => setInputText(prev => prev + emoji)}
      />

      <AttachmentMenu
        visible={attachVisible}
        onClose={() => setAttachVisible(false)}
        onSelect={handleAttachSelect}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEAE2' }, // Couleur fond WhatsApp
  messagesList: { paddingHorizontal: 8 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerStateText: { marginTop: 16, fontSize: 15, color: '#66747B', fontWeight: '500' },

  // Date separator
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 10,
  },
  dateSeparatorLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#86969D',
    opacity: 0.4,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C6B74',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
  },

  // Typing indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#86969D',
  },
  typingText: {
    fontSize: 13,
    color: '#5C6B74',
    fontStyle: 'italic',
    fontWeight: '500',
  },

  // Scroll to bottom button
  scrollToBottom: {
    position: 'absolute',
    bottom: 70,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollToBottomBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EFEAE2',
  },
  scrollToBottomBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
});
