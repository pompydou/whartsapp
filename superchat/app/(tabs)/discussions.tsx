import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Discussion, fetchDiscussions, markAsRead } from '@/services/discussionsApi';
import { getSocket } from '@/services/socket';

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEM_HEIGHT = 72;
const FILTERS = ['Toutes', 'Non lues', 'Favoris', 'Groupes'];

// ─── Avatar Component ─────────────────────────────────────────────────────────
function Avatar({ name, color, size = 52, online }: { name: string; color: string; size?: number; online?: boolean }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={{ position: 'relative', width: size, height: size }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2, backgroundColor: color,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
      }}>
        <Text style={{ color: 'white', fontSize: size * 0.35, fontWeight: '700', letterSpacing: 0.5 }}>
          {initials}
        </Text>
      </View>
      {online && (
        <View style={{
          position: 'absolute', bottom: 1, right: 1, width: 13, height: 13,
          borderRadius: 7, backgroundColor: '#25D366', borderWidth: 2, borderColor: '#F8F8FA',
        }} />
      )}
    </View>
  );
}

// ─── Preview Row ──────────────────────────────────────────────────────────────
function PreviewRow({ item }: { item: Discussion }) {
  if (item.type === 'voice') {
    return (
      <View style={styles.previewRow}>
        <View style={styles.previewIconWrap}><Ionicons name="mic" size={12} color="#888" /></View>
        <Text style={styles.previewText} numberOfLines={1}>{item.preview}</Text>
      </View>
    );
  }
  if (item.type === 'video-call') {
    return (
      <View style={styles.previewRow}>
        <View style={styles.previewIconWrap}><Ionicons name="videocam" size={12} color="#888" /></View>
        <Text style={styles.previewText} numberOfLines={1}>{item.preview}</Text>
      </View>
    );
  }
  if (item.sent) {
    return (
      <View style={styles.previewRow}>
        <Ionicons name="checkmark-done" size={14} color="#25D366" style={{ marginRight: 3 }} />
        <Text style={styles.previewText} numberOfLines={1}>{item.preview}</Text>
      </View>
    );
  }
  return <Text style={styles.previewText} numberOfLines={1}>{item.preview}</Text>;
}

// ─── Discussion Item ──────────────────────────────────────────────────────────
function DiscussionItem({ item, index, scrollY, onPress }: {
  item: Discussion; index: number; scrollY: Animated.Value; onPress: (item: Discussion) => void;
}) {
  const tapScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(tapScale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(tapScale, { toValue: 1,    useNativeDriver: true, speed: 50 }).start();

  const inputRange = [(index - 1) * ITEM_HEIGHT, index * ITEM_HEIGHT, (index + 1) * ITEM_HEIGHT];
  const scale     = scrollY.interpolate({ inputRange, outputRange: [1, 1, 0.9], extrapolate: 'clamp' });
  const opacity   = scrollY.interpolate({ inputRange, outputRange: [1, 1, 0.3], extrapolate: 'clamp' });
  const translateY = scrollY.interpolate({ inputRange, outputRange: [0, 0, -10], extrapolate: 'clamp' });

  return (
    <View style={styles.discussionItemWrapper}>
      <Animated.View style={{
        transform: [{ scale: Animated.multiply(scale, tapScale) }, { translateY }],
        opacity, flex: 1,
      }}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => onPress(item)}
          style={styles.discussionItem}
        >
          <Avatar name={item.name} color={item.avatarColor} size={52} online={item.online} />

          <View style={styles.discussionMiddle}>
            <Text style={styles.discussionName} numberOfLines={1}>{item.name}</Text>
            <PreviewRow item={item} />
          </View>

          <View style={styles.discussionRight}>
            <Text style={[styles.discussionTime, item.unread > 0 && !item.muted && styles.discussionTimeUnread]}>
              {item.time}
            </Text>
            {item.unread > 0 && (
              <View style={[styles.badge, item.muted && styles.badgeMuted]}>
                <Text style={[styles.badgeText, item.muted && styles.badgeTextMuted]}>{item.unread}</Text>
                {item.muted && <Ionicons name="volume-mute" size={10} color="#888" style={{ marginLeft: 2 }} />}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DiscussionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [discussions, setDiscussions]   = useState<Discussion[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('Toutes');
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [newMsgId, setNewMsgId]         = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  // ── Chargement initial via REST ──
  useEffect(() => {
    fetchDiscussions()
      .then(setDiscussions)
      .catch(() => setError('Impossible de charger les discussions'))
      .finally(() => setLoading(false));
  }, []);

  // ── Socket.io : écoute des nouveaux messages en temps réel ──
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => console.log('[Socket] Connecté'));
    socket.on('connect_error', () => setError('Connexion temps réel indisponible'));

    socket.on('new_message', ({ discussion }: { discussion: any }) => {
      const d = { ...discussion, id: discussion._id || discussion.id };
      setDiscussions(prev => [d, ...prev.filter(item => item.id !== d.id)]);
      // Flash de notification
      setNewMsgId(discussion.id);
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setNewMsgId(null));
    });

    socket.on('discussion_read', ({ id }: { id: string }) => {
      setDiscussions(prev => prev.map(d => d.id === id ? { ...d, unread: 0 } : d));
    });

    socket.on('message_sent', ({ discussion }: { discussion: any }) => {
      const d = { ...discussion, id: discussion._id || discussion.id };
      setDiscussions(prev => [d, ...prev.filter(item => item.id !== d.id)]);
    });

    return () => {
      socket.off('new_message');
      socket.off('discussion_read');
      socket.off('message_sent');
      socket.off('connect');
      socket.off('connect_error');
    };
  }, []);

  // ── Appui sur une discussion : marquer comme lu + naviguer ──
  const handlePressDiscussion = async (item: Discussion) => {
    setDiscussions(prev => prev.map(d => d.id === item.id ? { ...d, unread: 0 } : d));
    await markAsRead(item.id);
    router.push({
      pathname: '/discussion/[id]',
      params: {
        id: item.id,
        name: item.name,
        avatarColor: item.avatarColor,
        online: item.online ? 'true' : 'false',
      },
    });
  };

  // ── Filtres + recherche ──
  const filteredData = discussions
    .filter(d => {
      if (activeFilter === 'Non lues') return d.unread > 0;
      if (activeFilter === 'Groupes')  return d.type === 'group';
      return true;
    })
    .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 40], outputRange: [1, 0], extrapolate: 'clamp' });

  // ── Total non lus pour le titre ──
  const totalUnread = discussions.reduce((acc, d) => acc + (d.unread || 0), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Sticky Header ── */}
      <View style={styles.stickyHeader}>
        <Animated.View style={[styles.largeTitleWrap, { opacity: headerOpacity, overflow: 'hidden' }]}>
          <View style={styles.largeTitleRow}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#111" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
              <Text style={styles.largeTitle}>Discussions</Text>
              {totalUnread > 0 && (
                <View style={styles.titleBadge}>
                  <Text style={styles.titleBadgeText}>{totalUnread > 99 ? '99+' : totalUnread}</Text>
                </View>
              )}
            </View>
            <View style={styles.headerRightBtns}>
              <TouchableOpacity style={styles.headerIconBtn}>
                <Ionicons name="camera-outline" size={22} color="#111" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerIconBtn, styles.addBtn]}>
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Search bar */}
        <View style={[styles.searchWrap, searchFocused && styles.searchWrapFocused]}>
          <Ionicons name="search" size={16} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Rechercher"
            placeholderTextColor="#AAAAAA"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchFocused && (
            <TouchableOpacity onPress={() => { setSearchFocused(false); setSearchQuery(''); }}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent} style={styles.filtersScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f} onPress={() => setActiveFilter(f)}
              style={[styles.pill, activeFilter === f && styles.pillActive]}>
              <Text style={[styles.pillText, activeFilter === f && styles.pillTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── États : chargement / erreur / liste ── */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#25D366" />
          <Text style={styles.centerStateText}>Chargement des discussions…</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="wifi-outline" size={48} color="#CCC" />
          <Text style={styles.centerStateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => {
            setError(null); setLoading(true);
            fetchDiscussions().then(setDiscussions).catch(() => setError('Impossible de charger les discussions')).finally(() => setLoading(false));
          }}>
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: insets.bottom + 90, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={true}
          decelerationRate="normal"
          getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          renderItem={({ item, index }) => (
            <Animated.View
              key={item.id}
              style={newMsgId === item.id
                ? { opacity: flashAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) }
                : {}}
            >
              <DiscussionItem item={item} index={index} scrollY={scrollY} onPress={handlePressDiscussion} />
            </Animated.View>
          )}
          ItemSeparatorComponent={({ leadingItem }) => (
            <View key={`sep-${leadingItem?.id}`} style={styles.separator} />
          )}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
              <Text style={styles.centerStateText}>Aucune discussion trouvée</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FA' },

  stickyHeader: {
    backgroundColor: '#F8F8FA', paddingBottom: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, zIndex: 10,
  },
  largeTitleWrap: { justifyContent: 'flex-end', height: 60 },
  largeTitleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8, gap: 8,
  },
  largeTitle: { fontSize: 30, fontWeight: '800', color: '#0D0D0D', letterSpacing: -0.5 },
  titleBadge: {
    backgroundColor: '#25D366', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  titleBadgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
  headerRightBtns: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  headerIconBtn: { padding: 6 },
  addBtn: {
    backgroundColor: '#0D0D0D', borderRadius: 20,
    width: 34, height: 34, justifyContent: 'center', alignItems: 'center', padding: 0,
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EBEBF0',
    marginHorizontal: 16, marginVertical: 6, paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 9 : 7, borderRadius: 14,
  },
  searchWrapFocused: { backgroundColor: '#E4E4EB' },
  searchInput: { flex: 1, fontSize: 15, color: '#111', padding: 0 },
  cancelText: { color: '#25D366', fontSize: 15, fontWeight: '500', marginLeft: 8 },

  filtersScroll: { marginBottom: 4 },
  filtersContent: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'white', borderWidth: 1, borderColor: '#E8E8EE', marginRight: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  pillActive: { backgroundColor: '#111', borderColor: '#111', shadowColor: '#111', shadowOpacity: 0.2 },
  pillText: { fontSize: 14, fontWeight: '500', color: '#555' },
  pillTextActive: { color: 'white', fontWeight: '600' },

  discussionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'white', gap: 12,
  },
  discussionItemWrapper: { height: ITEM_HEIGHT },
  discussionMiddle: { flex: 1, gap: 3 },
  discussionName: { fontSize: 15, fontWeight: '600', color: '#0D0D0D', letterSpacing: -0.1 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  previewIconWrap: {
    backgroundColor: '#F0F0F5', borderRadius: 10,
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  previewText: { fontSize: 13, color: '#8A8A95', flex: 1 },

  discussionRight: { alignItems: 'flex-end', gap: 6, minWidth: 48 },
  discussionTime: { fontSize: 12, color: '#AAAAAA', fontWeight: '400' },
  discussionTimeUnread: { color: '#25D366', fontWeight: '600' },

  badge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#25D366',
    minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', paddingHorizontal: 6,
    shadowColor: '#25D366', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4, elevation: 2,
  },
  badgeMuted: { backgroundColor: '#EBEBF0', shadowOpacity: 0 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
  badgeTextMuted: { color: '#888' },

  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#EFEFF4', marginLeft: 80 },

  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
  centerStateText: { fontSize: 15, color: '#AAAAAA', fontWeight: '500' },
  retryBtn: {
    backgroundColor: '#25D366', paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 20, marginTop: 8,
  },
  retryBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
});
