import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { safeScreen, importScreen } from "../utils/screenUtils";
import AdminLogin from "../screens/admin/AdminLoginScreen";
import SystemMetricsScreen from "../screens/admin/SystemMetricScreen";
import ManageBooksScreen from "../screens/admin/ManageBooksScreen";
import AddBookManualScreen from "../screens/admin/AddBookManualScreen";
import AddBookScanScreen from "../screens/admin/AddBookScanScreen";
import ServerConfigScreen from "../screens/admin/ServerConfigScreen";
import ManageUsersScreen from "../screens/admin/ManageUsersScreen";
import UserDetailScreen from "../screens/admin/UserDetailScreen";

const AdminStack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <AdminStack.Navigator initialRouteName="AdminLogin">
      <AdminStack.Screen
        name="AdminLogin"
        component={AdminLogin}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="SystemMetrics"
        component={SystemMetricsScreen}
        // options={{ title: "Dashboard" }}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="ManageBooks"
        component={ManageBooksScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="AddBookManual"
        component={AddBookManualScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="AddBookScan"
        component={AddBookScanScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="ManageUsers"
        component={ManageUsersScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="ServerConfig"
        component={ServerConfigScreen}
        options={{ headerShown: false }}
      />
    </AdminStack.Navigator>
  );
};

export default AdminNavigator;
