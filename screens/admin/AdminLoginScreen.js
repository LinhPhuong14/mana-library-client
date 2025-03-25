import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../../services/demo/dataService";

const AdminLogin = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);

  // Load demo users on component mount
  useEffect(() => {
    const loadDemoUsers = async () => {
      try {
        // Initialize demo data if not already done
        await dataService.initializeDemoData();

        // Get users from AsyncStorage
        const usersJSON = await AsyncStorage.getItem(dataService.STORAGE_KEYS.USERS);
        if (usersJSON) {
          const users = JSON.parse(usersJSON);
          setDemoUsers(users);
        }
      } catch (error) {
        console.error("Failed to load demo users:", error);
      }
    };

    loadDemoUsers();
  }, []);

  const handleLogin = () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setIsLoading(true);

    // Simulate API call with timeout
    setTimeout(async () => {
      // Check against users from demo data
      const user = demoUsers.find(
        (user) =>
          user.email.toLowerCase() === email.toLowerCase() &&
          // In a real app, you would hash and compare passwords
          // For demo purposes, we'll assume the password is the first part of their email
          password === email.split("@")[0]
      );

      setIsLoading(false);

      if (user) {
        try {
          // Save logged in user to AsyncStorage
          await AsyncStorage.setItem(
            dataService.STORAGE_KEYS.CURRENT_USER,
            JSON.stringify({
              id: user.id,
              name: user.name,
              role: user.role,
            })
          );

          Alert.alert("Success", `Welcome back, ${user.name}!`, [
            {
              text: "OK",
              onPress: () => {
                // Navigate based on user role
                if (user.role === "admin") {
                  navigation.replace("SystemMetrics");
                } else if (user.role === "partner") {
                  navigation.replace("PartnerDashboard"); // Fixed typo from "ParnerDashboard"
                } else {
                  Alert.alert("Access Denied", "You don't have sufficient permissions");
                }
              },
            },
          ]);
        } catch (error) {
          console.error("Failed to save current user:", error);
          Alert.alert("Error", "Login successful but failed to set user session");
        }
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <Pressable style={styles.logoContainer}>
              <Ionicons
                name="library"
                size={80}
                color="#8A2BE2"
              />
            </Pressable>
            <Text style={styles.title}>Mana Library</Text>
            <Text style={styles.subtitle}>Partner Portal</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail"
                size={24}
                color="#B06AB3"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#757575"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed"
                size={24}
                color="#B06AB3"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#757575"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#B06AB3"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => Alert.alert("Info", "Password reset functionality would go here")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButtonContainer}
            >
              <LinearGradient
                colors={["#4568DC", "#B06AB3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>{isLoading ? "Loading..." : "Login"}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.demoCredentials}>
              <Text style={styles.demoTitle}>Demo Credentials:</Text>
              {demoUsers
                .filter((user) => user.role === "admin" || user.role === "partner")
                .map((user, index) => (
                  <Text
                    key={index}
                    style={styles.demoText}
                  >
                    {user.email} / {user.email.split("@")[0]} ({user.role})
                  </Text>
                ))}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  keyboardAvoid: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#B06AB3",
    marginBottom: 16,
  },
  formContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#FFFFFF",
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#B06AB3",
    fontSize: 14,
  },
  loginButtonContainer: {
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 15,
  },
  loginButton: {
    paddingVertical: 15,
    alignItems: "center",
    width: "100%",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  demoCredentials: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4568DC",
  },
  demoTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#B06AB3",
  },
  demoText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
  },
});

export default AdminLogin;
