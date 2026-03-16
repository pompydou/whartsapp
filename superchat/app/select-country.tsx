import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const countries = [
  { code: '+228', name: 'Togo', flag: '🇹🇬' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+1', name: 'États-Unis', flag: '🇺🇸' },
  { code: '+44', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: '+49', name: 'Allemagne', flag: '🇩🇪' },
  { code: '+225', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: '+221', name: 'Sénégal', flag: '🇸🇳' },
  { code: '+229', name: 'Bénin', flag: '🇧🇯' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+223', name: 'Mali', flag: '🇲🇱' },
  { code: '+227', name: 'Niger', flag: '🇳🇪' },
  { code: '+237', name: 'Cameroun', flag: '🇨🇲' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: '+212', name: 'Maroc', flag: '🇲🇦' },
  { code: '+213', name: 'Algérie', flag: '🇩🇿' },
  { code: '+216', name: 'Tunisie', flag: '🇹🇳' },
  { code: '+20', name: 'Égypte', flag: '🇪🇬' },
  { code: '+27', name: 'Afrique du Sud', flag: '🇿🇦' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
];

export default function SelectCountryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredCountries = countries.filter(
    country =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.code.includes(search)
  );

  const handleSelectCountry = (country: typeof countries[0]) => {
    // Ici on pourrait stocker le pays sélectionné dans un contexte ou state global
    router.back();
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800' }}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
        <View style={[styles.languageContainer, { top: insets.top + 16 }]}>
          <Text style={styles.languageText}>Français</Text>
        </View>

        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#111" />
          </TouchableOpacity>

          <Text style={styles.title}>Choisir un pays</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un pays"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.countryItem}
            onPress={() => handleSelectCountry(item)}
          >
            <Text style={styles.countryFlag}>{item.flag}</Text>
            <View style={styles.countryInfo}>
              <Text style={styles.countryName}>{item.name}</Text>
              <Text style={styles.countryCode}>{item.code}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  languageContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  languageText: {
    color: 'white',
    opacity: 0.7,
    fontSize: 14,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: '85%',
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginLeft: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111',
    paddingHorizontal: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countryFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
    marginBottom: 2,
  },
  countryCode: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F0F0F0',
    marginLeft: 80,
  },
});
