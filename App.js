import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import DashboardScreen    from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import BudgetScreen       from './src/screens/BudgetScreen';
import AnalyticsScreen    from './src/screens/AnalyticsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const ACCENT   = '#6C63FF';
const BG       = '#1E1E2E';
const CARD     = '#2D2D3F';

const TAB_ICONS = {
  Dashboard:    { active: '🏠', inactive: '🏠' },
  Transactions: { active: '📋', inactive: '📋' },
  Budget:       { active: '💰', inactive: '💰' },
  Analytics:    { active: '📊', inactive: '📊' },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
            {TAB_ICONS[route.name].active}
          </Text>
        ),
        tabBarActiveTintColor:   ACCENT,
        tabBarInactiveTintColor: '#555',
        tabBarStyle:             { backgroundColor: CARD, borderTopColor: '#3D3D55', height: 60 },
        tabBarLabelStyle:        { fontSize: 11, marginBottom: 6 },
        headerStyle:             { backgroundColor: BG, shadowColor: 'transparent', elevation: 0 },
        headerTintColor:         '#fff',
        headerTitleStyle:        { fontWeight: '700' },
      })}
    >
      <Tab.Screen name="Dashboard"    component={DashboardScreen}    options={{ title: 'Home' }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Budget"       component={BudgetScreen} />
      <Tab.Screen name="Analytics"    component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{
            headerShown:   true,
            title:         'Add Transaction',
            headerStyle:   { backgroundColor: BG },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
