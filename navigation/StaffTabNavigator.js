import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import DashboardScreen from "../screens/staff/DashboardScreen";
import BooksScreen from "../screens/staff/BooksScreen";
import UsersScreen from "../screens/staff/UsersScreen";
import CirculationScreen from "../screens/staff/CirculationScreen";
import ReportsScreen from "../screens/staff/ReportsScreen";
import SettingsScreen from "../screens/staff/SettingsScreen";

// Create navigators
const Tab = createBottomTabNavigator();
const StaffTabNavigator = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Dashboard":
              iconName = "dashboard";
              break;
            case "Books":
              iconName = "library-books";
              break;
            case "Users":
              iconName = "people";
              break;
            case "Circulation":
              iconName = "swap-horiz";
              break;
            case "Reports":
              iconName = "analytics";
              break;
            case "Settings":
              iconName = "settings";
              break;
            default:
              iconName = "help";
          }

          return (
            <MaterialIcons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#4568DC",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
      />
      <Tab.Screen
        name="Books"
        component={BooksScreen}
      />
      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{ title: isAdmin ? "Users" : "Members" }}
      />
      <Tab.Screen
        name="Circulation"
        component={CirculationScreen}
      />
      {isAdmin ? (
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
        />
      ) : (
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
        />
      )}
    </Tab.Navigator>
  );
};

export default StaffTabNavigator;
