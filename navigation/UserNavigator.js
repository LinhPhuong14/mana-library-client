import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { safeScreen, importScreen } from "../utils/screenUtils";
import BookDetailScreen from "../screens/user/BookDetailScreen";
import EditProfileScreen from "../screens/user/EditProfileScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import HomeScreen from "../screens/user/HomeScreen";
import BooksListScreen from "../screens/user/BookListScreen";
import HistoryScreen from "../screens/user/HistoryScreen";
import SettingsScreen from "../screens/user/SettingsScreen";
import DiscoveryScreen from "../screens/user/DiscoveryScreen";
import ChatScreen from "../screens/user/ChatScreen";
import LibraryDetailScreen from "../screens/user/LibraryDetail";

const UserStack = createStackNavigator();

// Use placeholders for screens that can't be resolved
const NotificationsScreen = importScreen("../screens/user/NotificationsScreen", "Notifications");
const SearchResultsScreen = importScreen("../screens/user/SearchResultsScreen", "Search Results");

const UserNavigator = () => {
  return (
    <UserStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main entry screen (former Discovery tab) */}
      <UserStack.Screen
        name="Discovery"
        component={DiscoveryScreen}
      />

      {/* Former tab screens */}
      <UserStack.Screen
        name="BooksList"
        component={BooksListScreen}
      />

      <UserStack.Screen
        name="Profile"
        component={ProfileScreen}
      />

      <UserStack.Screen
        name="Chat"
        component={ChatScreen}
      />

      <UserStack.Screen
        name="Settings"
        component={SettingsScreen}
      />

      <UserStack.Screen
        name="History"
        component={HistoryScreen}
      />

      {/* Screens that were accessed from tabs or deep links */}
      <UserStack.Screen
        name="Notifications"
        component={safeScreen(NotificationsScreen, "Notifications")}
        options={{ headerShown: true, title: "Notifications" }}
      />

      <UserStack.Screen
        name="SearchResults"
        component={safeScreen(SearchResultsScreen, "Search Results")}
        options={{ headerShown: true, title: "Search Results" }}
      />

      <UserStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false, title: "Edit Profile" }}
      />

      <UserStack.Screen
        name="LibraryDetails"
        component={LibraryDetailScreen}
        options={{ title: "Library Details" }}
      />

      <UserStack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ headerShown: false }}
      />
    </UserStack.Navigator>
  );
};

export default UserNavigator;
