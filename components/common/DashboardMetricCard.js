import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Surface, Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * A metric card component for the dashboard
 *
 * @param {string} title - Title of the metric
 * @param {number|string} value - Value to display
 * @param {string} icon - MaterialIcons icon name
 * @param {string} color - Primary color for the card
 * @param {Function} onPress - Function called when card is pressed
 */
const DashboardMetricCard = ({ title, value, icon, color = "#4568DC", onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.cardContainer, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Surface style={styles.card}>
        <MaterialIcons
          name={icon}
          size={28}
          color={color}
          style={styles.icon}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "48%",
    marginBottom: 16,
    borderLeftWidth: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  card: {
    padding: 16,
    backgroundColor: "white",
    elevation: 2,
    height: 100,
    justifyContent: "space-between",
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    color: "#757575",
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default DashboardMetricCard;
