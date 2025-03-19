import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const StaffLoginScreen = ({ navigation }) => {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Basic validation
    if (!account || !password) {
      setError("All fields are required");
      return;
    }

    // Perform login logic here
    // For demonstration purposes, let's use a simple check
    if (account === "admin" && password === "admin123") {
      navigation.navigate("Staff", { screen: "StaffDashboard" });
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Login</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.formContainer}
        >
          <View style={styles.logoContainer}>
            <Ionicons
              name="shield-checkmark"
              size={80}
              color="#4568DC"
            />
            <Text style={styles.subtitle}>Staff Login</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Ionicons
              name="person"
              size={20}
              color="#4568DC"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Account"
              placeholderTextColor="#757575"
              value={account}
              onChangeText={setAccount}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={20}
              color="#4568DC"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#757575"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#757575"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            style={styles.loginButtonContainer}
          >
            <LinearGradient
              colors={["#1E3B70", "#4568DC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButton}
            >
              <Text style={styles.loginText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        <Text style={styles.versionText}>ManaLibrary v1.0.0</Text>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#333333",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    height: 50,
  },
  eyeIcon: {
    padding: 10,
  },
  loginButtonContainer: {
    width: "100%",
    marginTop: 20,
    borderRadius: 30,
    overflow: "hidden",
  },
  loginButton: {
    paddingVertical: 15,
    alignItems: "center",
    width: "100%",
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 15,
  },
  versionText: {
    color: "#757575",
    textAlign: "center",
    fontSize: 12,
    marginTop: 20,
  },
});

export default StaffLoginScreen;
