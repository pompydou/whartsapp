import CustomTabBar from '@/components/CustomTabBar';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="actus" />
      <Tabs.Screen name="appels" />
      <Tabs.Screen name="outils" />
      <Tabs.Screen name="discussions" />
      <Tabs.Screen name="parametres" />
    </Tabs>
  );
}
