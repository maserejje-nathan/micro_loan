import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminAccountScreen } from '../screens/admin/AccountScreen';
import { BillingHomeScreen } from '../screens/admin/BillingHomeScreen';
import { AdminDashboardScreen } from '../screens/admin/DashboardScreen';
import { InvoicesScreen } from '../screens/admin/InvoicesScreen';
import { OrganizationsListScreen } from '../screens/admin/OrganizationsListScreen';
import { OrganizationDetailScreen } from '../screens/admin/OrganizationDetailScreen';
import { PlansScreen } from '../screens/admin/PlansScreen';
import { SubscriptionsScreen } from '../screens/admin/SubscriptionsScreen';
import { SystemScreen } from '../screens/admin/SystemScreen';
import { stackScreenOptions, tabIcon, tabScreenOptions } from './tabOptions';
import type {
  AdminBillingStackParamList,
  AdminHomeStackParamList,
  AdminOrganizationsStackParamList,
  AdminTabParamList,
} from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const HomeStack = createNativeStackNavigator<AdminHomeStackParamList>();
const OrganizationsStack =
  createNativeStackNavigator<AdminOrganizationsStackParamList>();
const BillingStack = createNativeStackNavigator<AdminBillingStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Platform' }}
      />
    </HomeStack.Navigator>
  );
}

function OrganizationsNavigator() {
  return (
    <OrganizationsStack.Navigator screenOptions={stackScreenOptions}>
      <OrganizationsStack.Screen
        name="OrganizationsList"
        component={OrganizationsListScreen}
        options={{ title: 'Organizations' }}
      />
      <OrganizationsStack.Screen
        name="OrganizationDetail"
        component={OrganizationDetailScreen}
        options={{ title: 'Organization' }}
      />
    </OrganizationsStack.Navigator>
  );
}

function BillingNavigator() {
  return (
    <BillingStack.Navigator screenOptions={stackScreenOptions}>
      <BillingStack.Screen
        name="BillingHome"
        component={BillingHomeScreen}
        options={{ title: 'Billing' }}
      />
      <BillingStack.Screen
        name="Plans"
        component={PlansScreen}
        options={{ title: 'Plans' }}
      />
      <BillingStack.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{ title: 'Subscriptions' }}
      />
      <BillingStack.Screen
        name="Invoices"
        component={InvoicesScreen}
        options={{ title: 'Invoices' }}
      />
    </BillingStack.Navigator>
  );
}

export function AdminNavigator() {
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
        name="Organizations"
        component={OrganizationsNavigator}
        options={{
          title: 'Orgs',
          tabBarIcon: tabIcon('▣'),
        }}
      />
      <Tab.Screen
        name="Billing"
        component={BillingNavigator}
        options={{
          title: 'Billing',
          tabBarIcon: tabIcon('◇'),
        }}
      />
      <Tab.Screen
        name="System"
        component={SystemScreen}
        options={{
          headerShown: true,
          title: 'System',
          ...stackScreenOptions,
          tabBarIcon: tabIcon('⚙'),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AdminAccountScreen}
        options={{
          headerShown: true,
          title: 'Account',
          ...stackScreenOptions,
          tabBarIcon: tabIcon('☺'),
        }}
      />
    </Tab.Navigator>
  );
}
