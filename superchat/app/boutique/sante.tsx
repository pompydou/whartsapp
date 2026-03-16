// ─── SANTÉ VIEW COMPONENT ─────────────────────────────────────────────────────
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: W } = Dimensions.get('window');

// ─── DATA ─────────────────────────────────────────────────────────────────────
const HEALTH_SPOTS = [
  { id: 'h1', name: 'CHU Sylvanus Olympio', dist: '1.2km', type: 'Hôpital',   open: true, icon: 'medkit',  color: '#FF3B30', urgent: true  },
  { id: 'h2', name: 'Pharmacie du Centre',  dist: '180m',  type: 'Pharmacie', open: true, icon: 'medical', color: '#34C759', urgent: false },
  { id: 'h3', name: 'Clinique Biasa',       dist: '450m',  type: 'Clinique',  open: true, icon: 'fitness', color: '#007AFF', urgent: false },
  { id: 'h4', name: 'Pharmacie de Nuit',    dist: '820m',  type: 'Pharmacie', open: true, icon: 'medical', color: '#FF9500', urgent: false },
];

// ─── MAP PLACEHOLDER ──────────────────────────────────────────────────────────
function MapPlaceholder() {
  return (
    <View style={styles.mapBox}>
      <View style={styles.mapBg} />
      
      {/* Grid lines */}
      {[0,1,2,3].map(i => <View key={'h'+i} style={[styles.mapGridH, { top: 30 + i * 44 }]} />)}
      {[0,1,2,3,4].map(i => <View key={'v'+i} style={[styles.mapGridV, { left: 30 + i * 58 }]} />)}
      
      {/* Pins */}
      {HEALTH_SPOTS.slice(0,4).map((s, i) => (
        <View 
          key={s.id} 
          style={[
            styles.mapPin, 
            { 
              top: 28 + (i%2)*80, 
              left: 30 + Math.floor(i/2)*120, 
              backgroundColor: s.color 
            }
          ]}
        >
          <Ionicons name="location" size={9} color="white" />
        </View>
      ))}
      
      {/* My location */}
      <View style={styles.mapMyLocation}>
        <View style={styles.mapMyDot} />
        <View style={styles.mapMyRing} />
      </View>
      
      {/* Label */}
      <View style={styles.mapLabelPill}>
        <Ionicons name="navigate-circle" size={13} color="#34C759" />
        <Text style={styles.mapLabelText}>Carte • Lomé, Togo</Text>
      </View>
      
      {/* Expand button */}
      <TouchableOpacity style={styles.mapExpandBtn}>
        <Ionicons name="expand-outline" size={13} color="white" />
        <Text style={styles.mapExpandText}>Plein écran</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function SanteView() {
  return (
    <>
      <MapPlaceholder />
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏥 Établissements proches</Text>
        <TouchableOpacity style={styles.sortPill}>
          <Ionicons name="options-outline" size={12} color="#34C759" />
          <Text style={styles.sortPillText}>Trier</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.spotsCard}>
        {HEALTH_SPOTS.map((s, i) => (
          <View key={s.id}>
            <TouchableOpacity style={styles.spotRow}>
              <View style={[styles.spotIcon, { backgroundColor: s.color }]}>
                <Ionicons name={s.icon as any} size={20} color="white" />
              </View>
              
              <View style={styles.spotMiddle}>
                <View style={styles.spotNameRow}>
                  <Text style={styles.spotName}>{s.name}</Text>
                  {s.urgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>🚨 Urgences</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.spotType}>{s.type}</Text>
                
                <View style={styles.spotMeta}>
                  <Ionicons name="location-outline" size={11} color="#AAAAAA" />
                  <Text style={styles.spotDist}>{s.dist}</Text>
                  <View style={s.open ? styles.availBadge : styles.unavailBadge}>
                    <Text style={s.open ? styles.availText : styles.unavailText}>
                      {s.open ? 'Ouvert' : 'Fermé'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.spotRight}>
                <TouchableOpacity style={styles.reserveBtn}>
                  <Text style={styles.reserveText}>Itinéraire</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.callBtn}>
                  <Ionicons name="call" size={13} color="#34C759" />
                  <Text style={styles.callBtnText}>Appeler</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            
            {i < HEALTH_SPOTS.length - 1 && <View style={styles.spotSep} />}
          </View>
        ))}
      </View>
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  
  // Map
  mapBox: {
    height: 195,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#34C75940',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  mapBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#34C7590D',
  },
  mapGridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  mapGridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  mapPin: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  mapMyLocation: {
    position: 'absolute',
    bottom: 55,
    right: 75,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapMyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: 'white',
  },
  mapMyRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#34C759',
    opacity: 0.3,
  },
  mapLabelPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  mapLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },
  mapExpandBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  mapExpandText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  
  // Spots
  spotsCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  spotIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  spotMiddle: {
    flex: 1,
    gap: 4,
  },
  spotNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spotName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D0D0D',
    flex: 1,
  },
  spotType: {
    fontSize: 11,
    color: '#AAAAAA',
  },
  spotMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spotDist: {
    fontSize: 11,
    color: '#AAAAAA',
    marginRight: 2,
  },
  spotRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  spotSep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EFEFF4',
    marginLeft: 76,
  },
  availBadge: {
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  availText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34C759',
  },
  unavailBadge: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unavailText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF3B30',
  },
  urgentBadge: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.2)',
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF3B30',
  },
  reserveBtn: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  reserveText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: '#34C759',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },
});
