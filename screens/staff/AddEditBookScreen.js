import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Title, Chip, HelperText, ActivityIndicator, IconButton, Divider, Text } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import bookService from "../../services/bookService";
import DateTimePicker from "../../components/common/DateTimePicker";
import DropDownPicker from "../../components/common/DropDownPicker";

const AddEditBookScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookId, editing } = route.params || {};

  const [book, setBook] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publishedDate: new Date(),
    description: "",
    pageCount: "",
    categories: [],
    language: "en",
    coverImage: null,
    location: "",
    copies: "1",
    status: "available",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState({ value: "en", label: "English" });

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "ar", label: "Arabic" },
    { value: "ru", label: "Russian" },
  ];

  // Load book data if editing
  useEffect(() => {
    if (bookId) {
      loadBookData();
    }
  }, [bookId]);

  const loadBookData = async () => {
    try {
      setLoading(true);
      const bookData = await bookService.getBookById(bookId);

      // Format the date properly
      const publishedDate = bookData.publishedDate ? new Date(bookData.publishedDate) : new Date();

      setBook({
        ...bookData,
        publishedDate,
        pageCount: bookData.pageCount?.toString() || "",
        copies: bookData.copies?.toString() || "1",
      });

      // Set selected language
      setSelectedLanguage(languages.find((lang) => lang.value === bookData.language) || { value: "en", label: "English" });
    } catch (error) {
      console.error("Failed to load book:", error);
      Alert.alert("Error", "Failed to load book information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!book.title.trim()) newErrors.title = "Title is required";
    if (!book.author.trim()) newErrors.author = "Author is required";

    // ISBN validation (optional but if provided should be valid)
    if (book.isbn && !/^(?:\d{10}|\d{13})$/.test(book.isbn)) {
      newErrors.isbn = "ISBN must be 10 or 13 digits";
    }

    // Page count should be a positive number if provided
    if (book.pageCount && (isNaN(parseInt(book.pageCount)) || parseInt(book.pageCount) <= 0)) {
      newErrors.pageCount = "Page count must be a positive number";
    }

    // Copies should be a positive number
    if (isNaN(parseInt(book.copies)) || parseInt(book.copies) <= 0) {
      newErrors.copies = "Number of copies must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Prepare the data
      const bookData = {
        ...book,
        language: selectedLanguage.value,
        pageCount: book.pageCount ? parseInt(book.pageCount) : null,
        copies: parseInt(book.copies),
      };

      if (editing) {
        await bookService.updateBook(bookId, bookData);
        Alert.alert("Success", "Book updated successfully");
      } else {
        const newBook = await bookService.createBook(bookData);
        Alert.alert("Success", "Book added successfully");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Failed to save book:", error);
      Alert.alert("Error", error.message || "Failed to save book. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !book.categories.includes(newCategory.trim())) {
      setBook({
        ...book,
        categories: [...book.categories, newCategory.trim()],
      });
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (category) => {
    setBook({
      ...book,
      categories: book.categories.filter((c) => c !== category),
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library to add a cover image");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setBook({ ...book, coverImage: result.assets[0].uri });
    }
  };

  const handleScanISBN = () => {
    navigation.navigate("BarcodeScanner", {
      mode: "isbn",
      onScan: (isbn) => {
        setBook((prev) => ({ ...prev, isbn }));
      },
    });
  };

  const fetchBookByISBN = async () => {
    if (!book.isbn) {
      Alert.alert("Error", "Please enter an ISBN first");
      return;
    }

    try {
      setLoading(true);
      const bookData = await bookService.lookupBookByISBN(book.isbn);

      if (bookData) {
        // Keep the existing ISBN and coverImage if already set
        setBook({
          ...bookData,
          isbn: book.isbn || bookData.isbn,
          coverImage: book.coverImage || bookData.coverImage,
          publishedDate: bookData.publishedDate ? new Date(bookData.publishedDate) : new Date(),
          pageCount: bookData.pageCount?.toString() || "",
          copies: "1",
          status: "available",
        });

        // Set selected language
        setSelectedLanguage(languages.find((lang) => lang.value === bookData.language) || { value: "en", label: "English" });
      } else {
        Alert.alert("Not Found", "No book information found for this ISBN");
      }
    } catch (error) {
      console.error("Failed to fetch book by ISBN:", error);
      Alert.alert("Error", "Failed to fetch book information by ISBN");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#4568DC"
        />
        <Text style={styles.loadingText}>{editing ? "Loading book information..." : "Loading..."}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Cover Image Section */}
          <TouchableOpacity
            style={styles.coverContainer}
            onPress={pickImage}
          >
            {book.coverImage ? (
              <Image
                source={{ uri: book.coverImage }}
                style={styles.coverImage}
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <MaterialIcons
                  name="image"
                  size={48}
                  color="#CCCCCC"
                />
                <Text style={styles.coverPlaceholderText}>Tap to add cover</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ISBN Section with Scan Button */}
          <View style={styles.isbnContainer}>
            <TextInput
              label="ISBN"
              value={book.isbn}
              onChangeText={(text) => setBook({ ...book, isbn: text.replace(/[^0-9]/g, "") })}
              style={styles.isbnInput}
              error={!!errors.isbn}
              keyboardType="numeric"
            />
            <IconButton
              icon="barcode-scan"
              size={24}
              onPress={handleScanISBN}
              style={styles.scanButton}
            />
            <Button
              mode="outlined"
              onPress={fetchBookByISBN}
              style={styles.lookupButton}
            >
              Lookup
            </Button>
          </View>
          {errors.isbn && <HelperText type="error">{errors.isbn}</HelperText>}

          {/* Basic Book Information */}
          <TextInput
            label="Title *"
            value={book.title}
            onChangeText={(text) => setBook({ ...book, title: text })}
            style={styles.input}
            error={!!errors.title}
          />
          {errors.title && <HelperText type="error">{errors.title}</HelperText>}

          <TextInput
            label="Author *"
            value={book.author}
            onChangeText={(text) => setBook({ ...book, author: text })}
            style={styles.input}
            error={!!errors.author}
          />
          {errors.author && <HelperText type="error">{errors.author}</HelperText>}

          <TextInput
            label="Publisher"
            value={book.publisher}
            onChangeText={(text) => setBook({ ...book, publisher: text })}
            style={styles.input}
          />

          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Publication Date</Text>
            <DateTimePicker
              value={book.publishedDate}
              onChange={(date) => setBook({ ...book, publishedDate: date })}
              mode="date"
              maximumDate={new Date()}
            />
          </View>

          <TextInput
            label="Page Count"
            value={book.pageCount}
            onChangeText={(text) => setBook({ ...book, pageCount: text.replace(/[^0-9]/g, "") })}
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.pageCount}
          />
          {errors.pageCount && <HelperText type="error">{errors.pageCount}</HelperText>}

          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Language</Text>
            <DropDownPicker
              items={languages}
              selectedItem={selectedLanguage}
              onSelectItem={setSelectedLanguage}
              placeholder="Select Language"
            />
          </View>

          <TextInput
            label="Description"
            value={book.description}
            onChangeText={(text) => setBook({ ...book, description: text })}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          {/* Location and Copies */}
          <TextInput
            label="Shelf Location"
            value={book.location}
            onChangeText={(text) => setBook({ ...book, location: text })}
            style={styles.input}
          />

          <TextInput
            label="Number of Copies *"
            value={book.copies}
            onChangeText={(text) => setBook({ ...book, copies: text.replace(/[^0-9]/g, "") })}
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.copies}
          />
          {errors.copies && <HelperText type="error">{errors.copies}</HelperText>}

          {/* Categories Section */}
          <Title style={styles.sectionTitle}>Categories</Title>
          <View style={styles.categoriesContainer}>
            {book.categories.map((category) => (
              <Chip
                key={category}
                style={styles.categoryChip}
                onClose={() => handleRemoveCategory(category)}
              >
                {category}
              </Chip>
            ))}
          </View>

          <View style={styles.addCategoryContainer}>
            <TextInput
              label="Add Category"
              value={newCategory}
              onChangeText={setNewCategory}
              style={styles.categoryInput}
            />
            <Button
              mode="text"
              onPress={handleAddCategory}
              disabled={!newCategory.trim()}
            >
              Add
            </Button>
          </View>

          <Divider style={styles.divider} />

          {/* Save and Cancel Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              loading={saving}
              disabled={saving}
            >
              {editing ? "Update" : "Save"}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  coverContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  coverImage: {
    width: 140,
    height: 210,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 140,
    height: 210,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderStyle: "dashed",
  },
  coverPlaceholderText: {
    marginTop: 8,
    color: "#999999",
  },
  isbnContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  isbnInput: {
    flex: 1,
  },
  scanButton: {
    marginLeft: 8,
  },
  lookupButton: {
    marginLeft: 8,
  },
  input: {
    marginBottom: 12,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categoryChip: {
    margin: 4,
  },
  addCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryInput: {
    flex: 1,
    marginRight: 8,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  button: {
    marginHorizontal: 8,
    minWidth: 120,
  },
});

export default AddEditBookScreen;
