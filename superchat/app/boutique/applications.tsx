// ─── APPLICATIONS VIEW COMPONENT ──────────────────────────────────────────────
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: W } = Dimensions.get('window');

// ─── DATA ─────────────────────────────────────────────────────────────────────
const FEATURED_APPS = [
  { id: '1', name: 'SkoPay',   icon: 'school', color: '#003366', color2: '#00AEEF', tagline: 'Paiements scolaires', users: '12k', badge: '🔥 Tendance' },
  { id: '2', name: 'TogoRide', icon: 'car',    color: '#E17055', color2: '#FDCB6E', tagline: 'Moto & taxi à Lomé', users: '20k', badge: '⚡ Top'      },
  { id: '3', name: 'AfroPay',  icon: 'card',   color: '#00B894', color2: '#55EFC4', tagline: "Transfert d'argent",  users: '35k', badge: '✅ Vérifié'  },
];

const POPULAR_APPS = [
  { id: '1', name: 'SkoPay',    icon: 'school',    color: '#003366', desc: 'Paiements scolaires' },
  { id: '2', name: 'TogoRide',  icon: 'car',       color: '#E17055', desc: 'Transport urbain'    },
  { id: '3', name: 'AfroPay',   icon: 'card',      color: '#00B894', desc: 'Mobile money'        },
  { id: '4', name: 'EduTogo',   icon: 'book',      color: '#6C5CE7', desc: 'Cours en ligne'      },
  { id: '5', name: 'MobiSanté', icon: 'medkit',    color: '#34C759', desc: 'Médecin en ligne'    },
  { id: '6', name: 'MarketTG',  icon: 'storefront',color: '#FF9500', desc: 'Marketplace locale'  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function AppsView() {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔥 Les plus utilisées au Togo</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
        decelerationRate="fast" 
        snapToInterval={W * 0.72 + 14} 
        snapToAlignment="start"
      >
        {FEATURED_APPS.map((app) => (
          <TouchableOpacity key={app.id} style={[styles.featCard, { width: W * 0.72, marginRight: 14 }]}>
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: app.color }]} />
            <View style={[styles.featAccent, { backgroundColor: app.color2 }]} />
            
            <View style={styles.featIconBox}>
              <Ionicons name={app.icon as any} size={28} color="white" />
            </View>
            
            <View style={styles.featBadgePill}>
              <Text style={styles.featBadgeText}>{app.badge}</Text>
            </View>
            
            <View style={styles.featBottom}>
              <Text style={styles.featName}>{app.name}</Text>
              <Text style={styles.featTagline}>{app.tagline}</Text>
              <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop:10 }}>
                <Text style={{ fontSize:11, color:'rgba(255,255,255,0.85)' }}>👥 {app.users} utilisateurs</Text>
                <View style={styles.openBtn}>
                  <Text style={styles.openBtnText}>Ouvrir</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>📱 Toutes les apps</Text>
      </View>
      
      <View style={styles.appsGrid}>
        {POPULAR_APPS.map((app) => (
          <TouchableOpacity key={app.id} style={styles.appGridItem}>
            <View style={[styles.appGridIcon, { backgroundColor: app.color }]}>
              <Ionicons name={app.icon as any} size={24} color="white" />
            </View>
            <Text style={styles.appGridName}>{app.name}</Text>
            <Text style={styles.appGridDesc} numberOfLines={1}>{app.desc}</Text>
            <View style={styles.appGridOpenBtn}>
              <Text style={styles.appGridOpenText}>Ouvrir</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D0D0D',
    letterSpacing: -0.3,
  },
  featCard: {
    height: 195,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  featAccent: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.35,
  },
  featIconBox: {
    position: 'absolute',
    top: 14,
    left: 16,
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featBadgePill: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  featBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  featName: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  featTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  openBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  openBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D0D0D',
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  appGridItem: {
    width: (W - 32 - 24) / 3,
    backgroundColor: 'white',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  appGridIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  appGridName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D0D0D',
    textAlign: 'center',
  },
  appGridDesc: {
    fontSize: 10,
    color: '#AAAAAA',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  appGridOpenBtn: {
    backgroundColor: '#EAF4FF',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 2,
  },
  appGridOpenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
});
