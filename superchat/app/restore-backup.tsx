import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RestoreBackupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState('');
  const [email, setEmail] = useState('');

  const handleAppSelect = (app: string) => {
    setSelectedApp(app);
    setShowEmailModal(true);
  };

  const handleContinueWithoutRestore = () => {
    router.push('/setup-email');
  };

  const handleEmailSubmit = async () => {
    setShowEmailModal(false);
    try {
      const res = await fetch('http://10.1.0.240:3000/api/backup/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Sauvegarde envoyée à ${email}`);
      } else {
        alert('Erreur : ' + data.error);
      }
    } catch {
      alert('Impossible de contacter le serveur');
    }
    setTimeout(() => {
      router.push('/(tabs)/discussions');
    }, 500);
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

        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#111" />
          </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-download" size={64} color="#25D366" />
        </View>

        <Text style={styles.title}>Récupérer vos discussions</Text>
        <Text style={styles.subtitle}>
          Voulez-vous récupérer vos discussions depuis une sauvegarde existante ?
        </Text>

        <View style={styles.appsContainer}>
          <TouchableOpacity 
            style={styles.appCard}
            onPress={() => handleAppSelect('whatsapp')}
          >
            <View style={[styles.appIcon, { backgroundColor: '#25D366' }]}>
              <Ionicons name="logo-whatsapp" size={32} color="white" />
            </View>
            <Text style={styles.appName}>WhatsApp</Text>
            <Text style={styles.appDescription}>Récupérer depuis WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.appCard}
            onPress={() => handleAppSelect('whatsapp-business')}
          >
            <View style={[styles.appIcon, { backgroundColor: '#128C7E' }]}>
              <Ionicons name="briefcase" size={32} color="white" />
            </View>
            <Text style={styles.appName}>WhatsApp Business</Text>
            <Text style={styles.appDescription}>Récupérer depuis WA Business</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.appCard}
            onPress={() => handleAppSelect('orachat')}
          >
            <View style={[styles.appIcon, { backgroundColor: '#0088CC' }]}>
              <Ionicons name="chatbubbles" size={32} color="white" />
            </View>
            <Text style={styles.appName}>OraChat</Text>
            <Text style={styles.appDescription}>Récupérer depuis OraChat</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleContinueWithoutRestore}
        >
          <Text style={styles.skipButtonText}>Continuer sans récupérer</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showEmailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowEmailModal(false)}
          />
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Email de récupération</Text>
              <TouchableOpacity onPress={() => setShowEmailModal(false)}>
                <Ionicons name="close" size={24} color="#111" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Entrez l'email associé à votre compte {selectedApp === 'whatsapp' ? 'WhatsApp' : selectedApp === 'whatsapp-business' ? 'WhatsApp Business' : 'OraChat'}
            </Text>

            <TextInput
              style={styles.emailInput}
              placeholder="exemple@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />

            <TouchableOpacity 
              style={[styles.modalButton, email.trim() && styles.modalButtonActive]}
              disabled={!email.trim()}
              onPress={handleEmailSubmit}
            >
              <Text style={styles.modalButtonText}>Récupérer</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  appsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  appCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 13,
    color: '#666',
  },
  skipButton: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  emailInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonActive: {
    backgroundColor: '#25D366',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
