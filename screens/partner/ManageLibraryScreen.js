import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Switch, ActivityIndicator, SafeAreaView, Modal, ScrollView, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import dataService from "../../services/demo/dataService";

const ManageLibraryScreen = ({ navigation, route }) => {
  const libraryId = route?.params?.libraryId;

  // State
  const [library, setLibrary] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("books");
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Book form state
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [bookPublisher, setBookPublisher] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookCoverImage, setBookCoverImage] = useState("");
  const [bookCopiesCount, setBookCopiesCount] = useState("");

  // Library settings state
  const [libraryName, setLibraryName] = useState("");
  const [libraryDescription, setLibraryDescription] = useState("");
  const [libraryLocation, setLibraryLocation] = useState("");
  const [libraryContact, setLibraryContact] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const libraryData = await dataService.getLibrary(libraryId);
        const booksData = await dataService.getBooks(libraryId);

        if (libraryData) {
          setLibrary(libraryData);
          setLibraryName(libraryData.name);
          setLibraryDescription(libraryData.description);
          setLibraryLocation(libraryData.location);
          setLibraryContact(libraryData.contact);
          setIsPublic(libraryData.isPublic);
        }

        setBooks(booksData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [libraryId]);

  // Helper function to count available copies
  const getAvailableCopies = (book) => {
    if (!book.copies) return 0;
    return book.copies.filter((copy) => !copy.borrowedBy).length;
  };

  // Helper function to count total copies
  const getTotalCopies = (book) => {
    return book.copies ? book.copies.length : 0;
  };

  // Helper function to check if book has been borrowed
  const hasBeenBorrowed = (book) => {
    if (!book.copies) return false;
    return book.copies.some((copy) => copy.borrowedBy);
  };

  // Reset book form
  const resetBookForm = () => {
    setBookTitle("");
    setBookAuthor("");
    setBookIsbn("");
    setBookPublisher("");
    setBookDescription("");
    setBookCoverImage("");
    setBookCopiesCount("1");
    setCurrentBook(null);
    setIsEditMode(false);
  };

  // Open book modal for editing
  const openBookEditModal = (book) => {
    setCurrentBook(book);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookIsbn(book.isbn || "");
    setBookPublisher(book.publisher || "");
    setBookDescription(book.description || "");
    setBookCoverImage(book.coverImage || "");
    setBookCopiesCount(String(getTotalCopies(book)));
    setIsEditMode(true);
    setBookModalVisible(true);
  };

  // Open book modal for adding
  const openBookAddModal = () => {
    resetBookForm();
    setBookModalVisible(true);
  };

  // Navigate to scanner screen for adding books
  const navigateToScanBook = () => {
    navigation.navigate("AddBookScan", { libraryId });
  };

  // Handle save book
  const handleSaveBook = async () => {
    try {
      if (!bookTitle || !bookAuthor) {
        alert("Title and author are required");
        return;
      }

      const copiesCount = parseInt(bookCopiesCount) || 1;
      let bookData;

      if (isEditMode && currentBook) {
        // Update existing book
        const currentCopies = currentBook.copies || [];
        const newTotalCopies = copiesCount;

        // Create or remove copies as needed
        let updatedCopies = [...currentCopies];

        if (newTotalCopies > currentCopies.length) {
          // Add more copies
          for (let i = currentCopies.length + 1; i <= newTotalCopies; i++) {
            updatedCopies.push({
              id: i,
              borrowedBy: null,
              borrowDate: null,
              dueDate: null,
            });
          }
        } else if (newTotalCopies < currentCopies.length) {
          // Remove copies (only those not borrowed)
          const availableCopies = currentCopies.filter((copy) => !copy.borrowedBy);
          const borrowedCopies = currentCopies.filter((copy) => copy.borrowedBy);

          if (newTotalCopies < borrowedCopies.length) {
            alert("Cannot reduce copies below the number currently borrowed");
            return;
          }

          // Keep all borrowed copies and add enough available ones to meet new total
          updatedCopies = [...borrowedCopies, ...availableCopies.slice(0, newTotalCopies - borrowedCopies.length)];
        }

        const updates = {
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn,
          publisher: bookPublisher,
          description: bookDescription,
          coverImage: bookCoverImage,
          copies: updatedCopies,
        };

        await dataService.updateBook(currentBook.id, updates);

        // Update local state
        setBooks(books.map((book) => (book.id === currentBook.id ? { ...book, ...updates } : book)));
      } else {
        // Create new book
        const copies = [];
        for (let i = 1; i <= copiesCount; i++) {
          copies.push({
            id: i,
            borrowedBy: null,
            borrowDate: null,
            dueDate: null,
          });
        }

        const newBook = {
          id: Date.now().toString(),
          libraryId,
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn,
          publisher: bookPublisher,
          description: bookDescription,
          coverImage: bookCoverImage,
          copies,
          reservedBy: [],
        };

        await dataService.addBook(newBook);

        // Update local state
        setBooks([...books, newBook]);
      }

      setBookModalVisible(false);
      resetBookForm();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Handle remove book
  const handleRemoveBook = async (bookId) => {
    try {
      const book = books.find((b) => b.id === bookId);

      if (hasBeenBorrowed(book)) {
        alert("Cannot remove a book that has been borrowed");
        return;
      }

      await dataService.deleteBook(bookId);

      // Update local state
      setBooks(books.filter((book) => book.id !== bookId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Handle save library settings
  const handleSaveSettings = async () => {
    try {
      if (!libraryName || !libraryDescription || !libraryLocation || !libraryContact) {
        alert("All fields are required");
        return;
      }

      const updates = {
        name: libraryName,
        description: libraryDescription,
        location: libraryLocation,
        contact: libraryContact,
        isPublic,
      };

      await dataService.updateLibrary(libraryId, updates);

      // Update local state
      setLibrary({ ...library, ...updates });
      setSettingsChanged(false);

      alert("Library settings updated successfully");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Navigate to book detail screen
  const navigateToBookDetail = (bookId) => {
    navigation.navigate("BookDetail", { bookId, fromScreen: "ManageLibrary" });
  };

  // Render book item
  const renderBookItem = ({ item }) => {
    const availableCopies = getAvailableCopies(item);
    const totalCopies = getTotalCopies(item);

    return (
      <TouchableOpacity
        style={styles.bookItem}
        onPress={() => navigateToBookDetail(item.id)}
      >
        <LinearGradient
          colors={["#1E1E1E", "#2A2A2A"]}
          style={styles.bookCard}
        >
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{item.title}</Text>
            <Text style={styles.bookAuthor}>{item.author}</Text>

            {item.description && (
              <Text
                style={styles.bookDescription}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}

            <View style={styles.bookStats}>
              <Text style={styles.statText}>
                Available:{" "}
                <Text style={styles.statValue}>
                  {availableCopies}/{totalCopies}
                </Text>
              </Text>
              <Text style={styles.statText}>
                ISBN: <Text style={styles.statValue}>{item.isbn || "N/A"}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => openBookEditModal(item)}
            >
              <Feather
                name="edit"
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => handleRemoveBook(item.id)}
            >
              <Feather
                name="trash-2"
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Render the settings content
  const renderSettingsContent = () => (
    <View style={styles.settingsContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Library Name*</Text>
        <TextInput
          style={styles.input}
          value={libraryName}
          onChangeText={(text) => {
            setLibraryName(text);
            setSettingsChanged(true);
          }}
          placeholder="Enter library name"
          placeholderTextColor="#757575"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description*</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={libraryDescription}
          onChangeText={(text) => {
            setLibraryDescription(text);
            setSettingsChanged(true);
          }}
          placeholder="Enter library description"
          placeholderTextColor="#757575"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Location*</Text>
        <TextInput
          style={styles.input}
          value={libraryLocation}
          onChangeText={(text) => {
            setLibraryLocation(text);
            setSettingsChanged(true);
          }}
          placeholder="Enter library location"
          placeholderTextColor="#757575"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact Information*</Text>
        <TextInput
          style={styles.input}
          value={libraryContact}
          onChangeText={(text) => {
            setLibraryContact(text);
            setSettingsChanged(true);
          }}
          placeholder="Enter contact information"
          placeholderTextColor="#757575"
        />
      </View>

      <View style={styles.formGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Public Library</Text>
          <Switch
            value={isPublic}
            onValueChange={(value) => {
              setIsPublic(value);
              setSettingsChanged(true);
            }}
            trackColor={{ false: "#1E1E1E", true: "#4568DC" }}
            thumbColor={isPublic ? "#FFFFFF" : "#757575"}
            ios_backgroundColor="#1E1E1E"
          />
        </View>
        <Text style={styles.helperText}>{isPublic ? "Your library will be visible to all users" : "Your library will only be accessible via direct link or QR code"}</Text>
      </View>

      {settingsChanged && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSettings}
        >
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
          <Text style={styles.loadingText}>Loading library data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Feather
            name="alert-circle"
            size={50}
            color="#FF6B6B"
          />
          <Text style={styles.errorText}>Error loading library data: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.replace("ManageLibrary", { libraryId })}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
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
        <Text style={styles.headerTitle}>{library?.name || "Manage Library"}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "books" && styles.activeTab]}
          onPress={() => setActiveTab("books")}
        >
          <Text style={[styles.tabText, activeTab === "books" && styles.activeTabText]}>Books</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "settings" && styles.activeTab]}
          onPress={() => setActiveTab("settings")}
        >
          <Text style={[styles.tabText, activeTab === "settings" && styles.activeTabText]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "books" ? (
        <View style={{ flex: 1 }}>
          <View style={[styles.container, styles.actionBar]}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={navigateToScanBook}
            >
              <Feather
                name="plus"
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.addButtonText}>Add Book</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={books}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => <Text style={styles.emptyListText}>No books added to this library yet. Click the "Add Book" button to get started.</Text>}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {renderSettingsContent()}
        </ScrollView>
      )}

      {/* Book Modal here */}
      {/* ... */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 5,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  container: {
    padding: 20,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#B06AB3",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  activeTabText: {
    fontWeight: "bold",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 15,
    paddingBottom: 5,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4568DC",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "bold",
  },
  bookItem: {
    marginBottom: 15,
  },
  bookCard: {
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 5,
  },
  bookDescription: {
    fontSize: 14,
    color: "#E0E0E0",
    marginTop: 4,
  },
  bookStats: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statText: {
    fontSize: 12,
    color: "#E0E0E0",
  },
  statValue: {
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  actionButtons: {
    justifyContent: "space-around",
    marginLeft: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  removeButton: {
    backgroundColor: "rgba(255, 0, 0, 0.3)",
  },
  emptyListText: {
    textAlign: "center",
    color: "#757575",
    marginTop: 30,
    fontSize: 16,
  },
  settingsContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    color: "#E0E0E0",
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4568DC",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    margin: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 5,
  },
  modalForm: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2A2A2A",
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
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  warningText: {
    color: "#FFD700",
    marginLeft: 8,
    flex: 1,
  },
  saveButton: {
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  gradientButton: {
    padding: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
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
});

export default ManageLibraryScreen;
