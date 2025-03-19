import React, { useState } from "react";
import { View, Platform, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import DateTimePickerNative from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * A cross-platform DateTimePicker component
 *
 * @param {Date} value - The selected date/time value
 * @param {Function} onChange - Function called when date/time changes
 * @param {string} mode - The picker mode ('date' or 'time')
 * @param {Date} maximumDate - Maximum selectable date
 * @param {Date} minimumDate - Minimum selectable date
 * @param {string} label - Optional label text
 */
const DateTimePicker = ({ value, onChange, mode = "date", maximumDate, minimumDate, label }) => {
  const [show, setShow] = useState(Platform.OS === "ios");

  const handleChange = (event, selectedDate) => {
    setShow(Platform.OS === "ios");
    if (selectedDate && event.type !== "dismissed") {
      onChange(selectedDate);
    }
  };

  const formatDisplayValue = () => {
    if (!value) return "Select date";

    if (mode === "date") {
      return value.toLocaleDateString();
    } else if (mode === "time") {
      return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return value.toLocaleString();
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {Platform.OS === "android" && (
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShow(true)}
        >
          <Text style={styles.inputText}>{formatDisplayValue()}</Text>
          <MaterialIcons
            name={mode === "date" ? "event" : "access-time"}
            size={24}
            color="#4568DC"
          />
        </TouchableOpacity>
      )}

      {(show || Platform.OS === "ios") && (
        <DateTimePickerNative
          value={value || new Date()}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          style={styles.picker}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#F5F5F5",
  },
  inputText: {
    fontSize: 16,
    color: "#333333",
  },
  picker: {
    width: "100%",
  },
});

export default DateTimePicker;
