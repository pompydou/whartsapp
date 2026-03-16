import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    Animated,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Constants ────────────────────────────────────────────────────────────────
const CALL_ITEM_HEIGHT = 74; // Hauteur fixe pour chaque item d'appel

// ─── Types ────────────────────────────────────────────────────────────────────
interface Call {
  id: string;
  name: string;
  type: 'video-incoming' | 'audio-outgoing' | 'missed' | 'missed-muted' | 'video-outgoing';
  time: string;
  avatarColor: string;
  count?: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: '1', icon: 'call', label: 'Appeler', color: '#25D366' },
  { id: '2', icon: 'calendar-outline', label: 'Planifier', color: '#007AFF' },
  { id: '3', icon: 'grid-outline', label: 'Pavé', color: '#FF9500' },
  { id: '4', icon: 'heart-outline', label: 'Favoris', color: '#FF3B30' },
];

const CALLS: Call[] = [
  { id: '1', name: 'Marie Dupont',    type: 'video-incoming',  time: '10:30',    avatarColor: '#FF6B6B' },
  { id: '2', name: 'Jean Martin',     type: 'audio-outgoing',  time: '09:15',    avatarColor: '#4ECDC4' },
  { id: '3', name: 'Sophie Bernard',  type: 'missed',          time: 'Hier',     avatarColor: '#A29BFE' },
  { id: '4', name: 'Paul Durand',     type: 'audio-outgoing',  time: 'Hier',     avatarColor: '#FDCB6E' },
  { id: '5', name: 'Emma Petit',      type: 'missed-muted',    time: '15/03',    avatarColor: '#FD79A8', count: 2 },
  { id: '6', name: 'Lucas Robert',    type: 'video-incoming',  time: '14/03',    avatarColor: '#00B894' },
  { id: '7', name: 'Kofi Mensah',     type: 'missed',          time: '14/03',    avatarColor: '#E17055' },
  { id: '8', name: 'Amara Diallo',    type: 'video-outgoing',  time: '13/03',    avatarColor: '#74B9FF' },
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

function getCallMeta(type: Call['type']) {
  switch (type) {
    case 'video-incoming':
      return { icon: 'videocam',    label: 'Entrant',  color: '#007AFF', arrowIcon: 'arrow-down-outline' };
    case 'video-outgoing':
      return { icon: 'videocam',    label: 'Sortant',  color: '#555',    arrowIcon: 'arrow-up-outline' };
    case 'audio-outgoing':
      return { icon: 'call',        label: 'Sortant',  color: '#555',    arrowIcon: 'arrow-up-outline' };
    case 'missed':
      return { icon: 'call',        label: 'Manqué',   color: '#FF3B30', arrowIcon: 'arrow-down-outline' };
    case 'missed-muted':
      return { icon: 'call',        label: 'Manqué',   color: '#FF3B30', arrowIcon: 'arrow-down-outline' };
    default:
      return { icon: 'call',        label: '',         color: '#999',    arrowIcon: 'arrow-up-outline' };
  }
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, color, size = 50 }: { name: string; color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text style={{ color: 'white', fontSize: size * 0.34, fontWeight: '700', letterSpacing: 0.3 }}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickActionBtn({ item }: { item: typeof QUICK_ACTIONS[0] }) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () =>
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 60 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 60 }),
    ]).start();

  return (
    <TouchableOpacity activeOpacity={1} onPress={press} style={styles.quickAction}>
      <Animated.View style={[styles.quickActionIcon, { transform: [{ scale }] }]}>
        {/* Colored glow bg */}
        <View style={[styles.quickActionGlow, { backgroundColor: item.color + '18' }]} />
        <Ionicons name={item.icon as any} size={22} color={item.color} />
      </Animated.View>
      <Text style={styles.quickActionLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
}

// ─── Call Item ────────────────────────────────────────────────────────────────
function CallItem({ 
  item, 
  index, 
  scrollY 
}: { 
  item: Call; 
  index: number;
  scrollY: Animated.Value;
}) {
  const meta = getCallMeta(item.type);
  const tapScale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(tapScale, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start();

  const onPressOut = () =>
    Animated.spring(tapScale, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  // ─── Stacking Effect Interpolations ───────────────────────────────────────
  const inputRange = [
    (index - 1) * CALL_ITEM_HEIGHT,
    index * CALL_ITEM_HEIGHT,
    (index + 1) * CALL_ITEM_HEIGHT,
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
    <View style={{ height: CALL_ITEM_HEIGHT }}>
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
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={styles.callItem}
        >
        <Avatar name={item.name} color={item.avatarColor} size={50} />

        <View style={styles.callMiddle}>
          <Text
            style={[styles.callName, item.type.includes('missed') && styles.callNameMissed]}
            numberOfLines={1}
          >
            {item.name}
            {item.count && item.count > 1 ? (
              <Text style={styles.callCount}> ({item.count})</Text>
            ) : null}
          </Text>

          <View style={styles.callInfoRow}>
            {/* Arrow direction */}
            <Ionicons
              name={meta.arrowIcon as any}
              size={11}
              color={meta.color}
              style={{ marginRight: 3 }}
            />
            {/* Phone/video icon */}
            <Ionicons
              name={meta.icon as any}
              size={13}
              color={meta.color}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.callTypeText, { color: meta.color }]}>{meta.label}</Text>

            {item.type === 'missed-muted' && (
              <View style={styles.mutedPill}>
                <Ionicons name="volume-mute" size={10} color="#888" />
                <Text style={styles.mutedText}>Silencieux</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.callRight}>
          <Text style={styles.callTime}>{item.time}</Text>
          <TouchableOpacity style={styles.infoBtn}>
            <Ionicons name="information-circle-outline" size={22} color="#C0C0CC" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AppelsScreen() {
  const insets = useSafeAreaInsets();
  const [searchFocused, setSearchFocused] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const titleOp = scrollY.interpolate({
    inputRange: [0, 36],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

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
            <Text style={styles.largeTitle}>Appels</Text>
            <TouchableOpacity style={styles.addBtn}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Search */}
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
        {/* ── Quick Actions Card ── */}
        <View style={styles.quickActionsCard}>
          {QUICK_ACTIONS.map((a) => (
            <QuickActionBtn key={a.id} item={a} />
          ))}
        </View>

        {/* ── Recents Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Récents</Text>
        </View>

        <View style={styles.listCard}>
          {CALLS.map((item, index) => (
            <View key={item.id}>
              <CallItem item={item} index={index} scrollY={scrollY} />
              {index < CALLS.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
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
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    padding: 0,
  },
  cancelText: {
    color: '#25D366',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },

  // Quick Actions
  quickActionsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#F8F8FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },

  // Section
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D0D0D',
    letterSpacing: -0.3,
  },

  // List card
  listCard: {
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

  // Call item
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    gap: 12,
  },
  callMiddle: {
    flex: 1,
    gap: 4,
  },
  callName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D0D0D',
    letterSpacing: -0.1,
  },
  callNameMissed: {
    color: '#FF3B30',
  },
  callCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
  },
  callInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTypeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  mutedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F5',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
    gap: 3,
  },
  mutedText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
  },

  // Right
  callRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  callTime: {
    fontSize: 12,
    color: '#AAAAAA',
    fontWeight: '400',
  },
  infoBtn: {
    padding: 2,
  },

  // Separator
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EFEFF4',
    marginLeft: 78,
  },
});
