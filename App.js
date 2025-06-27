import { API_URL } from '@env';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar } from 'react-native';

import CreateDeliveryScreen from './screens/CreateDeliveryScreen';
import Dashboard from './screens/Dashboard';
import HistoryScreen from './screens/HistoryScreen';
import LoginScreen from './screens/LoginScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import StockScreen from './screens/StockScreen';
import UpdateDeliveryScreen from './screens/UpdateDeliveryScreen';

const Stack = createNativeStackNavigator();

console.log("🔗 Backend :", API_URL);

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#4c669f" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
          <Stack.Screen name="Stock" component={StockScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UpdateDelivery" component={UpdateDeliveryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreateDelivery" component={CreateDeliveryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
