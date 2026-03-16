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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
const MY_ID = 'moi'; // À remplacer par l'ID utilisateur réel après auth
const BASE_URL = 'http://10.1.0.240:3000/api';

// ─── Indicateur "en train d'écrire" ──────────────────────────────────────────
function TypingIndicator({ name }: { name: string }) {
  return (
    <View style={styles.typingRow}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          {[0, 1, 2].map(i => <View key={i} style={styles.typingDot} />)}
        </View>
      </View>
      <Text style={styles.typingText}>{name} écrit…</Text>
    </View>
  );
}

// ─── Séparateur de date ───────────────────────────────────────────────────────
function DateSeparator({ date }: { date: string }) {
  return (
    <View style={styles.dateSepRow}>
      <View style={styles.dateSepLine} />
      <Text style={styles.dateSepText}>{date}</Text>
      <View style={styles.dateSepLine} />
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function ConversationScreen() {
  const { id, name, avatarColor, online } = useLocalSearchParams<{
    id: string; name: string; avatarColor: string; online: string;
  }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);

  const [messages, setMessages]     = useState<Message[]>([]);
  const [loading, setLoading]       = useState(true);
  const [inputText, setInputText]   = useState('');
  const [sending, setSending]       = useState(false);
  const [isTyping, setIsTyping]     = useState(false);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [attachVisible, setAttachVisible] = useState(false);

  // Nouveaux états pour le dynamisme
  const [replyMsg, setReplyMsg] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Chargement des messages ──────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE_URL}/discussions/${id}/messages`)
      .then(r => r.json())
      .then(data => setMessages(data.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Socket.io ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join_discussion', id);

    // Écouteurs dynamiques
    socket.on('new_message', ({ message }: any) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socket.on('message_sent', ({ message }: any) => {
      setMessages(prev => {
        if (prev.find(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    });

    socket.on('message_deleted', ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, deleted: true, content: 'Ce message a été supprimé' } : m));
    });

    socket.on('message_edited', ({ messageId, content }: { messageId: string, content: string }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, content, edited: true } : m));
    });

    socket.on('message_reaction', ({ messageId, emoji, sender }: any) => {
      setMessages(prev => prev.map(m => {
        if (m._id !== messageId) return m;
        const filtered = m.reactions?.filter(r => r.sender !== sender) || [];
        return { ...m, reactions: [...filtered, { emoji, sender }] };
      }));
    });

    socket.on('user_typing', ({ discussionId }: { discussionId: string }) => {
      if (discussionId === id) setIsTyping(true);
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

  const scrollToBottom = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Scroll vers un message spécifique (pour les réponses)
  const handleScrollToMessage = (messageId: string) => {
    const index = messages.findIndex(m => m._id === messageId);
    if (index !== -1 && listRef.current) {
      listRef.current.scrollToIndex({ index, animated: true, viewOffset: 100 });
      // Flash effect pour mettre en évidence
      setHighlightedMsgId(messageId);
      setTimeout(() => setHighlightedMsgId(null), 2000);
    }
  };

  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);

  // ── Actions Dynamiques ───────────────────────────────────────────────────────
  const handleSend = (text?: string, mediaUri?: string, mediaType?: 'image' | 'file') => {
    const content = text !== undefined ? text : inputText.trim();
    if (!content && !mediaUri) return;

    const socket = getSocket();

    if (editingMsg) {
      // Cas de la MODIFICATION
      socket.emit('edit_message', { discussionId: id, messageId: editingMsg._id, content });
      setEditingMsg(null);
    } else {
      // Cas de l'ENVOI (Normal, Réponse ou Média)
      socket.emit('send_message', {
        discussionId: id,
        preview: mediaUri || content,
        sender: MY_ID,
        replyTo: replyMsg?._id || null,
        type: mediaType || 'text',
      });
      setReplyMsg(null);
    }

    setInputText('');
  };

  // ── Gestion des médias ───────────────────────────────────────────────────────
  
  // Prendre une photo avec la caméra
  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'L\'accès à la caméra est nécessaire pour prendre des photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleSend(undefined, result.assets[0].uri, 'image');
    }
  };

  // Sélectionner une image depuis la galerie
  const handleLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'L\'accès à la galerie est nécessaire.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleSend(undefined, result.assets[0].uri, 'image');
    }
  };

  // Sélectionner un document
  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const doc = result.assets[0];
        // Envoyer le document avec son nom
        handleSend(`${doc.name || 'Document'}`, doc.uri, 'file');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner le document');
    }
  };

  // Localisaton (mock pour l'instant)
  const handleLocation = () => {
    Alert.alert('Localisation', 'Envoi de la localisation...', [
      { text: 'OK' },
    ]);
    // TODO: Utiliser expo-location pour envoyer les coordonnées
  };

  // Contact (mock pour l'instant)
  const handleContact = () => {
    Alert.alert('Contact', 'Sélection d\'un contact...', [
      { text: 'OK' },
    ]);
    // TODO: Utiliser expo-contacts pour sélectionner un contact
  };

  const handleAttachSelect = (type: 'camera' | 'library' | 'document' | 'location' | 'contact') => {
    switch (type) {
      case 'camera': return handleCamera();
      case 'library': return handleLibrary();
      case 'document': return handleDocument();
      case 'location': return handleLocation();
      case 'contact': return handleContact();
    }
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    const socket = getSocket();
    socket.emit('typing', { discussionId: id, userName: 'Moi' });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { discussionId: id });
    }, 1500);
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

  // ── Rendu ───────────────────────────────────────────────────────────────────
  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isMe      = item.sender === MY_ID;
    const currDate  = new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    const prevDate  = index > 0
      ? new Date(messages[index - 1].createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
      : null;
    const showDate  = currDate !== prevDate;

    // Trouver le message de réponse si replyTo existe
    const repliedMsg = item.replyTo 
      ? messages.find(m => m._id === item.replyTo) || null
      : null;

    // Style de surbrillance pour les messages ciblés
    const isHighlighted = highlightedMsgId === item._id;

    return (
      <View key={item._id}>
        {showDate && <DateSeparator date={currDate} />}
        <View style={isHighlighted ? styles.highlightedMessage : {}}>
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
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ChatHeader
        name={name || 'Inconnu'}
        avatarColor={avatarColor || '#25D366'}
        online={online === 'true'}
        onBack={() => router.back()}
        onCall={() => Alert.alert('Appel', `Appel de ${name}…`)}
        onVideoCall={() => Alert.alert('Vidéo', `Appel vidéo de ${name}…`)}
        onMute={() => Alert.alert('Sourdine', 'Notifications coupées')}
        onSearch={() => console.log('Search')}
        onClearChat={() => Alert.alert('Vider', 'Voulez-vous vider la discussion ?')}
        onDeleteChat={() => Alert.alert('Supprimer', 'Supprimer cette discussion ?')}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#25D366" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.messagesList,
              { paddingBottom: 20 },
            ]}
            onContentSizeChange={scrollToBottom}
            showsVerticalScrollIndicator={false}
          />
        )}

        {isTyping && <TypingIndicator name={name || ''} />}

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F5' },
  messagesList: { paddingHorizontal: 12, paddingTop: 12 },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 6, gap: 8 },
  typingBubble: { backgroundColor: 'white', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10 },
  typingDots: { flexDirection: 'row', gap: 4 },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#AAAAAA' },
  typingText: { fontSize: 12, color: '#AAAAAA', fontStyle: 'italic' },
  dateSepRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  dateSepLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#DDDDE0' },
  dateSepText: { fontSize: 12, color: '#AAAAAA', fontWeight: '600', backgroundColor: '#F0F0F5', paddingHorizontal: 8 },
  highlightedMessage: {
    animation: 'pulse',
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    borderRadius: 20,
    marginVertical: 3,
  },
});
