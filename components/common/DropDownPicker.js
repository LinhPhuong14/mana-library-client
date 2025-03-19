import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Surface, List, IconButton, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * A dropdown picker component
 *
 * @param {Array} items - Array of items to display in the dropdown
 * @param {Object} selectedItem - Currently selected item
 * @param {Function} onSelectItem - Function called when item is selected
 * @param {string} placeholder - Placeholder text when no item is selected
 * @param {string} label - Optional label text
 * @param {Object} style - Additional styles for the component
 */
const DropDownPicker = ({ items = [], selectedItem, onSelectItem, placeholder = "Select an item", label, style = {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectItem = (item) => {
    onSelectItem(item);
    setIsOpen(false);
  };

  const displayValue = selectedItem?.label || placeholder;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleDropdown}
        style={styles.dropdownButton}
      >
        <Text style={selectedItem ? styles.selectedText : styles.placeholderText}>{displayValue}</Text>
        <MaterialIcons
          name={isOpen ? "arrow-drop-up" : "arrow-drop-down"}
          size={24}
          color="#4568DC"
        />
      </TouchableOpacity>

      {isOpen && (
        <Surface style={styles.dropdownContainer}>
          <ScrollView
            style={styles.dropdown}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {items.length > 0 ? (
              items.map((item, index) => (
                <React.Fragment key={item.value || index}>
                  <List.Item
                    title={item.label}
                    onPress={() => handleSelectItem(item)}
                    style={[styles.dropdownItem, selectedItem?.value === item.value && styles.selectedItem]}
                    titleStyle={[styles.dropdownItemText, selectedItem?.value === item.value && styles.selectedItemText]}
                    left={
                      selectedItem?.value === item.value
                        ? (props) => (
                            <List.Icon
                              {...props}
                              icon="check"
                              color="#4568DC"
                            />
                          )
                        : null
                    }
                  />
                  {index < items.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <List.Item
                title="No items available"
                titleStyle={styles.emptyText}
              />
            )}
          </ScrollView>
        </Surface>
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
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#FFFFFF",
    height: 48,
  },
  selectedText: {
    fontSize: 16,
    color: "#333333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999999",
  },
  dropdownContainer: {
    position: "absolute",
    top: 72, // height of button + label
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    elevation: 3,
    zIndex: 1000,
    maxHeight: 200,
  },
  dropdown: {
    width: "100%",
  },
  dropdownItem: {
    paddingVertical: 10,
  },
  selectedItem: {
    backgroundColor: "rgba(69, 104, 220, 0.1)",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333333",
  },
  selectedItemText: {
    color: "#4568DC",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#999999",
    textAlign: "center",
    fontSize: 14,
  },
});

export default DropDownPicker;
