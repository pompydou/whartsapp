import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppsView from '../boutique/applications';
import BoutiqueView from '../boutique/boutique';
import SanteView from '../boutique/sante';

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'apps',      icon: 'apps',          label: 'Apps',        color: '#0D0D0D' },
  { id: 'boutique',  icon: 'bag',           label: 'Boutique',    color: '#FF6B6B' },
  { id: 'sante',     icon: 'medical',       label: 'Santé',       color: '#34C759' },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function OutilsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('apps');
  const [searchFocused, setSearchFocused] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const titleH  = scrollY.interpolate({ inputRange: [0, 55], outputRange: [56, 0], extrapolate: 'clamp' });
  const titleOp = scrollY.interpolate({ inputRange: [0, 36], outputRange: [1, 0],  extrapolate: 'clamp' });
  const activeCat = CATEGORIES.find(c => c.id === activeTab)!;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.stickyHeader}>
        <Animated.View style={{ height: titleH, opacity: titleOp, overflow: 'hidden' }}>
          <View style={styles.titleRow}>
            <Text style={styles.largeTitle}>Outils</Text>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={20} color="#111" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={[styles.searchWrap, searchFocused && { backgroundColor: '#E4E4EB' }]}>
          <Ionicons name="search" size={16} color="#AAAAAA" style={{ marginRight: 8 }} />
          <TextInput
            placeholder={`Rechercher dans ${activeCat.label}…`}
            placeholderTextColor="#AAAAAA"
            style={styles.searchInput}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchFocused
            ? <TouchableOpacity onPress={() => setSearchFocused(false)}><Text style={styles.cancelText}>Annuler</Text></TouchableOpacity>
            : <TouchableOpacity style={styles.filterIconBtn}><Ionicons name="options-outline" size={18} color="#555" /></TouchableOpacity>
          }
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catsContent} style={styles.catsScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <TouchableOpacity key={cat.id} onPress={() => setActiveTab(cat.id)}
                style={[styles.catPill, isActive && { backgroundColor: cat.color, borderColor: cat.color }]}>
                <Ionicons name={cat.icon as any} size={14} color={isActive ? 'white' : '#666'} style={{ marginRight: 5 }} />
                <Text style={[styles.catLabel, isActive && { color: 'white', fontWeight: '700' }]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Animated.ScrollView
        key={activeTab}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces alwaysBounceVertical decelerationRate="normal"
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        {activeTab === 'apps'      && <AppsView />}
        {activeTab === 'boutique'  && <BoutiqueView />}
        {activeTab === 'sante'     && <SanteView />}
      </Animated.ScrollView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FA' },
  stickyHeader: {
    backgroundColor: '#F8F8FA', 
    paddingBottom: 6,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, 
    shadowRadius: 6, 
    elevation: 3, 
    zIndex: 10,
  },
  titleRow: { 
    flexDirection:'row', 
    alignItems:'center', 
    justifyContent:'space-between', 
    paddingHorizontal:20, 
    paddingBottom:6 
  },
  largeTitle: { 
    fontSize:30, 
    fontWeight:'800', 
    color:'#0D0D0D', 
    letterSpacing:-0.5 
  },
  notifBtn: { 
    position:'relative', 
    padding:6 
  },
  notifDot: { 
    position:'absolute', 
    top:6, 
    right:6, 
    width:8, 
    height:8, 
    borderRadius:4, 
    backgroundColor:'#FF3B30', 
    borderWidth:1.5, 
    borderColor:'#F8F8FA' 
  },
  searchWrap: { 
    flexDirection:'row', 
    alignItems:'center', 
    backgroundColor:'#EBEBF0', 
    marginHorizontal:16, 
    marginTop:4, 
    marginBottom:2, 
    paddingHorizontal:12, 
    paddingVertical:Platform.OS==='ios'?9:7, 
    borderRadius:14 
  },
  searchInput: { 
    flex:1, 
    fontSize:14, 
    color:'#111', 
    padding:0 
  },
  cancelText: { 
    color:'#25D366', 
    fontSize:14, 
    fontWeight:'500', 
    marginLeft:8 
  },
  filterIconBtn: { 
    width:30, 
    height:30, 
    borderRadius:8, 
    backgroundColor:'white', 
    justifyContent:'center', 
    alignItems:'center' 
  },
  catsScroll: { 
    marginTop:8 
  },
  catsContent: { 
    paddingHorizontal:16, 
    gap:8, 
    paddingVertical:2 
  },
  catPill: { 
    flexDirection:'row', 
    alignItems:'center', 
    paddingHorizontal:14, 
    paddingVertical:7, 
    borderRadius:20, 
    backgroundColor:'white', 
    borderWidth:1, 
    borderColor:'#E8E8EE', 
    marginRight:8, 
    shadowColor:'#000', 
    shadowOffset:{width:0,height:1}, 
    shadowOpacity:0.06, 
    shadowRadius:3, 
    elevation:1 
  },
  catLabel: { 
    fontSize:13, 
    fontWeight:'500', 
    color:'#555' 
  },
});