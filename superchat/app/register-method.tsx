import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#111" />
          </TouchableOpacity>

          <Text style={styles.title}>Bienvenue sur OraChat</Text>

          <Pressable 
            style={styles.primaryButton}
            onPress={() => router.push('/register-mobile')}
          >
            <Ionicons name="person-add" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>S'inscrire avec un numéro</Text>
          </Pressable>

          <Pressable 
            style={styles.secondaryButton}
            onPress={() => router.push('/login-mobile')}
          >
            <Ionicons name="call" size={20} color="#111" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Se connecter avec un numéro</Text>
          </Pressable>
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
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    height: 52,
    borderRadius: 10,
    marginVertical: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 52,
    borderRadius: 10,
    marginVertical: 8,
  },
  secondaryButtonText: {
    color: '#111',
    fontWeight: '600',
    fontSize: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
});
