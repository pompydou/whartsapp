import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginMobileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+228');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (phone.trim()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    
    const result = await login(phone, countryCode);
    
    if (result.success) {
      setShowConfirmModal(false);
      router.push('/verify-phone?type=login');
    } else {
      setError(result.error || 'Une erreur est survenue');
      setShowConfirmModal(false);
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

      <View style={styles.content}>
        <Text style={styles.title}>Connexion</Text>

        <View style={styles.form}>
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
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Numéro de mobile"
                placeholderTextColor="#999"
                autoFocus
              />
              {phone.length > 0 && (
                <TouchableOpacity onPress={() => setPhone('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.infoText}>
          Le numéro de mobile ci-dessus n'est utilisé qu'à des fins de vérification de connexion
        </Text>

        <TouchableOpacity style={styles.submitButton} onPress={handleContinue}>
          <Text style={styles.submitButtonText}>Accepter et continuer</Text>
        </TouchableOpacity>

        <View style={styles.bottomLinks}>
          <TouchableOpacity>
            <Text style={styles.bottomLinkText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
          <Text style={styles.bottomLinkSeparator}>|</Text>
          <TouchableOpacity>
            <Text style={styles.bottomLinkText}>Aide</Text>
          </TouchableOpacity>
        </View>
      </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer le numéro</Text>
            <Text style={styles.modalPhone}>{countryCode} {phone}</Text>
            <Text style={styles.modalText}>
              Est-ce le bon numéro ? Nous allons vous envoyer un code de vérification par SMS.
            </Text>

            {loading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color="#25D366" />
                <Text style={styles.modalLoadingText}>Envoi du code...</Text>
              </View>
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={styles.modalButtonSecondaryText}>Modifier</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButtonPrimary}
                  onPress={handleConfirm}
                >
                  <Text style={styles.modalButtonPrimaryText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 8,
  },
  content: {
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#111',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
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
  infoText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  submitButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bottomLinkText: {
    fontSize: 13,
    color: '#0088CC',
  },
  bottomLinkSeparator: {
    fontSize: 13,
    color: '#0088CC',
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalPhone: {
    fontSize: 18,
    fontWeight: '600',
    color: '#25D366',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  modalButtonPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  modalLoadingText: {
    fontSize: 14,
    color: '#666',
  },
});
