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
import ManageLoansScreen from "../screens/admin/ManageLoanScreen";
import ManageLibraryScreen from "../screens/partner/ManageLibraryScreen";
import AddLibraryScreen from "../screens/partner/AddLibraryScreen";
import StorageManagerScreen from "../screens/admin/StorageManagerScreen";
import PartnerDashboardScreen from "../screens/partner/PartnerDashboardScreen";
import PartnerProfileScreen from "../screens/partner/ProfileScreen";
import ViewBorrowerScreen from "../screens/partner/ViewBorrowerScreen";
import TransactionHistoryScreen from "../screens/partner/TransactionHistoryScreen";
import BookDetailScreen from "../screens/partner/BookDetailScreen";
import EditProfileScreen from "../screens/partner/EditProfileScreen";

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
      <AdminStack.Screen
        name="ManageLoans"
        component={ManageLoansScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="StorageManager"
        component={StorageManagerScreen}
        options={{ headerShown: false }}
      />

      {/* Partner screens
        - PartnerDashboard
        - AddLibrary
        - ManageLibrary
        - Profile
        - ViewBorrower
        - BookDetail
        - TransactionHistory

      
      */}
      <AdminStack.Screen
        name="PartnerDashboard"
        component={PartnerDashboardScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="AddLibrary"
        component={AddLibraryScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="ManageLibrary"
        component={ManageLibraryScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="Profile"
        component={PartnerProfileScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="ViewBorrower"
        component={ViewBorrowerScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{ headerShown: false }}
      />
    </AdminStack.Navigator>
  );
};

export default AdminNavigator;
