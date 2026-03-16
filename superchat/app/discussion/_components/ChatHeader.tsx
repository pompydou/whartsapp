import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  name: string;
  avatarColor: string;
  online: boolean;
  onBack: () => void;
  onCall: () => void;
  onVideoCall: () => void;
  onMute: () => void;
  onSearch: () => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
}

export default function ChatHeader({
  name, avatarColor, online,
  onBack, onCall, onVideoCall, onMute, onSearch, onClearChat, onDeleteChat,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const menuItems = [
    { label: 'Rechercher',          icon: 'search-outline',       action: onSearch,     danger: false },
    { label: 'Couper le son',       icon: 'volume-mute-outline',  action: onMute,       danger: false },
    { label: 'Vider la discussion', icon: 'trash-outline',        action: onClearChat,  danger: false },
    { label: 'Supprimer',           icon: 'close-circle-outline', action: onDeleteChat, danger: true  },
  ];

  return (
    <View style={styles.header}>
      {/* Retour */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color="#111" />
      </TouchableOpacity>

      {/* Avatar + infos */}
      <View style={styles.center}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
          {online && <View style={styles.onlineDot} />}
        </View>
        <View>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={[styles.status, online && styles.statusOnline]}>
            {online ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onVideoCall} hitSlop={8}>
          <Ionicons name="videocam-outline" size={22} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onCall} hitSlop={8}>
          <Ionicons name="call-outline" size={22} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setMenuVisible(true)} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Menu 3 points — Modal sorti du header pour éviter les conflits d'events */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}
      >
        {/* Pressable backdrop — ferme au tap en dehors */}
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          {/* stopPropagation pour que les taps sur la box ne ferment pas le modal */}
          <Pressable style={styles.menuBox} onPress={e => e.stopPropagation()}>
            {menuItems.map(item => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => {
                  setMenuVisible(false);
                  // Petit délai pour laisser le modal se fermer avant l'action
                  setTimeout(item.action, 150);
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={item.danger ? '#FF3B30' : '#333'}
                />
                <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    gap: 4,
  },
  backBtn: { padding: 6 },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: { color: 'white', fontSize: 15, fontWeight: '700' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: { fontSize: 16, fontWeight: '700', color: '#0D0D0D', maxWidth: 150 },
  status: { fontSize: 12, color: '#AAAAAA', marginTop: 1 },
  statusOnline: { color: '#25D366' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 8 },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  menuBox: {
    position: 'absolute',
    top: 58,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 14,
  },
  menuLabel: { fontSize: 15, color: '#111', fontWeight: '500' },
  menuLabelDanger: { color: '#FF3B30' },
});
