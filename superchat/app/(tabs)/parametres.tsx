import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import {
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Constants ────────────────────────────────────────────────────────────────
const SETTING_ITEM_HEIGHT = 58; // Hauteur fixe pour chaque item de paramètre

// ─── Data ─────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'avatar',
    items: [
      { icon: 'person-circle', label: 'Avatar', color: '#8E8E93', sub: 'Personnaliser votre profil' },
    ],
  },
  {
    id: 'business',
    items: [
      { icon: 'megaphone',    label: 'Promouvoir',           color: '#FF9500', sub: 'Boostez votre activité' },
      { icon: 'storefront',   label: 'Outils professionnels', color: '#34C759', sub: 'Catalogue & horaires' },
    ],
  },
  {
    id: 'features',
    items: [
      { icon: 'star',         label: 'Important',            color: '#FFD60A', sub: 'Messages étoilés' },
      { icon: 'megaphone',    label: 'Listes de diffusion',  color: '#FF6B6B', sub: 'Gérer vos listes' },
      { icon: 'people',       label: 'Communautés',          color: '#A29BFE', sub: 'Rejoindre & créer' },
      { icon: 'desktop',      label: 'Appareils connectés',  color: '#4ECDC4', sub: 'WhatsApp Web & Desktop' },
    ],
  },
  {
    id: 'settings',
    items: [
      { icon: 'key',                label: 'Compte',         color: '#007AFF', sub: 'Sécurité, numéro' },
      { icon: 'lock-closed',        label: 'Confidentialité', color: '#30D158', sub: 'Dernière connexion, photo' },
      { icon: 'chatbubbles',        label: 'Discussions',    color: '#FF9F0A', sub: 'Thème, fond, taille' },
      { icon: 'notifications',      label: 'Notifications',  color: '#FF375F', sub: 'Sons, vibrations' },
    ],
  },
  {
    id: 'help',
    items: [
      { icon: 'help-circle',        label: 'Aide',           color: '#64D2FF', sub: 'FAQ & contact' },
      { icon: 'information-circle', label: 'À propos',       color: '#5E5CE6', sub: 'Version, licences' },
    ],
  },
];

// ─── Icon Badge ───────────────────────────────────────────────────────────────
function IconBadge({ icon, color }: { icon: string; color: string }) {
  return (
    <View style={[styles.iconBadge, { backgroundColor: color }]}>
      <Ionicons name={icon as any} size={18} color="white" />
    </View>
  );
}

// ─── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({
  item,
  index,
  scrollY,
  isLast,
}: {
  item: typeof SECTIONS[0]['items'][0];
  index: number;
  scrollY: Animated.Value;
  isLast: boolean;
}) {
  const tapScale = useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.spring(tapScale, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start();
  const onOut = () => Animated.spring(tapScale, { toValue: 1,    useNativeDriver: true, speed: 40 }).start();

  // ─── Stacking Effect Interpolations ───────────────────────────────────────
  const inputRange = [
    (index - 1) * SETTING_ITEM_HEIGHT,
    index * SETTING_ITEM_HEIGHT,
    (index + 1) * SETTING_ITEM_HEIGHT,
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
      <View style={{ height: SETTING_ITEM_HEIGHT }}>
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
            style={styles.settingRow}
          >
          <IconBadge icon={item.icon} color={item.color} />
          <View style={styles.settingMiddle}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            {item.sub && <Text style={styles.settingSub}>{item.sub}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={16} color="#C0C0CC" />
        </TouchableOpacity>
        </Animated.View>
      </View>
      {!isLast && <View style={styles.rowSeparator} />}
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ParametresScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const titleOp = scrollY.interpolate({ inputRange: [0, 36], outputRange: [1, 0],  extrapolate: 'clamp' });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Sticky Header ── */}
      <View style={styles.stickyHeader}>
        <Animated.View style={{ opacity: titleOp, overflow: 'hidden' }}>
          <View style={styles.titleRow}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="search" size={20} color="#111" />
            </TouchableOpacity>
            <Text style={styles.largeTitle}>Paramètres</Text>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="qr-code-outline" size={20} color="#111" />
            </TouchableOpacity>
          </View>
        </Animated.View>
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 90, paddingTop: 8 }}
      >
        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <TouchableOpacity style={styles.profileAvatarWrap}>
            {/* Gradient ring */}
            <View style={styles.profileRing}>
              <View style={styles.profileAvatarBg}>
                <Text style={styles.profileAvatarInitials}>JA</Text>
              </View>
            </View>
            {/* Online indicator */}
            <View style={styles.profileOnlineDot} />
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Jacques</Text>
            <Text style={styles.profileStatus}>☁️  Dans les nuages</Text>
          </View>

          {/* Edit button */}
          <TouchableOpacity style={styles.profileEditBtn}>
            <Ionicons name="pencil" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* QR / Share row */}
        <View style={styles.profileQuickRow}>
          <TouchableOpacity style={styles.profileQuickBtn}>
            <Ionicons name="qr-code-outline" size={20} color="#007AFF" />
            <Text style={styles.profileQuickLabel}>Mon QR code</Text>
          </TouchableOpacity>
          <View style={styles.profileQuickDivider} />
          <TouchableOpacity style={styles.profileQuickBtn}>
            <Ionicons name="share-outline" size={20} color="#007AFF" />
            <Text style={styles.profileQuickLabel}>Partager</Text>
          </TouchableOpacity>
        </View>

        {/* ── Settings Sections ── */}
        {SECTIONS.map((section, sectionIndex) => {
          // Calculer l'index global pour chaque item
          let globalIndex = 0;
          for (let i = 0; i < sectionIndex; i++) {
            globalIndex += SECTIONS[i].items.length;
          }
          
          return (
            <View key={section.id} style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <SettingRow
                  key={item.label}
                  item={item}
                  index={globalIndex + index}
                  scrollY={scrollY}
                  isLast={index === section.items.length - 1}
                />
              ))}
            </View>
          );
        })}

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutCard}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  // Header
  stickyHeader: {
    backgroundColor: '#F2F2F7',
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
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
    textAlign: 'center',
  },
  headerIconBtn: { padding: 6 },

  // ── Profile Card ──
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  profileAvatarWrap: {
    position: 'relative',
  },
  profileRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    // Simulated gradient ring via layered views
    backgroundColor: '#25D366',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatarBg: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarInitials: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  profileOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D0D0D',
    letterSpacing: -0.3,
  },
  profileStatus: {
    fontSize: 13,
    color: '#8A8A95',
    fontWeight: '400',
  },
  profileEditBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // QR / Share quick row
  profileQuickRow: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  profileQuickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 7,
  },
  profileQuickDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E8EE',
    marginVertical: 10,
  },
  profileQuickLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },

  // ── Section Card ──
  sectionCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  // ── Setting Row ──
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 14,
    backgroundColor: 'white',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  settingMiddle: {
    flex: 1,
    gap: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D0D0D',
    letterSpacing: -0.1,
  },
  settingSub: {
    fontSize: 12,
    color: '#AAAAAA',
    fontWeight: '400',
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EFEFF4',
    marginLeft: 66,
  },

  // ── Logout ──
  logoutCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    letterSpacing: -0.1,
  },
});
