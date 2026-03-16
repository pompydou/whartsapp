import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'camera' | 'library' | 'document' | 'location' | 'contact') => void;
}

const MENU_ITEMS = [
  { id: 'camera',   label: 'Appareil photo',   icon: 'camera-outline',   color: '#007AFF' },
  { id: 'library',  label: 'Photos et vidéos', icon: 'images-outline',   color: '#5856D6' },
  { id: 'document', label: 'Document',        icon: 'document-outline', color: '#FF9500' },
  { id: 'location', label: 'Localisation',    icon: 'location-outline', color: '#4CD964' },
  { id: 'contact',  label: 'Contact',         icon: 'person-outline',   color: '#007AFF' },
];

export default function AttachmentMenu({ visible, onClose, onSelect }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={styles.container}>
          <View style={styles.menu}>
            {MENU_ITEMS.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.item}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onSelect(item.id as any);
                  }}
                >
                  <Text style={styles.label}>{item.label}</Text>
                  <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon as any} size={22} color="white" />
                  </View>
                </TouchableOpacity>
                {index < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  container: {
    paddingHorizontal: 12,
    gap: 8,
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: 14,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  label: {
    fontSize: 17,
    color: '#000',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DDD',
    marginLeft: 20,
  },
  cancelBtn: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
});
