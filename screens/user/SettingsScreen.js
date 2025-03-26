import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import dataService from "../../services/demo/dataService";

const SettingsScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status when component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);
        setIsLoggedIn(userData !== null);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      // Show confirmation dialog
      Alert.alert("Logout", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            // Clear user data from AsyncStorage
            await AsyncStorage.removeItem(dataService.STORAGE_KEYS.CURRENT_USER);
            setIsLoggedIn(false);

            // Navigate to the Auth stack, Login screen
            navigation.reset({
              index: 0,
              routes: [{ name: "Auth", params: { screen: "Login" } }],
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Settings</Text>

        <Text style={styles.infoText}>Some features are still under development and will be available soon.</Text>

        {/* App Settings */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons
                name="moon-outline"
                size={22}
                color="#B06AB3"
                style={styles.settingIcon}
              />
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.comingSoonTag}>Coming Soon</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#767577", true: "#4568DC" }}
              thumbColor={darkMode ? "#B06AB3" : "#f4f3f4"}
              disabled={true}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#B06AB3"
                style={styles.settingIcon}
              />
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.comingSoonTag}>Coming Soon</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#4568DC" }}
              thumbColor={notifications ? "#B06AB3" : "#f4f3f4"}
              disabled={true}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons
                name="language-outline"
                size={22}
                color="#B06AB3"
                style={styles.settingIcon}
              />
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.comingSoonTag}>Coming Soon</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#515151"
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>

          {isLoggedIn && (
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <View style={styles.settingLabelContainer}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#B06AB3"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>Edit Profile</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color="#757575"
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => Alert.alert("Help & Support", "This feature will be available soon!")}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons
                name="help-circle-outline"
                size={22}
                color="#B06AB3"
                style={styles.settingIcon}
              />
              <Text style={styles.settingLabel}>Help & Support</Text>
              <Text style={styles.comingSoonTag}>Coming Soon</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#515151"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => Alert.alert("About", "Mana Library v1.0\n© 2025 Mana Library Team")}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#B06AB3"
                style={styles.settingIcon}
              />
              <Text style={styles.settingLabel}>About</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#757575"
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button - Only show if logged in */}
        {isLoggedIn && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  infoText: {
    color: "#AAAAAA",
    fontSize: 14,
    marginBottom: 20,
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  settingButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  comingSoonTag: {
    fontSize: 12,
    color: "#B06AB3",
    marginLeft: 8,
    fontStyle: "italic",
  },
  logoutButton: {
    backgroundColor: "#e63946",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default SettingsScreen;
