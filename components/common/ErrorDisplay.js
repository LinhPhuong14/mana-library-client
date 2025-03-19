import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, Title } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Component to display error states with retry option
 *
 * @param {string} error - Error message to display
 * @param {Function} onRetry - Function to call when retry button is pressed
 * @param {string} title - Optional title for the error display
 */
const ErrorDisplay = ({ error, onRetry, title = "Something went wrong" }) => {
  return (
    <View style={styles.container}>
      <MaterialIcons
        name="error-outline"
        size={64}
        color="#F44336"
      />
      <Title style={styles.title}>{title}</Title>
      <Text style={styles.message}>{error}</Text>
      {onRetry && (
        <Button
          mode="contained"
          onPress={onRetry}
          style={styles.button}
          icon="refresh"
        >
          Try Again
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "bold",
  },
  message: {
    marginTop: 8,
    marginBottom: 24,
    textAlign: "center",
    color: "#757575",
  },
  button: {
    paddingHorizontal: 16,
    backgroundColor: "#4568DC",
  },
});

export default ErrorDisplay;
