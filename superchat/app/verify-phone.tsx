import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: 'login' | 'register' }>();
  const { verifyCode, resendCode } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  // Récupérer les infos depuis le SecureStore (ou utiliser des valeurs par défaut)
  const phone = '90 76 68 71'; // À récupérer du storage
  const countryCode = '+228';

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) return;
    
    setLoading(true);
    setError(null);
    
    const result = await verifyCode(phone.replace(/\s/g, ''), verificationCode, countryCode, type || 'register');
    
    if (result.success) {
      // Navigation automatique selon le type
      if (type === 'login') {
        router.push('/restore-backup');
      } else {
        router.push('/setup-email');
      }
    } else {
      setError(result.error || 'Code invalide');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    
    setLoading(false);
  };

  const handleResendCode = async () => {
    setResending(true);
    const result = await resendCode(phone.replace(/\s/g, ''), countryCode, type || 'register');
    if (result.success) {
      alert('Nouveau code envoyé !');
    } else {
      alert('Erreur lors de l\'envoi du code');
    }
    setResending(false);
  };

  const isCodeComplete = code.every(digit => digit !== '');

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
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubble-ellipses" size={64} color="#25D366" />
        </View>

        <Text style={styles.title}>Vérifier votre numéro</Text>
        <Text style={styles.subtitle}>
          Nous avons envoyé un code de vérification à{'\n'}
          <Text style={styles.phone}>+228 90 76 68 71</Text>
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[styles.codeInput, digit && styles.codeInputFilled]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendText}>Renvoyer le code</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitButton, isCodeComplete && styles.submitButtonActive]}
          disabled={!isCodeComplete}
          onPress={handleVerify}
        >
          <Text style={styles.submitButtonText}>Vérifier</Text>
        </TouchableOpacity>
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
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 8,
  },
  content: {
    paddingTop: 8,
  },
  iconContainer: {
    alignItems: 'center',
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
  phone: {
    fontWeight: '600',
    color: '#111',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111',
  },
  codeInputFilled: {
    borderColor: '#25D366',
  },
  resendButton: {
    alignSelf: 'center',
    padding: 12,
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: '#0088CC',
    fontWeight: '600',
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
