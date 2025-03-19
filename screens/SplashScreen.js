import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const SplashScreen = ({ navigation }) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef(null);

  const handlePressIn = () => {
    setIsLongPressing(true);
    // Set a timer for 1 second
    longPressTimer.current = setTimeout(() => {
      // Navigate to StaffLogin screen
      navigation.navigate("Staff", { screen: "StaffLogin" });
      setIsLongPressing(false);
    }, 1000);
  };

  const handlePressOut = () => {
    // Clear the timer if press is released before timeout
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.logoContainer}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Ionicons
            name="library"
            size={120}
            color={isLongPressing ? "#9B59B6" : "#8A2BE2"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.tagline}>Knowledge is power! 📚✨</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Auth", { screen: "Register" })}
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
          onPress={() => navigation.navigate("User")}
        >
          <Text style={styles.guestText}>Browse as Guest</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>ManaLibrary v1.0.0</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  progressIndicator: {
    position: "absolute",
    bottom: -25,
    width: "100%",
    alignItems: "center",
  },
  progressText: {
    color: "#9B59B6",
    fontSize: 12,
  },
});

export default SplashScreen;
