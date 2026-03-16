import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Pendant le chargement, on peut afficher un splash screen ou loader
  if (isLoading) {
    return null; // Ou un composant de chargement
  }

  // Si authentifié, vers les discussions, sinon vers l'inscription
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/discussions" />;
  }
  
  return <Redirect href="/register-method" />;
}
