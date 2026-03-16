import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Essayer d'importer BlurView, sinon utiliser un fallback
let BlurView: any;
try {
  BlurView = require('expo-blur').BlurView;
} catch (e) {
  // BlurView non disponible, on utilisera un fond semi-transparent
  BlurView = null;
}

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  badgeCount?: number;
}

export default function CustomTabBar({ state, descriptors, navigation, badgeCount = 3 }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'actus', label: 'Actus', iconOutline: 'radio-outline', iconFilled: 'radio' },
    { name: 'appels', label: 'Appels', iconOutline: 'call-outline', iconFilled: 'call' },
    { name: 'outils', label: 'Boutique', iconOutline: 'storefront-outline', iconFilled: 'storefront' },
    { name: 'discussions', label: 'Discussions', iconOutline: 'chatbubbles-outline', iconFilled: 'chatbubbles' },
    { name: 'parametres', label: 'Paramètres', iconOutline: 'settings-outline', iconFilled: 'settings' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {BlurView && Platform.OS === 'ios' ? (
        <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={styles.glassBackground} />
      )}
      
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        const iconName = isFocused ? tab.iconFilled : tab.iconOutline;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index].key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(state.routes[index].name);
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View>
              <Ionicons
                name={iconName as any}
                size={24}
                color={isFocused ? '#111' : '#8E8E93'}
              />
              {tab.name === 'discussions' && badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color: isFocused ? '#111' : '#8E8E93' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    overflow: 'hidden',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(20px)',
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    marginTop: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#25D366',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});
