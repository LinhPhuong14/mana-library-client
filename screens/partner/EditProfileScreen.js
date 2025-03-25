import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../../services/demo/dataService";

const EditProfileScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [partner, setPartner] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    memberSince: "",
    // We don't allow editing these fields, but we'll keep them
    libraries: 0,
    totalBooks: 0,
    activeBorrowings: 0,
    pendingPayments: 0,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    try {
      setIsLoading(true);

      // Get current user from AsyncStorage
      const userData = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);

      if (!userData) {
        Alert.alert("Error", "No user data found. Please log in again.");
        navigation.reset({
          index: 0,
          routes: [{ name: "AdminLogin" }],
        });
        return;
      }

      const currentUser = JSON.parse(userData);

      // Get all users to find the complete user data
      const allUsers = await dataService.getUsers();
      const userDetails = allUsers.find((user) => user.id === currentUser.id);

      if (userDetails) {
        setPartner(userDetails);
      } else {
        Alert.alert("Error", "User details not found");
      }
    } catch (error) {
      console.error("Failed to load partner data:", error);
      Alert.alert("Error", "Failed to load your profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!partner.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!partner.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(partner.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!partner.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      // Update the user in storage
      const users = await dataService.getUsers();
      const updatedUsers = users.map((user) => (user.id === partner.id ? partner : user));

      await AsyncStorage.setItem(dataService.STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

      // Also update the current user in storage
      await AsyncStorage.setItem(
        dataService.STORAGE_KEYS.CURRENT_USER,
        JSON.stringify({
          id: partner.id,
          name: partner.name,
          role: partner.role,
        })
      );

      Alert.alert("Success", "Profile updated successfully", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather
            name="arrow-left"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["#4568DC", "#B06AB3"]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {partner.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#B06AB3"
                />
                <TextInput
                  style={styles.input}
                  value={partner.name}
                  onChangeText={(text) => setPartner({ ...partner, name: text })}
                  placeholder="Enter your full name"
                  placeholderTextColor="#757575"
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#B06AB3"
                />
                <TextInput
                  style={styles.input}
                  value={partner.email}
                  onChangeText={(text) => setPartner({ ...partner, email: text })}
                  placeholder="Enter your email"
                  placeholderTextColor="#757575"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#B06AB3"
                />
                <TextInput
                  style={styles.input}
                  value={partner.phone}
                  onChangeText={(text) => setPartner({ ...partner, phone: text })}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#757575"
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Member Since</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#B06AB3"
                />
                <TextInput
                  style={[styles.input, { color: "#757575" }]}
                  value={partner.memberSince ? new Date(partner.memberSince).toLocaleDateString() : ""}
                  editable={false}
                />
              </View>
              <Text style={styles.helperText}>Member since date cannot be changed</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={isSaving}
          >
            <LinearGradient
              colors={["#4568DC", "#B06AB3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 16,
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
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  formCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#FFFFFF",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: "#757575",
    fontSize: 14,
    marginTop: 4,
    fontStyle: "italic",
  },
  saveButton: {
    borderRadius: 30,
    overflow: "hidden",
  },
  saveGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditProfileScreen;
