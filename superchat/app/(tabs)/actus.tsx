import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Constants ────────────────────────────────────────────────────────────────
const CHANNEL_ITEM_HEIGHT = 76; // Hauteur fixe pour chaque item de chaîne

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────
const MY_STATUS = {
  id: '0',
  name: 'Mon statut',
  avatarColor: '#6C5CE7',
  gradientTop: '#667EEA',
  gradientBot: '#764BA2',
  hasStory: true,
};

const FRIENDS_STATUS = [
  { id: '1', name: 'Marie',   avatarColor: '#FF6B6B', gradientTop: '#FF6B6B', gradientBot: '#C0392B', viewed: false },
  { id: '2', name: 'Jean',    avatarColor: '#4ECDC4', gradientTop: '#4ECDC4', gradientBot: '#1A7A75', viewed: true  },
  { id: '3', name: 'Sophie',  avatarColor: '#A29BFE', gradientTop: '#A29BFE', gradientBot: '#6C5CE7', viewed: false },
  { id: '4', name: 'Kofi',    avatarColor: '#FDCB6E', gradientTop: '#FDCB6E', gradientBot: '#E17055', viewed: false },
  { id: '5', name: 'Amara',   avatarColor: '#FD79A8', gradientTop: '#FD79A8', gradientBot: '#E84393', viewed: true  },
  { id: '6', name: 'David',   avatarColor: '#00B894', gradientTop: '#00B894', gradientBot: '#00796B', viewed: false },
  { id: '7', name: 'Emma',    avatarColor: '#74B9FF', gradientTop: '#74B9FF', gradientBot: '#0984E3', viewed: true  },
];

const CHANNELS_DATA = [
  {
    id: '1', 
    name: 'The New York Times',
    preview: 'Pakistan Navy escorte ses navires commerciaux…',
    unread: 120, 
    time: '01:57',
    logo: 'T', 
    bgColor: '#000000',
  },
  {
    id: '2', 
    name: 'CNN',
    preview: 'Débris de missile iranien récupérés sur site…',
    unread: 100, 
    time: '00:15',
    logo: 'CNN', 
    bgColor: '#CC0000',
  },
  {
    id: '3', 
    name: 'Vive USA',
    preview: '"No son familia" — la frase de la ministra…',
    unread: 25, 
    time: '00:11',
    logo: 'V', 
    bgColor: '#003580',
  },
  {
    id: '4', 
    name: 'Inter Miami CF',
    preview: "We're ready. Champions Cup begins 🏆",
    unread: 0, 
    time: '00:03',
    logo: 'IM', 
    bgColor: '#F7B5CD',
    logoDark: true,
  },
  {
    id: '5', 
    name: 'Newsweek',
    preview: '"New news I guess" — the official account…',
    unread: 390, 
    time: 'Hier',
    logo: 'N', 
    bgColor: '#E32119',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── Hero Status (Mon Statut) ─────────────────────────────────────────────────
function HeroStatus() {
  const scale = useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 60 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 40 }).start();

  return (
    <Animated.View style={[styles.heroContainer, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onIn}
        onPressOut={onOut}
        style={styles.heroCard}
      >
        {/* Background gradient simulation */}
        <View style={[styles.heroBg, { backgroundColor: MY_STATUS.gradientTop }]}>
          <View style={[styles.heroBgAccent, { backgroundColor: MY_STATUS.gradientBot }]} />
        </View>

        {/* Content overlay */}
        <View style={styles.heroOverlay} />

        {/* Top actions */}
        <View style={styles.heroTopRow}>
          <TouchableOpacity style={styles.heroActionBtn}>
            <Ionicons name="camera-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroActionBtn}>
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom info */}
        <View style={styles.heroBottom}>
          <View style={styles.heroAvatarRing}>
            <View style={[styles.heroAvatar, { backgroundColor: MY_STATUS.avatarColor }]}>
              <Text style={styles.heroInitials}>{getInitials(MY_STATUS.name)}</Text>
            </View>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>{MY_STATUS.name}</Text>
            <Text style={styles.heroSubtitle}>Appuyez pour ajouter un statut</Text>
          </View>
          <TouchableOpacity style={styles.heroPlusBtn}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Friend Status Card ───────────────────────────────────────────────────────
function FriendStatusCard({ item }: { item: typeof FRIENDS_STATUS[0] }) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () =>
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 80 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 50 }),
    ]).start();

  return (
    <TouchableOpacity onPress={press} activeOpacity={1}>
      <Animated.View style={[styles.statusCard, { transform: [{ scale }] }]}>
        {/* Ring */}
        <View
          style={[
            styles.statusRing,
            item.viewed ? styles.statusRingViewed : styles.statusRingUnviewed,
          ]}
        >
          {/* Avatar bg gradient simulation */}
          <View style={[styles.statusAvatarBg, { backgroundColor: item.avatarColor }]}>
            {/* Initials */}
            <Text style={styles.statusInitials}>{getInitials(item.name)}</Text>
            {/* Bottom overlay */}
            <View style={styles.statusOverlay} />
            <Text style={styles.statusName}>{item.name}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Channel Item ─────────────────────────────────────────────────────────────
function ChannelItem({ 
  item, 
  index, 
  scrollY, 
  isLast 
}: { 
  item: typeof CHANNELS_DATA[0]; 
  index: number;
  scrollY: Animated.Value;
  isLast: boolean;
}) {
  const tapScale = useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.spring(tapScale, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start();
  const onOut = () => Animated.spring(tapScale, { toValue: 1,    useNativeDriver: true, speed: 40 }).start();

  // ─── Stacking Effect Interpolations ───────────────────────────────────────
  const inputRange = [
    (index - 1) * CHANNEL_ITEM_HEIGHT,
    index * CHANNEL_ITEM_HEIGHT,
    (index + 1) * CHANNEL_ITEM_HEIGHT,
  ];

  const scale = scrollY.interpolate({
    inputRange,
    outputRange: [1, 1, 0.9],
    extrapolate: 'clamp',
  });

  const opacity = scrollY.interpolate({
    inputRange,
    outputRange: [1, 1, 0.3],
    extrapolate: 'clamp',
  });

  const translateY = scrollY.interpolate({
    inputRange,
    outputRange: [0, 0, -10],
    extrapolate: 'clamp',
  });

  return (
    <>
      <View style={{ height: CHANNEL_ITEM_HEIGHT }}>
        <Animated.View
          style={{
            transform: [
              { scale: Animated.multiply(scale, tapScale) },
              { translateY },
            ],
            opacity,
            flex: 1,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={onIn}
            onPressOut={onOut}
            style={styles.channelItem}
          >
        {/* Logo avatar */}
        <View style={[styles.channelAvatar, { backgroundColor: item.bgColor }]}>
          <Text
            style={[
              styles.channelLogoText,
              item.logoDark && { color: '#333' },
              item.logo.length > 1 && { fontSize: 13 },
            ]}
          >
            {item.logo}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.channelMiddle}>
          <Text style={styles.channelName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.channelPreview} numberOfLines={1}>
            {item.preview}
          </Text>
        </View>

        {/* Right */}
        <View style={styles.channelRight}>
          <Text
            style={[
              styles.channelTime,
              item.unread > 0 && { color: '#25D366', fontWeight: '600' },
            ]}
          >
            {item.time}
          </Text>
          {item.unread > 0 && (
            <View style={styles.channelBadge}>
              <Text style={styles.channelBadgeText}>
                {item.unread > 999 ? '999+' : item.unread}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      </Animated.View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ActusScreen() {
  const insets = useSafeAreaInsets();
  const [searchFocused, setSearchFocused] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const titleOp = scrollY.interpolate({ inputRange: [0, 36], outputRange: [1, 0],  extrapolate: 'clamp' });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Sticky Header ── */}
      <View style={styles.stickyHeader}>
        <Animated.View style={{ opacity: titleOp, overflow: 'hidden' }}>
          <View style={styles.titleRow}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#111" />
            </TouchableOpacity>
            <Text style={styles.largeTitle}>Actus</Text>
          </View>
        </Animated.View>

        <View style={[styles.searchWrap, searchFocused && { backgroundColor: '#E4E4EB' }]}>
          <Ionicons name="search" size={16} color="#AAAAAA" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Rechercher"
            placeholderTextColor="#AAAAAA"
            style={styles.searchInput}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchFocused && (
            <TouchableOpacity onPress={() => setSearchFocused(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Scrollable Content ── */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical
        decelerationRate="normal"
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        {/* ══ HERO STATUS (MON STATUT) ══ */}
        <HeroStatus />

        {/* ══ MOMENTS SECTION (AMIS) ══ */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Moments</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusScrollContent}
          decelerationRate="fast"
          snapToInterval={116}
          snapToAlignment="start"
        >
          {FRIENDS_STATUS.map((friend) => (
            <FriendStatusCard key={friend.id} item={friend} />
          ))}
        </ScrollView>

        {/* ══ CHANNELS SECTION ══ */}
        <View style={[styles.sectionHeaderRow, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>Chaînes</Text>
          <TouchableOpacity style={styles.explorePill}>
            <Text style={styles.explorePillText}>Explorer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.channelsCard}>
          {CHANNELS_DATA.map((item, index) => (
            <ChannelItem
              key={item.id}
              item={item}
              index={index}
              scrollY={scrollY}
              isLast={index === CHANNELS_DATA.length - 1}
            />
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },

  // Header
  stickyHeader: {
    backgroundColor: '#F8F8FA',
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 10,
    height: 56,
  },
  largeTitle: {
    flex: 1,
    fontSize: 30,
    fontWeight: '800',
    color: '#0D0D0D',
    letterSpacing: -0.5,
  },
  iconBtn: { padding: 6 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBEBF0',
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 9 : 7,
    borderRadius: 14,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#111', padding: 0 },
  cancelText: { color: '#25D366', fontSize: 15, fontWeight: '500', marginLeft: 8 },

  // ── Hero Status ──
  heroContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  heroCard: {
    height: SCREEN_H * 0.35,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBgAccent: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.6,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heroTopRow: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  heroActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroAvatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    backgroundColor: '#25D366',
  },
  heroAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  heroInfo: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  heroPlusBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  // Section headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0D0D0D',
    letterSpacing: -0.3,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 4,
  },
  sectionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 1,
  },
  explorePill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  explorePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  // ── Status (Friends) ──
  statusScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
    gap: 10,
  },
  statusCard: {
    width: 100,
    marginRight: 6,
  },

  // Status image card
  statusRing: {
    width: 100,
    height: 158,
    borderRadius: 18,
    padding: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  statusRingUnviewed: {
    backgroundColor: '#25D366',
  },
  statusRingViewed: {
    backgroundColor: '#C8C8D0',
  },
  statusAvatarBg: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  statusInitials: {
    fontSize: 30,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
    marginBottom: 24,
  },
  statusOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  statusName: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.2,
  },

  // ── Channels ──
  channelsCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  channelAvatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  channelLogoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  channelMiddle: {
    flex: 1,
    gap: 3,
  },
  channelName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D0D0D',
    letterSpacing: -0.1,
  },
  channelPreview: {
    fontSize: 13,
    color: '#8A8A95',
  },
  channelRight: {
    alignItems: 'flex-end',
    gap: 5,
    minWidth: 44,
  },
  channelTime: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  channelBadge: {
    backgroundColor: '#25D366',
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  channelBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EFEFF4',
    marginLeft: 78,
  },
});
