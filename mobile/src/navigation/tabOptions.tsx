import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '../theme/colors';

export const tabScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.forestBright,
  tabBarInactiveTintColor: colors.inkMuted,
  tabBarLabelStyle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
  },
  tabBarStyle: {
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
};

export function tabIcon(
  symbol: string,
): BottomTabNavigationOptions['tabBarIcon'] {
  return ({ color, focused }) => (
    <Text
      style={{
        fontSize: focused ? 18 : 16,
        color,
        fontFamily: focused ? 'DMSans_700Bold' : 'DMSans_500Medium',
      }}
    >
      {symbol}
    </Text>
  );
}

export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.sandSoft },
  headerTintColor: colors.forestBright,
  headerTitleStyle: {
    fontFamily: 'DMSans_600SemiBold' as const,
    color: colors.ink,
  },
  contentStyle: { backgroundColor: colors.sandSoft },
  headerShadowVisible: false,
};
