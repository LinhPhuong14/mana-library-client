import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import DarkTheme from "../theme/DarkTheme";
import { navigationRef } from "../utils/navigationUtils";

// Import all navigators
import AuthNavigator from "./AuthNavigator";
import UserNavigator from "./UserNavigator";
import AdminNavigator from "./AdminNavigator";
import SplashScreen from "../screens/SplashScreen";

// Create the root stack
const RootStack = createStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={DarkTheme}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* Always show Splash first */}
        <RootStack.Screen
          name="Splash"
          component={SplashScreen}
        />

        {/* Auth Navigator */}
        <RootStack.Screen
          name="Auth"
          component={AuthNavigator}
        />

        {/* User Navigator */}
        <RootStack.Screen
          name="User"
          component={UserNavigator}
        />

        {/* Admin Navigator */}
        <RootStack.Screen
          name="Admin"
          component={AdminNavigator}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
