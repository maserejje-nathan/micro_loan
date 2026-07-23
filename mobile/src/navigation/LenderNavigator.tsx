import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApplicationsListScreen } from '../screens/lender/ApplicationsListScreen';
import { ApplicationDetailScreen } from '../screens/lender/ApplicationDetailScreen';
import { AuditLogsScreen } from '../screens/lender/AuditLogsScreen';
import { CustomersListScreen } from '../screens/lender/CustomersListScreen';
import { CustomerDetailScreen } from '../screens/lender/CustomerDetailScreen';
import { LenderDashboardScreen } from '../screens/lender/DashboardScreen';
import { LoansListScreen } from '../screens/lender/LoansListScreen';
import { LoanDetailScreen } from '../screens/lender/LoanDetailScreen';
import { MoreMenuScreen } from '../screens/lender/MoreMenuScreen';
import { ProductsListScreen } from '../screens/lender/ProductsListScreen';
import { ProductDetailScreen } from '../screens/lender/ProductDetailScreen';
import { LenderProfileScreen } from '../screens/lender/ProfileScreen';
import { RepaymentsListScreen } from '../screens/lender/RepaymentsListScreen';
import { RepaymentCreateScreen } from '../screens/lender/RepaymentCreateScreen';
import { ReportsScreen } from '../screens/lender/ReportsScreen';
import { stackScreenOptions, tabIcon, tabScreenOptions } from './tabOptions';
import type {
  LenderApplicationsStackParamList,
  LenderCustomersStackParamList,
  LenderHomeStackParamList,
  LenderLoansStackParamList,
  LenderMoreStackParamList,
  LenderTabParamList,
} from './types';

const Tab = createBottomTabNavigator<LenderTabParamList>();
const HomeStack = createNativeStackNavigator<LenderHomeStackParamList>();
const CustomersStack =
  createNativeStackNavigator<LenderCustomersStackParamList>();
const ApplicationsStack =
  createNativeStackNavigator<LenderApplicationsStackParamList>();
const LoansStack = createNativeStackNavigator<LenderLoansStackParamList>();
const MoreStack = createNativeStackNavigator<LenderMoreStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        name="Dashboard"
        component={LenderDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
    </HomeStack.Navigator>
  );
}

function CustomersNavigator() {
  return (
    <CustomersStack.Navigator screenOptions={stackScreenOptions}>
      <CustomersStack.Screen
        name="CustomersList"
        component={CustomersListScreen}
        options={{ title: 'Customers' }}
      />
      <CustomersStack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{ title: 'Customer' }}
      />
    </CustomersStack.Navigator>
  );
}

function ApplicationsNavigator() {
  return (
    <ApplicationsStack.Navigator screenOptions={stackScreenOptions}>
      <ApplicationsStack.Screen
        name="ApplicationsList"
        component={ApplicationsListScreen}
        options={{ title: 'Applications' }}
      />
      <ApplicationsStack.Screen
        name="ApplicationDetail"
        component={ApplicationDetailScreen}
        options={{ title: 'Application' }}
      />
    </ApplicationsStack.Navigator>
  );
}

function LoansNavigator() {
  return (
    <LoansStack.Navigator screenOptions={stackScreenOptions}>
      <LoansStack.Screen
        name="LoansList"
        component={LoansListScreen}
        options={{ title: 'Loans' }}
      />
      <LoansStack.Screen
        name="LoanDetail"
        component={LoanDetailScreen}
        options={{ title: 'Loan' }}
      />
    </LoansStack.Navigator>
  );
}

function MoreNavigator() {
  return (
    <MoreStack.Navigator screenOptions={stackScreenOptions}>
      <MoreStack.Screen
        name="MoreMenu"
        component={MoreMenuScreen}
        options={{ title: 'More' }}
      />
      <MoreStack.Screen
        name="Products"
        component={ProductsListScreen}
        options={{ title: 'Products' }}
      />
      <MoreStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product' }}
      />
      <MoreStack.Screen
        name="Repayments"
        component={RepaymentsListScreen}
        options={{ title: 'Repayments' }}
      />
      <MoreStack.Screen
        name="RepaymentCreate"
        component={RepaymentCreateScreen}
        options={{ title: 'Record repayment' }}
      />
      <MoreStack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
      <MoreStack.Screen
        name="AuditLogs"
        component={AuditLogsScreen}
        options={{ title: 'Audit logs' }}
      />
      <MoreStack.Screen
        name="Profile"
        component={LenderProfileScreen}
        options={{ title: 'Profile' }}
      />
    </MoreStack.Navigator>
  );
}

export function LenderNavigator() {
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
        name="Customers"
        component={CustomersNavigator}
        options={{
          title: 'Customers',
          tabBarIcon: tabIcon('◎'),
        }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsNavigator}
        options={{
          title: 'Apps',
          tabBarIcon: tabIcon('▤'),
        }}
      />
      <Tab.Screen
        name="Loans"
        component={LoansNavigator}
        options={{
          title: 'Loans',
          tabBarIcon: tabIcon('◇'),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreNavigator}
        options={{
          title: 'More',
          tabBarIcon: tabIcon('☰'),
        }}
      />
    </Tab.Navigator>
  );
}
