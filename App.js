import React from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import DarkTheme from "./theme/DarkTheme";

// Auth and Navigation
import AuthNavigator from "./navigation/AuthNavigator";
import UserNavigator from "./navigation/UserNavigator";
import StaffNavigator from "./navigation/StaffNavigator";
import SplashScreen from "./screens/SplashScreen";

// Contexts
import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createStackNavigator();

const Navigation = () => {
  const { userToken, userRole } = useAuth();

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userToken ? (
          <>
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
            />
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
            />
            <Stack.Screen
              name="Staff"
              component={StaffNavigator}
              options={{ headerShown: false }}
            />
          </>
        ) : userRole === "admin" || userRole === "librarian" ? (
          <Stack.Screen
            name="Staff"
            component={StaffNavigator}
          />
        ) : (
          <Stack.Screen
            name="User"
            component={UserNavigator}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
