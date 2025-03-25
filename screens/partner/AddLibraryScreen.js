"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import storageService from "../../services/demo/dataService"

const AddLibraryScreen = ({ navigation }) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [contact, setContact] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!name.trim()) newErrors.name = "Library name is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!location.trim()) newErrors.location = "Location is required"
    if (!contact.trim()) newErrors.contact = "Contact information is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateLibrary = async () => {
    if (!validateForm()) return

    try {
      const currentUser = await AsyncStorage.getItem(storageService.STORAGE_KEYS.CURRENT_USER)
      const userId = currentUser ? JSON.parse(currentUser).id : "user1" // Default for demo

      const newLibrary = {
        id: Date.now().toString(), // Generate a temporary ID
        name,
        description,
        location,
        contact,
        isPublic,
        owner: userId,
        createdAt: new Date().toISOString(),
      }

      await storageService.addLibrary(newLibrary)
      navigation.navigate("ManageLibrary", { libraryId: newLibrary.id })
    } catch (error) {
      console.error("Failed to create library:", error)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Library</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#4568DC", "#B06AB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <Text style={styles.bannerTitle}>Create Your Library</Text>
          <Text style={styles.bannerSubtitle}>Share your book collection with others</Text>
        </LinearGradient>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Library Name*</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. My Science Fiction Collection"
              placeholderTextColor="#757575"
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
              placeholderTextColor="#757575"
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
              placeholderTextColor="#757575"
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
              placeholderTextColor="#757575"
            />
            {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Public Library</Text>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: "#1E1E1E", true: "#4568DC" }}
                thumbColor={isPublic ? "#FFFFFF" : "#757575"}
                ios_backgroundColor="#1E1E1E"
              />
            </View>
            <Text style={styles.helperText}>
              {isPublic
                ? "Your library will be visible to all users"
                : "Your library will only be accessible via direct link or QR code"}
            </Text>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleCreateLibrary}>
            <LinearGradient
              colors={["#4568DC", "#B06AB3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.createButtonText}>Create Library</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  banner: {
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "#E0E0E0",
    marginTop: 8,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333333",
    padding: 12,
    fontSize: 16,
    color: "#FFFFFF",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 4,
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helperText: {
    color: "#B0B0B0",
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    borderRadius: 8,
    marginTop: 20,
    overflow: "hidden",
  },
  gradientButton: {
    padding: 16,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default AddLibraryScreen

