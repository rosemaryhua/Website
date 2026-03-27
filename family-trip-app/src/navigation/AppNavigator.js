import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import ItineraryScreen from '../screens/ItineraryScreen';
import ManualEntryScreen from '../screens/ManualEntryScreen';
import MapScreen from '../screens/MapScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SharedNotesScreen from '../screens/SharedNotesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ItineraryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ItineraryList"
        component={ItineraryScreen}
        options={{ title: 'Itineraries' }}
      />
      <Stack.Screen
        name="ManualEntry"
        component={ManualEntryScreen}
        options={{ title: 'Add Events' }}
      />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  Itinerary: { focused: 'list', unfocused: 'list-outline' },
  Map: { focused: 'map', unfocused: 'map-outline' },
  Calendar: { focused: 'calendar', unfocused: 'calendar-outline' },
  Notes: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.focused : icons.unfocused;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4A90D9',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#eee',
            paddingBottom: 4,
            height: 56,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Itinerary"
          component={ItineraryStack}
          options={{ tabBarLabel: 'Trips' }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{ tabBarLabel: 'Calendar', headerShown: true, title: 'Calendar' }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{ tabBarLabel: 'Map', headerShown: true, title: 'Map' }}
        />
        <Tab.Screen
          name="Notes"
          component={SharedNotesScreen}
          options={{ tabBarLabel: 'Chat', headerShown: true, title: 'Group Chat' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
