import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import storageService from "../../services/demo/dataService";

const AddLibraryScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Library name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!location.trim()) newErrors.location = "Location is required";
    if (!contact.trim()) newErrors.contact = "Contact information is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateLibrary = async () => {
    if (!validateForm()) return;

    try {
      const currentUser = await AsyncStorage.getItem(storageService.STORAGE_KEYS.CURRENT_USER);
      const userId = currentUser ? JSON.parse(currentUser).id : "user1"; // Default for demo

      const newLibrary = {
        name,
        description,
        location,
        contact,
        isPublic,
        owner: userId,
        createdAt: new Date().toISOString(),
      };

      await storageService.addLibrary(newLibrary);
      navigation.navigate("ManageLibrary", { libraryId: newLibrary.id });
    } catch (error) {
      console.error("Failed to create library:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Your Library</Text>
        <Text style={styles.subtitle}>Share your book collection with others</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Library Name*</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. My Science Fiction Collection"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description*</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell others about your library..."
            multiline
            numberOfLines={4}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location*</Text>
          <TextInput
            style={[styles.input, errors.location && styles.inputError]}
            value={location}
            onChangeText={setLocation}
            placeholder="Address or location description"
          />
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Contact Information*</Text>
          <TextInput
            style={[styles.input, errors.contact && styles.inputError]}
            value={contact}
            onChangeText={setContact}
            placeholder="Email, phone, or social media"
          />
          {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Public Library</Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: "#ccc", true: "#4a6fa5" }}
              thumbColor={isPublic ? "#fff" : "#f4f3f4"}
            />
          </View>
          <Text style={styles.helperText}>{isPublic ? "Your library will be visible to all users" : "Your library will only be accessible via direct link or QR code"}</Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateLibrary}
        >
          <Text style={styles.createButtonText}>Create Library</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#4a6fa5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#e0e0e0",
    marginTop: 8,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  errorText: {
    color: "#e74c3c",
    marginTop: 4,
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helperText: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    backgroundColor: "#4a6fa5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AddLibraryScreen;
