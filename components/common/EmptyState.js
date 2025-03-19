import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Component to display empty states with optional action button
 *
 * @param {string} icon - MaterialIcons icon name
 * @param {string} message - Primary message to display
 * @param {string} description - Secondary descriptive text
 * @param {string} actionText - Text for action button
 * @param {Function} onAction - Function to call when action button is pressed
 */
const EmptyState = ({ icon = "sentiment-dissatisfied", message = "No items found", description = "", actionText, onAction }) => {
  return (
    <View style={styles.container}>
      <MaterialIcons
        name={icon}
        size={72}
        color="#CCCCCC"
      />
      <Text style={styles.message}>{message}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionText && onAction ? (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.button}
        >
          {actionText}
        </Button>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  message: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    marginTop: 8,
    marginBottom: 24,
    textAlign: "center",
    color: "#757575",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#4568DC",
  },
});

export default EmptyState;
