import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterMobileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+228');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = fullName.trim() && phone.trim() && acceptedTerms;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setError(null);
    
    const result = await register(fullName, phone, countryCode);
    
    if (result.success) {
      router.push('/verify-phone?type=register');
    } else {
      setError(result.error || 'Une erreur est survenue');
    }
    
    setLoading(false);
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

        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 24 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Créer votre compte</Text>

        <TouchableOpacity style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#BDBDBD" />
          </View>
          <Text style={styles.avatarText}>Ajouter une photo</Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.formRow}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrer votre nom"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.separator} />

          <Pressable style={styles.formRow} onPress={() => router.push('/select-country')}>
            <Text style={styles.label}>Région</Text>
            <View style={styles.rowRight}>
              <Text style={styles.value}>Togo</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </Pressable>

          <View style={styles.separator} />

          <View style={styles.formRow}>
            <Text style={styles.label}>Téléphone</Text>
            <View style={styles.phoneInput}>
              <Text style={styles.phoneCode}>+228</Text>
              <TextInput
                style={styles.phoneNumber}
                placeholder="Numéro de mobile"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <View style={styles.termsContainer}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <View style={[styles.checkboxCircle, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.termsText}>
              J'ai lu et j'accepte les{' '}
              <Text style={styles.termsLink}>Conditions d'utilisation</Text>
            </Text>
          </TouchableOpacity>
          <Text style={styles.termsSubtext}>
            Les informations recueillies ne sont utilisées qu'à des fins d'inscription.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {loading ? (
          <View style={[styles.submitButton, styles.submitButtonActive]}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.submitButtonText}>Inscription en cours...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, isFormValid && styles.submitButtonActive, error && styles.submitButtonError]}
            disabled={!isFormValid || loading}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              {error ? `Erreur: ${error}` : 'Accepter et continuer'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    maxHeight: '85%',
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 8,
  },
  content: {
    maxHeight: '70%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#111',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 14,
    color: '#25D366',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  label: {
    fontSize: 16,
    color: '#111',
    width: 100,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  rowRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  value: {
    fontSize: 16,
    color: '#111',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginRight: 8,
  },
  phoneNumber: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 16,
  },
  termsContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#25D366',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#25D366',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    lineHeight: 20,
  },
  termsLink: {
    color: '#0088CC',
  },
  termsSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    marginLeft: 32,
    lineHeight: 16,
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  submitButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: '#25D366',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
