import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PortalApplicationCreateScreen } from '../screens/portal/ApplicationCreateScreen';
import { PortalApplicationDetailScreen } from '../screens/portal/ApplicationDetailScreen';
import { PortalApplicationsListScreen } from '../screens/portal/ApplicationsListScreen';
import { PortalDashboardScreen } from '../screens/portal/DashboardScreen';
import { PortalLoanDetailScreen } from '../screens/portal/LoanDetailScreen';
import { PortalLoansListScreen } from '../screens/portal/LoansListScreen';
import { PortalProfileScreen } from '../screens/portal/ProfileScreen';
import { stackScreenOptions, tabIcon, tabScreenOptions } from './tabOptions';
import type {
  PortalApplicationsStackParamList,
  PortalHomeStackParamList,
  PortalLoansStackParamList,
  PortalTabParamList,
} from './types';

const Tab = createBottomTabNavigator<PortalTabParamList>();
const HomeStack = createNativeStackNavigator<PortalHomeStackParamList>();
const LoansStack = createNativeStackNavigator<PortalLoansStackParamList>();
const ApplicationsStack =
  createNativeStackNavigator<PortalApplicationsStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        name="Dashboard"
        component={PortalDashboardScreen}
        options={{ title: 'Overview' }}
      />
    </HomeStack.Navigator>
  );
}

function PortalLoansNavigator() {
  return (
    <LoansStack.Navigator screenOptions={stackScreenOptions}>
      <LoansStack.Screen
        name="PortalLoansList"
        component={PortalLoansListScreen}
        options={{ title: 'My loans' }}
      />
      <LoansStack.Screen
        name="PortalLoanDetail"
        component={PortalLoanDetailScreen}
        options={{ title: 'Loan' }}
      />
    </LoansStack.Navigator>
  );
}

function PortalApplicationsNavigator() {
  return (
    <ApplicationsStack.Navigator screenOptions={stackScreenOptions}>
      <ApplicationsStack.Screen
        name="PortalApplicationsList"
        component={PortalApplicationsListScreen}
        options={{ title: 'Applications' }}
      />
      <ApplicationsStack.Screen
        name="PortalApplicationDetail"
        component={PortalApplicationDetailScreen}
        options={{ title: 'Application' }}
      />
      <ApplicationsStack.Screen
        name="PortalApplicationCreate"
        component={PortalApplicationCreateScreen}
        options={{ title: 'New application' }}
      />
    </ApplicationsStack.Navigator>
  );
}

export function PortalNavigator() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          title: 'Home',
          tabBarIcon: tabIcon('⌂'),
        }}
      />
      <Tab.Screen
        name="Loans"
        component={PortalLoansNavigator}
        options={{
          title: 'Loans',
          tabBarIcon: tabIcon('◇'),
        }}
      />
      <Tab.Screen
        name="Applications"
        component={PortalApplicationsNavigator}
        options={{
          title: 'Apps',
          tabBarIcon: tabIcon('▤'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PortalProfileScreen}
        options={{
          headerShown: true,
          title: 'Profile',
          ...stackScreenOptions,
          tabBarIcon: tabIcon('☺'),
        }}
      />
    </Tab.Navigator>
  );
}
