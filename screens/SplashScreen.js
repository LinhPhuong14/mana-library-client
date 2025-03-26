import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../services/demo/dataService";

const SplashScreen = ({ navigation }) => {
  const [isLogoPressed, setIsLogoPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef(null);

  const handleLogoPress = () => {
    setIsLogoPressed(true);

    timerRef.current = setTimeout(() => {
      // Use a more direct navigation approach
      navigation.reset({
        index: 0,
        routes: [{ name: "Admin" }],
      });
      setIsLogoPressed(false);
    }, 3000);
  };

  const handleLogoRelease = () => {
    clearTimeout(timerRef.current);
    setIsLogoPressed(false);
  };

  const handleGuestAccess = async () => {
    try {
      setIsLoading(true);
      // Clear only current user data for a clean guest experience
      await AsyncStorage.removeItem(dataService.STORAGE_KEYS.CURRENT_USER);
      // Navigate to User route
      navigation.navigate("User");
    } catch (error) {
      console.error("Error clearing user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <Pressable
        style={[styles.logoContainer, isLogoPressed && styles.logoPressed]}
        onPressIn={handleLogoPress}
        onPressOut={handleLogoRelease}
      >
        <Ionicons
          name="library"
          size={120}
          color={isLogoPressed ? "#9D50BB" : "#8A2BE2"}
        />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.tagline}>Knowledge is power! 📚✨</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Auth", { screen: "Login" })}
          style={styles.getStartedButtonContainer}
        >
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.getStartedButton}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleGuestAccess}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#B06AB3"
            />
          ) : (
            <Text style={styles.guestText}>Browse as Guest</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>ManaLibrary v1.0.0</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ...existing styles remain unchanged
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  logoContainer: {
    marginTop: 200,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 60,
  },
  logoPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  content: {
    alignItems: "center",
  },
  tagline: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 20,
    fontWeight: "500",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  getStartedButtonContainer: {
    width: "80%",
    marginBottom: 20,
    borderRadius: 30,
    overflow: "hidden",
  },
  getStartedButton: {
    paddingVertical: 15,
    paddingHorizontal: 50,
    alignItems: "center",
    width: "100%",
  },
  getStartedText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  guestButton: {
    paddingVertical: 10,
    minWidth: 100,
    alignItems: "center",
  },
  guestText: {
    color: "#B06AB3",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  versionText: {
    color: "#757575",
    marginBottom: 10,
    fontSize: 12,
  },
});

export default SplashScreen;
