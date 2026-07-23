import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { colors } from '../theme/colors';
import { AdminNavigator } from './AdminNavigator';
import { LenderNavigator } from './LenderNavigator';
import { PortalNavigator } from './PortalNavigator';
import type { AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  const { mode, user, portalCustomer, permissions, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.leaf} size="large" />
      </View>
    );
  }

  if (mode === 'portal' && portalCustomer) {
    return <PortalNavigator />;
  }

  if (mode === 'staff' && user) {
    if (user.is_super_admin || permissions.includes('*')) {
      return <AdminNavigator />;
    }

    return <LenderNavigator />;
  }

  return <AuthNavigator />;
}

export function RootNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: colors.forestBright,
          background: colors.sandSoft,
          card: colors.white,
          text: colors.ink,
          border: colors.line,
          notification: colors.forestBright,
        },
        fonts: {
          regular: {
            fontFamily: 'DMSans_400Regular',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'DMSans_500Medium',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'DMSans_700Bold',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'DMSans_700Bold',
            fontWeight: '700',
          },
        },
      }}
    >
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestDeep,
  },
});
