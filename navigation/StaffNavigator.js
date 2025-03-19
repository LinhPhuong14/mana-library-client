import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import StaffTabNavigator from "./StaffTabNavigator";
import StaffLoginScreen from "../screens/staff/StaffLoginScreen";
// import BookDetailScreen from "../screens/staff/BookDetailScreen";
import UserDetailScreen from "../screens/staff/UserDetailScreen";
import AddEditBookScreen from "../screens/staff/AddEditBookScreen";
import BarcodeScanScreen from "../screens/staff/BarcodeScanScreen";
import ReservationDetailScreen from "../screens/staff/ReservationDetailScreen";
import ServerConfigScreen from "../screens/staff/ServerConfigScreen";

const StaffStack = createStackNavigator();

const StaffNavigator = () => {
  return (
    <StaffStack.Navigator screenOptions={{ headerShown: false }}>
      <StaffStack.Screen
        name="StaffLogin"
        component={StaffLoginScreen}
      />
      <StaffStack.Screen
        name="StaffTabs"
        component={StaffTabNavigator}
      />
      {/* <StaffStack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ headerShown: true }}
      /> */}
      <StaffStack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{ headerShown: true }}
      />
      <StaffStack.Screen
        name="AddEditBook"
        component={AddEditBookScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.editing ? "Edit Book" : "Add Book",
        })}
      />
      <StaffStack.Screen
        name="BarcodeScanner"
        component={BarcodeScanScreen}
        options={{ headerShown: true, title: "Scan Book" }}
      />
      <StaffStack.Screen
        name="ReservationDetail"
        component={ReservationDetailScreen}
        options={{ headerShown: true, title: "Reservation Details" }}
      />
      <StaffStack.Screen
        name="ServerConfig"
        component={ServerConfigScreen}
        options={{ headerShown: true, title: "Server Configuration" }}
      />
    </StaffStack.Navigator>
  );
};

export default StaffNavigator;
