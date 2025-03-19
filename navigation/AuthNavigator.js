import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { safeScreen, importScreen } from "../utils/screenUtils";

const AuthStack = createStackNavigator();
// Use placeholders for screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import VerifyCodeScreen from "../screens/auth/VerifyCodeScreen";
import ChatScreen from "../screens/auth/ChatScreen";
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: true }}>
      <AuthStack.Screen
        name="Login"
        component={safeScreen(LoginScreen, "Login")}
      />
      <AuthStack.Screen
        name="Register"
        component={safeScreen(RegisterScreen, "Register")}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={safeScreen(ForgotPasswordScreen, "ForgotPassword")}
      />
      <AuthStack.Screen
        name="VerifyCode"
        component={safeScreen(VerifyCodeScreen, "VerifyCode")}
      />
      <AuthStack.Screen
        name="Chat"
        component={safeScreen(ChatScreen, "Chat")}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
