import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Pressable, Switch } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import dataService from "../../services/demo/dataService";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPartner, setIsPartner] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!email || !password || !fullName) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Check if user with this email already exists
      const users = await dataService.getUsers();
      const existingUser = users.find((user) => user.email === email);

      if (existingUser) {
        Alert.alert("Error", "A user with this email already exists");
        setIsLoading(false);
        return;
      }

      // Create new user object
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password, // Note: In a real app, this should be hashed
        fullName,
        role: isPartner ? "partner" : "user",
        createdAt: new Date().toISOString(),
        profileImage: null,
      };

      // Add user to storage
      await dataService.addUser(newUser);

      setIsLoading(false);
      const userRole = isPartner ? "Partner" : "User";
      Alert.alert("Success", `Registration as ${userRole} successful!`, [{ text: "OK", onPress: () => navigation.replace("Login") }]);
    } catch (error) {
      console.error("Registration failed:", error);
      Alert.alert("Error", "Registration failed. Please try again.");
      setIsLoading(false);
    }
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
            <Text style={styles.subtitle}>Register</Text>
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

            <View style={styles.inputContainer}>
              <Ionicons
                name="person"
                size={24}
                color="#B06AB3"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#757575"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchLabelContainer}>
                {/* <Ionicons
                  name={isPartner ? "business" : "person"}
                  size={24}
                  color="#B06AB3"
                /> */}
                <Text style={styles.switchLabel}>Register as Partner</Text>
              </View>
              <Switch
                value={isPartner}
                onValueChange={setIsPartner}
                trackColor={{ false: "#333", true: "#4568DC" }}
                thumbColor={isPartner ? "#FFFFFF" : "#757575"}
                ios_backgroundColor="#333"
              />
            </View>

            {isPartner && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Partners can create libraries and lend books to other users. Join as a partner if you want to share your collection!</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              style={styles.registerButtonContainer}
            >
              <LinearGradient
                colors={["#4568DC", "#B06AB3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerButton}
              >
                <Text style={styles.registerButtonText}>{isLoading ? "Loading..." : `Register as ${isPartner ? "Partner" : "User"}`}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
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
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 10,
  },
  infoContainer: {
    backgroundColor: "rgba(69, 104, 220, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    color: "#B0B0B0",
    fontSize: 14,
    lineHeight: 20,
  },
  registerButtonContainer: {
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 15,
  },
  registerButton: {
    paddingVertical: 15,
    alignItems: "center",
    width: "100%",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    alignItems: "center",
    padding: 10,
  },
  backButtonText: {
    color: "#B06AB3",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
