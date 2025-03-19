import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, Modal, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
// Removed: import { Picker } from "@react-native-picker/picker";

// Book categories
const CATEGORIES = ["Fiction", "Non-Fiction", "Technology", "Science", "History", "Biography", "Self-Help", "Business", "Finance", "Memoir", "Other"];

const AddBookManualScreen = ({ navigation, route }) => {
  // Check if editing an existing book
  const isEditing = route.params?.isEditing || false;
  const existingBook = route.params?.book || {};

  const [bookData, setBookData] = useState({
    title: isEditing ? existingBook.title : "",
    author: isEditing ? existingBook.author : "",
    isbn: isEditing ? existingBook.isbn : "",
    category: isEditing ? existingBook.category : "Fiction",
    copies: isEditing ? existingBook.copies.toString() : "1",
    description: isEditing ? existingBook.description || "" : "",
    publisher: isEditing ? existingBook.publisher || "" : "",
    publishedYear: isEditing ? existingBook.publishedYear || "" : "",
    language: isEditing ? existingBook.language || "English" : "English",
    pages: isEditing ? existingBook.pages?.toString() || "" : "",
    coverImage: isEditing ? existingBook.coverImage || null : null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [pickerVisible, setPickerVisible] = useState(false);

  // Handle cover image selection
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant camera roll permissions to upload a cover image");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setBookData({ ...bookData, coverImage: result.assets[0].uri });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!bookData.title.trim()) newErrors.title = "Title is required";
    if (!bookData.author.trim()) newErrors.author = "Author is required";

    if (!bookData.isbn.trim()) {
      newErrors.isbn = "ISBN is required";
    } else if (!/^[0-9-]{10,17}$/.test(bookData.isbn.trim())) {
      newErrors.isbn = "Enter a valid ISBN (10 or 13 digits)";
    }

    if (!bookData.copies.trim()) {
      newErrors.copies = "Number of copies is required";
    } else if (isNaN(bookData.copies) || parseInt(bookData.copies) < 1) {
      newErrors.copies = "Enter a valid number of copies";
    }

    if (bookData.publishedYear) {
      const year = parseInt(bookData.publishedYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1000 || year > currentYear) {
        newErrors.publishedYear = `Enter a valid year between 1000 and ${currentYear}`;
      }
    }

    if (bookData.pages && (isNaN(bookData.pages) || parseInt(bookData.pages) < 1)) {
      newErrors.pages = "Enter a valid number of pages";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", isEditing ? "Book updated successfully" : "Book added successfully", [{ text: "OK", onPress: () => navigation.goBack() }]);
    }, 1500);
  };

  // Render category item
  const renderCategoryItem = ({ item }) => {
    return (
      <Pressable
        style={({ pressed }) => [styles.categoryItem, bookData.category === item && styles.selectedCategoryItem, pressed && styles.categoryItemPressed]}
        onPress={() => {
          setBookData({ ...bookData, category: item });
          setPickerVisible(false);
        }}
      >
        <Text style={[styles.categoryText, bookData.category === item && styles.selectedCategoryText]}>{item}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "Edit Book" : "Add New Book"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView style={styles.formContainer}>
          {/* Cover Image */}
          <View style={styles.coverImageContainer}>
            {bookData.coverImage ? (
              <Image
                source={{ uri: bookData.coverImage }}
                style={styles.coverImage}
              />
            ) : (
              <View style={styles.placeholderCover}>
                <Ionicons
                  name="book"
                  size={50}
                  color="#757575"
                />
              </View>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
            >
              <LinearGradient
                colors={["#4568DC", "#B06AB3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.uploadGradient}
              >
                <Text style={styles.uploadText}>{bookData.coverImage ? "Change Cover" : "Upload Cover"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Required Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.sectionTitle}>Book Information</Text>

            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={bookData.title}
              onChangeText={(text) => setBookData({ ...bookData, title: text })}
              placeholder="Enter book title"
              placeholderTextColor="#757575"
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <Text style={styles.label}>Author *</Text>
            <TextInput
              style={[styles.input, errors.author && styles.inputError]}
              value={bookData.author}
              onChangeText={(text) => setBookData({ ...bookData, author: text })}
              placeholder="Enter author name"
              placeholderTextColor="#757575"
            />
            {errors.author && <Text style={styles.errorText}>{errors.author}</Text>}

            <Text style={styles.label}>ISBN *</Text>
            <TextInput
              style={[styles.input, errors.isbn && styles.inputError]}
              value={bookData.isbn}
              onChangeText={(text) => setBookData({ ...bookData, isbn: text })}
              placeholder="Enter ISBN (10 or 13 digits)"
              placeholderTextColor="#757575"
              keyboardType="number-pad"
            />
            {errors.isbn && <Text style={styles.errorText}>{errors.isbn}</Text>}

            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setPickerVisible(true)}
            >
              <Text style={styles.pickerButtonText}>{bookData.category}</Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color="#B06AB3"
              />
            </TouchableOpacity>

            {/* Custom Category Picker Modal */}
            <Modal
              visible={pickerVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setPickerVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.pickerModalContainer}>
                  <View style={styles.pickerModalHeader}>
                    <Text style={styles.pickerModalTitle}>Select Category</Text>
                    <TouchableOpacity onPress={() => setPickerVisible(false)}>
                      <Ionicons
                        name="close"
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    data={CATEGORIES}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item}
                    showsVerticalScrollIndicator={false}
                    style={styles.categoriesList}
                  />
                </View>
              </View>
            </Modal>

            <Text style={styles.label}>Number of Copies *</Text>
            <TextInput
              style={[styles.input, errors.copies && styles.inputError]}
              value={bookData.copies}
              onChangeText={(text) => setBookData({ ...bookData, copies: text })}
              placeholder="Enter number of copies"
              placeholderTextColor="#757575"
              keyboardType="number-pad"
            />
            {errors.copies && <Text style={styles.errorText}>{errors.copies}</Text>}
          </View>

          {/* Additional Information */}
          <View style={styles.formGroup}>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bookData.description}
              onChangeText={(text) => setBookData({ ...bookData, description: text })}
              placeholder="Enter book description"
              placeholderTextColor="#757575"
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.label}>Publisher</Text>
            <TextInput
              style={styles.input}
              value={bookData.publisher}
              onChangeText={(text) => setBookData({ ...bookData, publisher: text })}
              placeholder="Enter publisher"
              placeholderTextColor="#757575"
            />

            <Text style={styles.label}>Publication Year</Text>
            <TextInput
              style={[styles.input, errors.publishedYear && styles.inputError]}
              value={bookData.publishedYear}
              onChangeText={(text) => setBookData({ ...bookData, publishedYear: text })}
              placeholder="Enter publication year"
              placeholderTextColor="#757575"
              keyboardType="number-pad"
            />
            {errors.publishedYear && <Text style={styles.errorText}>{errors.publishedYear}</Text>}

            <Text style={styles.label}>Language</Text>
            <TextInput
              style={styles.input}
              value={bookData.language}
              onChangeText={(text) => setBookData({ ...bookData, language: text })}
              placeholder="Enter language"
              placeholderTextColor="#757575"
            />

            <Text style={styles.label}>Pages</Text>
            <TextInput
              style={[styles.input, errors.pages && styles.inputError]}
              value={bookData.pages}
              onChangeText={(text) => setBookData({ ...bookData, pages: text })}
              placeholder="Enter number of pages"
              placeholderTextColor="#757575"
              keyboardType="number-pad"
            />
            {errors.pages && <Text style={styles.errorText}>{errors.pages}</Text>}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <LinearGradient
              colors={["#4568DC", "#B06AB3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.saveText}>{isEditing ? "Update Book" : "Add Book"}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Spacer for keyboard */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  coverImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  coverImage: {
    width: 150,
    height: 225,
    borderRadius: 8,
    marginBottom: 12,
  },
  placeholderCover: {
    width: 150,
    height: 225,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadButton: {
    borderRadius: 20,
    overflow: "hidden",
    width: 150,
  },
  uploadGradient: {
    paddingVertical: 8,
    alignItems: "center",
  },
  uploadText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  formGroup: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B06AB3",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    marginBottom: 16,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    marginTop: -12,
    marginBottom: 16,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerButton: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  // New Modal Picker styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
  },
  pickerModalContainer: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: "80%",
  },
  pickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  categoriesList: {
    padding: 8,
  },
  categoryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  selectedCategoryItem: {
    backgroundColor: "rgba(176, 106, 179, 0.2)",
  },
  categoryItemPressed: {
    backgroundColor: "rgba(176, 106, 179, 0.1)",
  },
  categoryText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  selectedCategoryText: {
    color: "#B06AB3",
    fontWeight: "bold",
  },
  // Original styles continue...
  saveButton: {
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 8,
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddBookManualScreen;
