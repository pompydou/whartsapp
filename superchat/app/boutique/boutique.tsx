// ─── BOUTIQUE VIEW COMPONENT ──────────────────────────────────────────────────
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: W } = Dimensions.get('window');

// ─── DATA ─────────────────────────────────────────────────────────────────────
const BOUTIQUE_CATS = [
  { id: 'b1', icon: 'shirt-outline',    label: 'Mode',       color: '#FF6B6B' },
  { id: 'b2', icon: 'phone-portrait',   label: 'Téléphones', color: '#007AFF' },
  { id: 'b3', icon: 'laptop-outline',   label: 'Ordi',       color: '#5E5CE6' },
  { id: 'b4', icon: 'home-outline',     label: 'Maison',     color: '#FF9500' },
  { id: 'b5', icon: 'football-outline', label: 'Sport',      color: '#34C759' },
  { id: 'b6', icon: 'diamond-outline',  label: 'Bijoux',     color: '#FFD700' },
];

const PRODUCTS = [
  { id: 'p1', name: 'iPhone 15 Pro',      price: '650 000 F', oldPrice: '720 000 F', icon: 'phone-portrait', color: '#1C1C1E', seller: 'TechShop Lomé', badge: '📦 Livraison' },
  { id: 'p2', name: 'MacBook Air M2',     price: '920 000 F', oldPrice: null,        icon: 'laptop-outline', color: '#5E5CE6', seller: 'AppleTG',       badge: '✅ Officiel'  },
  { id: 'p3', name: 'Robe Wax Élégance', price: '12 500 F',  oldPrice: '18 000 F',  icon: 'shirt-outline',  color: '#FF6B6B', seller: 'ModaAfrica',    badge: '🔥 Promo'    },
  { id: 'p4', name: 'Samsung S24',        price: '480 000 F', oldPrice: '530 000 F', icon: 'phone-portrait', color: '#1A73E8', seller: 'GadgetTogo',    badge: '📦 Livraison'},
  { id: 'p5', name: 'Sneakers Nike AF1',  price: '35 000 F',  oldPrice: null,        icon: 'footsteps',      color: '#FF9500', seller: 'SneakerTG',     badge: '⚡ Neuf'     },
  { id: 'p6', name: 'Sac Cuir Premium',   price: '28 000 F',  oldPrice: '40 000 F',  icon: 'bag-handle',     color: '#8B4513', seller: 'LeatherAfrica', badge: '🔥 Promo'    },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function BoutiqueView() {
  const [activeBCat, setActiveBCat] = useState('b1');
  
  return (
    <>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 10 }}
      >
        {BOUTIQUE_CATS.map((bc) => (
          <TouchableOpacity 
            key={bc.id} 
            onPress={() => setActiveBCat(bc.id)}
            style={[
              styles.subCatPill, 
              activeBCat === bc.id && { backgroundColor: bc.color, borderColor: bc.color }
            ]}
          >
            <Ionicons name={bc.icon as any} size={14} color={activeBCat === bc.id ? 'white' : '#666'} />
            <Text style={[
              styles.subCatText, 
              activeBCat === bc.id && { color: 'white', fontWeight: '700' }
            ]}>
              {bc.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🛍 Produits disponibles</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Filtrer</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.productsGrid}>
        {PRODUCTS.map((p) => (
          <TouchableOpacity key={p.id} style={styles.productCard}>
            <View style={[styles.productImageBox, { backgroundColor: p.color + '18' }]}>
              <Ionicons name={p.icon as any} size={40} color={p.color} />
              <View style={styles.productBadge}>
                <Text style={styles.productBadgeText}>{p.badge}</Text>
              </View>
            </View>
            
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
              <Text style={styles.productSeller} numberOfLines={1}>📍 {p.seller}</Text>
              
              <View style={styles.productPriceRow}>
                <Text style={styles.productPrice}>{p.price}</Text>
                {p.oldPrice && <Text style={styles.productOldPrice}>{p.oldPrice}</Text>}
              </View>
              
              <TouchableOpacity style={styles.productAddBtn}>
                <Ionicons name="add" size={14} color="white" />
                <Text style={styles.productAddText}>Ajouter</Text>
              </TouchableOpacity>
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
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  subCatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  subCatText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: (W - 32 - 12) / 2,
    backgroundColor: 'white',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
  },
  productImageBox: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
  productInfo: {
    padding: 12,
    gap: 3,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D0D0D',
    letterSpacing: -0.1,
  },
  productSeller: {
    fontSize: 11,
    color: '#AAAAAA',
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0D0D0D',
  },
  productOldPrice: {
    fontSize: 11,
    color: '#BBBBBB',
    textDecorationLine: 'line-through',
  },
  productAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 10,
    paddingVertical: 7,
    marginTop: 6,
    gap: 4,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  productAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
});
