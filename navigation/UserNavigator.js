import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "./TabNavigator";
import { safeScreen, importScreen } from "../utils/screenUtils";

const UserStack = createStackNavigator();

// Use placeholders for screens that can't be resolved
const BookDetailScreen = importScreen("../screens/user/BookDetailScreen", "Book Details");
const NotificationsScreen = importScreen("../screens/user/NotificationsScreen", "Notifications");
const SearchResultsScreen = importScreen("../screens/user/SearchResultsScreen", "Search Results");
const EditProfileScreen = importScreen("../screens/user/EditProfileScreen", "Edit Profile");

const UserNavigator = () => {
  return (
    <UserStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tab navigator as the primary interface */}
      <UserStack.Screen
        name="MainTabs"
        component={TabNavigator}
      />

      {/* Screens that can be accessed from multiple tabs or deep links */}
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
        component={safeScreen(EditProfileScreen, "Edit Profile")}
        options={{ headerShown: true, title: "Edit Profile" }}
      />
    </UserStack.Navigator>
  );
};

export default UserNavigator;
