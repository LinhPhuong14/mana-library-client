import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../../services/demo/dataService";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);

  // Load demo users on component mount and clear current user
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Clear the current user data when loading the login screen
        await AsyncStorage.removeItem(dataService.STORAGE_KEYS.CURRENT_USER);

        // Initialize demo data if not already done
        await dataService.initializeDemoData();

        // Get users from AsyncStorage, filter to only regular users (not admins)
        const users = await dataService.getUsers();
        const regularUsers = users.filter((user) => user.role === "user" || user.role === "partner");
        setDemoUsers(regularUsers);
      } catch (error) {
        console.error("Failed to initialize login screen:", error);
      }
    };

    initializeScreen();
  }, []);

  // Load demo users on component mount
  useEffect(() => {
    const loadDemoUsers = async () => {
      try {
        // Initialize demo data if not already done
        await dataService.initializeDemoData();

        // Get users from AsyncStorage, filter to only regular users (not admins)
        const users = await dataService.getUsers();
        const regularUsers = users.filter((user) => user.role === "user" || user.role === "partner");
        setDemoUsers(regularUsers);
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
      try {
        // Get all users to check credentials
        const allUsers = await dataService.getUsers();
        const user = allUsers.find(
          (user) =>
            user.email.toLowerCase() === email.toLowerCase() &&
            // In a real app, you would hash and compare passwords
            // For demo purposes, we're using the part before @ in the email as password
            password === email.split("@")[0]
        );

        setIsLoading(false);

        if (!user) {
          Alert.alert("Error", "Invalid credentials");
          return;
        }

        // If admin tries to log in here, redirect to admin login
        if (user.role === "admin") {
          Alert.alert("Admin Account", "Please use the Admin Login section to access administrator features.", [
            {
              text: "OK",
              onPress: () => {
                // Optionally navigate to admin login
                // navigation.navigate("AdminLogin");
              },
            },
          ]);
          return;
        }

        // Save logged in user to AsyncStorage
        await AsyncStorage.setItem(
          dataService.STORAGE_KEYS.CURRENT_USER,
          JSON.stringify({
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email,
          })
        );

        Alert.alert("Success", `Welcome back, ${user.name}!`, [
          {
            text: "OK",
            onPress: () => {
              // Navigate to appropriate screen for user or partner
              navigation.replace("User", { screen: "Home" });
            },
          },
        ]);
      } catch (error) {
        setIsLoading(false);
        console.error("Login error:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
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
            <Text style={styles.subtitle}>Login</Text>
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
                keyboardType="email-address"
                autoCapitalize="none"
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
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Forgot Password and Sign Up buttons in a row */}
            <View style={styles.forgotSignUpContainer}>
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Demo Credentials Section - only show non-admin users */}
            <View style={styles.demoCredentials}>
              <Text style={styles.demoTitle}>Demo Credentials:</Text>
              {demoUsers.slice(0, 3).map((user, index) => (
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
  forgotSignUpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  forgotPassword: {
    marginRight: 10,
  },
  forgotPasswordText: {
    color: "#B06AB3",
    fontSize: 14,
  },
  signUpButton: {
    paddingHorizontal: 10,
  },
  signUpButtonText: {
    color: "#6970e4",
    fontSize: 14,
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

export default LoginScreen;
