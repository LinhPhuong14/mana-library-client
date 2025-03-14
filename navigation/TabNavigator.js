import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";

// Import user screens
import HomeScreen from "../screens/user/HomeScreen";
import BooksListScreen from "../screens/user/BooksListScreen";
import BookDetailScreen from "../screens/user/BookDetailScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import HistoryScreen from "../screens/user/HistoryScreen";
import SettingsScreen from "../screens/user/SettingsScreen";

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const BooksStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const HistoryStack = createStackNavigator();
const SettingsStack = createStackNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
  </HomeStack.Navigator>
);

const BooksStackScreen = () => (
  <BooksStack.Navigator>
    <BooksStack.Screen
      name="BooksList"
      component={BooksListScreen}
      options={{ title: "Books" }}
    />
    <BooksStack.Screen
      name="BookDetail"
      component={BookDetailScreen}
      options={{ title: "Book Details" }}
    />
  </BooksStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
  </ProfileStack.Navigator>
);

const HistoryStackScreen = () => (
  <HistoryStack.Navigator>
    <HistoryStack.Screen
      name="History"
      component={HistoryScreen}
      options={{ headerShown: false }}
    />
  </HistoryStack.Navigator>
);

const SettingsStackScreen = () => (
  <SettingsStack.Navigator>
    <SettingsStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ headerShown: false }}
    />
  </SettingsStack.Navigator>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = "home";
          } else if (route.name === "BooksTab") {
            iconName = "library-books";
          } else if (route.name === "ProfileTab") {
            iconName = "person";
          } else if (route.name === "HistoryTab") {
            iconName = "history";
          } else if (route.name === "SettingsTab") {
            iconName = "settings";
          }

          return (
            <MaterialIcons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#2c3e50",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="BooksTab"
        component={BooksStackScreen}
        options={{ tabBarLabel: "Books" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{ tabBarLabel: "Profile" }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStackScreen}
        options={{ tabBarLabel: "History" }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackScreen}
        options={{ tabBarLabel: "Settings" }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
