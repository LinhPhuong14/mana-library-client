import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import DarkTheme from "./theme/DarkTheme";

// Auth and Navigation
import AuthNavigator from "./navigation/AuthNavigator";
import UserNavigator from "./navigation/UserNavigator";
import AdminNavigator from "./navigation/AdminNavigator";
import SplashScreen from "./screens/SplashScreen";

// Contexts
import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createStackNavigator();

// Demo mode context
const DemoModeContext = React.createContext();
export const useDemoMode = () => React.useContext(DemoModeContext);

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(true); // Set to true for offline demo
  return <DemoModeContext.Provider value={{ isDemoMode, setIsDemoMode }}>{children}</DemoModeContext.Provider>;
};

const Navigation = () => {
  const { userToken, userRole } = useAuth();
  const { isDemoMode } = useDemoMode();

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Always show Splash first */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        {/* Make auth routes always available */}
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
        />

        {/* Make admin and other routes always available in demo mode */}
        <Stack.Screen
          name="Admin"
          component={AdminNavigator}
        />

        <Stack.Screen
          name="User"
          component={UserNavigator}
        />

        {/* Original conditional rendering (not used in demo mode) */}
        {/* This code is kept for reference but won't execute in demo mode */}
        {/* 
        {!userToken ? (
          <>
            <Stack.Screen name="Auth" component={AuthNavigator} />
            <Stack.Screen name="User" component={UserNavigator} />
          </>
        ) : userRole === "admin" ? (
          <Stack.Screen name="Admin" component={AdminNavigator} />
        ) : userRole === "librarian" ? (
          <Stack.Screen name="Librarian" component={LibrarianNavigator} />
        ) : (
          <Stack.Screen name="User" component={UserNavigator} />
        )}
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <DemoModeProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </DemoModeProvider>
    </SafeAreaProvider>
  );
}
