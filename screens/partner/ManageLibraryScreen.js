import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
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
        await dataService.initializeDemoData();

        // Load library data
        const libraries = await dataService.getLibraries();
        const currentLibrary = libraries.find((lib) => lib.id === libraryId);

        if (!currentLibrary) {
          setError("Library not found");
          setLoading(false);
          return;
        }

        setLibrary(currentLibrary);
        setLibraryName(currentLibrary.name || "");
        setLibraryDescription(currentLibrary.description || "");
        setLibraryLocation(currentLibrary.location || "");
        setLibraryContact(currentLibrary.contact || "");
        setIsPublic(currentLibrary.isPublic !== false);

        // Load books for this library
        const allBooks = await dataService.getBooks();
        const libraryBooks = allBooks.filter((book) => book.libraryId === libraryId);
        setBooks(libraryBooks);
      } catch (error) {
        console.error("Failed to load library data:", error);
        setError("Failed to load library data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (libraryId) {
      loadData();
    }
  }, [libraryId]);

  // Helper function to count available copies
  const getAvailableCopies = (book) => {
    return book.copies.filter((copy) => copy.borrowedBy === null).length;
  };

  // Helper function to count total copies
  const getTotalCopies = (book) => {
    return book.copies.length;
  };

  // Helper function to check if book has been borrowed
  const hasBeenBorrowed = (book) => {
    return book.copies.some((copy) => copy.borrowedBy !== null) || book.copies.length !== getAvailableCopies(book);
  };

  // Reset book form
  const resetBookForm = () => {
    setBookTitle("");
    setBookAuthor("");
    setBookIsbn("");
    setBookPublisher("");
    setBookDescription("");
    setBookCoverImage("");
    setBookCopiesCount("");
    setCurrentBook(null);
    setIsEditMode(false);
  };

  // Open book modal for editing
  const openBookEditModal = (book) => {
    if (hasBeenBorrowed(book)) {
      // If book has been borrowed, show restricted edit options
      Alert.alert("Restricted Editing", "This book has been borrowed. You can only edit the cover image and description.", [
        {
          text: "Edit Limited Fields",
          onPress: () => {
            setCurrentBook(book);
            setBookTitle(book.title);
            setBookAuthor(book.author);
            setBookIsbn(book.isbn);
            setBookPublisher(book.publisher);
            setBookDescription(book.description);
            setBookCoverImage(book.coverImage || "");
            setBookCopiesCount(book.copies.length.toString());
            setIsEditMode(true);
            setBookModalVisible(true);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      // Full edit options for books that haven't been borrowed
      setCurrentBook(book);
      setBookTitle(book.title);
      setBookAuthor(book.author);
      setBookIsbn(book.isbn);
      setBookPublisher(book.publisher);
      setBookDescription(book.description);
      setBookCoverImage(book.coverImage || "");
      setBookCopiesCount(book.copies.length.toString());
      setIsEditMode(true);
      setBookModalVisible(true);
    }
  };

  // Open book modal for adding
  const openBookAddModal = () => {
    resetBookForm();
    setBookModalVisible(true);
  };

  // Handle save book
  const handleSaveBook = async () => {
    // Validate form
    if (!bookTitle.trim() || !bookAuthor.trim() || !bookIsbn.trim() || !bookDescription.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const copiesCount = Number.parseInt(bookCopiesCount) || 0;
    if (copiesCount <= 0) {
      Alert.alert("Error", "Number of copies must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && currentBook) {
        // Check if book has been borrowed
        const hasBorrowed = hasBeenBorrowed(currentBook);

        // Get current borrowed copies to preserve them
        const borrowedCopies = currentBook.copies.filter((copy) => copy.borrowedBy !== null);

        // Create updated book object
        const updatedBook = {
          ...currentBook,
          // Only update title, author, isbn, publisher if book hasn't been borrowed
          title: hasBorrowed ? currentBook.title : bookTitle,
          author: hasBorrowed ? currentBook.author : bookAuthor,
          isbn: hasBorrowed ? currentBook.isbn : bookIsbn,
          publisher: hasBorrowed ? currentBook.publisher : bookPublisher,
          // These fields can always be updated
          description: bookDescription,
          coverImage: bookCoverImage,
        };

        // Handle copies update
        const newCopiesCount = Number.parseInt(bookCopiesCount);
        const currentCopiesCount = currentBook.copies.length;

        if (newCopiesCount > currentCopiesCount) {
          // Add new copies
          const newCopies = [];
          for (let i = currentCopiesCount + 1; i <= newCopiesCount; i++) {
            newCopies.push({
              id: i,
              borrowedBy: null,
              borrowedDate: null,
              dueDate: null,
            });
          }
          updatedBook.copies = [...currentBook.copies, ...newCopies];
        } else if (newCopiesCount < currentCopiesCount) {
          // Remove copies, but keep borrowed ones
          if (newCopiesCount < borrowedCopies.length) {
            Alert.alert("Error", "Cannot reduce copies below the number currently borrowed");
            setLoading(false);
            return;
          }

          // Keep all borrowed copies
          updatedBook.copies = [...borrowedCopies];

          // Add available copies up to the new total
          const availableCopiesNeeded = newCopiesCount - borrowedCopies.length;
          for (let i = 1; i <= availableCopiesNeeded; i++) {
            updatedBook.copies.push({
              id: borrowedCopies.length + i,
              borrowedBy: null,
              borrowedDate: null,
              dueDate: null,
            });
          }
        }

        // Update books array
        const updatedBooks = books.map((book) => (book.id === currentBook.id ? updatedBook : book));

        // Save to AsyncStorage
        await dataService.updateBook(updatedBook);

        setBooks(updatedBooks);
        Alert.alert("Success", "Book updated successfully");
      } else {
        // Create new book
        const newCopies = [];
        for (let i = 1; i <= Number.parseInt(bookCopiesCount); i++) {
          newCopies.push({
            id: i,
            borrowedBy: null,
            borrowedDate: null,
            dueDate: null,
          });
        }

        const newBook = {
          id: Date.now().toString(),
          libraryId: libraryId,
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn,
          publisher: bookPublisher,
          description: bookDescription,
          coverImage: bookCoverImage || "https://example.com/placeholder.jpg",
          copies: newCopies,
          reservedBy: [],
        };

        // Save to AsyncStorage
        await dataService.addBook(newBook);

        // Add to books array
        setBooks([...books, newBook]);
        Alert.alert("Success", "Book added successfully");
      }
    } catch (error) {
      console.error("Failed to save book:", error);
      Alert.alert("Error", "Failed to save book. Please try again.");
    } finally {
      setLoading(false);
      setBookModalVisible(false);
      resetBookForm();
    }
  };

  // Handle remove book
  const handleRemoveBook = (bookId) => {
    const bookToRemove = books.find((book) => book.id === bookId);

    // Check if any copies are currently borrowed
    const hasBorrowedCopies = bookToRemove.copies.some((copy) => copy.borrowedBy !== null);

    if (hasBorrowedCopies) {
      Alert.alert("Cannot Remove Book", "This book has copies that are currently borrowed. All copies must be returned before removal.", [{ text: "OK" }]);
      return;
    }

    Alert.alert("Remove Book", "Are you sure you want to remove this book from the library?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            // Remove from AsyncStorage
            await dataService.deleteBook(bookId);
            const updatedBooks = books.filter((book) => book.id !== bookId);
            setBooks(updatedBooks);
            Alert.alert("Success", "Book removed successfully");
          } catch (error) {
            console.error("Failed to remove book:", error);
            Alert.alert("Error", "Failed to remove book. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // Handle save library settings
  const handleSaveSettings = async () => {
    if (!libraryName.trim() || !libraryDescription.trim() || !libraryLocation.trim() || !libraryContact.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const updatedLibrary = {
        ...library,
        name: libraryName,
        description: libraryDescription,
        location: libraryLocation,
        contact: libraryContact,
        isPublic: isPublic,
      };

      await dataService.updateLibrary(libraryId, updatedLibrary);
      setLibrary(updatedLibrary);
      setSettingsChanged(false);

      Alert.alert("Success", "Library settings updated successfully");
    } catch (error) {
      console.error("Failed to update library settings:", error);
      Alert.alert("Error", "Failed to update library settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to book detail screen
  const navigateToBookDetail = (bookId) => {
    navigation.navigate("BookDetail", {
      bookId: bookId,
      libraryId: libraryId,
    });
  };

  // Render book item
  const renderBookItem = ({ item }) => {
    const availableCopies = getAvailableCopies(item);
    const totalCopies = getTotalCopies(item);
    const borrowedCopies = totalCopies - availableCopies;
    const reservations = item.reservedBy ? item.reservedBy.length : 0;

    return (
      <View style={styles.bookItem}>
        <LinearGradient
          colors={["#1E1E1E", "#2A2A2A"]}
          style={styles.bookCard}
        >
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{item.title}</Text>
            <Text style={styles.bookAuthor}>{item.author}</Text>
            <Text
              style={styles.bookDescription}
              numberOfLines={2}
            >
              {item.description}
            </Text>

            <View style={styles.bookStats}>
              <View>
                <Text style={styles.statText}>
                  Available: <Text style={styles.statValue}>{availableCopies}</Text>
                </Text>
              </View>
              <View>
                <Text style={styles.statText}>
                  Borrowed: <Text style={styles.statValue}>{borrowedCopies}</Text>
                </Text>
              </View>
              <View>
                <Text style={styles.statText}>
                  Reservations: <Text style={styles.statValue}>{reservations}</Text>
                </Text>
              </View>
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
              style={[styles.actionButton, styles.editButton]}
              onPress={() => navigateToBookDetail(item.id)}
            >
              <Feather
                name="info"
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
      </View>
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              // Re-attempt loading data
              const loadData = async () => {
                try {
                  await dataService.initializeDemoData();
                  const libraries = await dataService.getLibraries();
                  const currentLibrary = libraries.find((lib) => lib.id === libraryId);
                  setLibrary(currentLibrary);
                  const allBooks = await dataService.getBooks();
                  const libraryBooks = allBooks.filter((book) => book.libraryId === libraryId);
                  setBooks(libraryBooks);
                  setError(null);
                } catch (error) {
                  setError("Failed to load library data. Please try again.");
                } finally {
                  setLoading(false);
                }
              };
              loadData();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{library ? library.name : "Manage Library"}</Text>
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

      <ScrollView style={styles.container}>
        {activeTab === "books" && (
          <>
            <View style={styles.actionBar}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={openBookAddModal}
              >
                <Feather
                  name="plus"
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.addButtonText}>Add Book</Text>
              </TouchableOpacity>
            </View>

            {books.length > 0 ? (
              <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={renderBookItem}
                scrollEnabled={false}
                nestedScrollEnabled
              />
            ) : (
              <Text style={styles.emptyListText}>No books in this library yet</Text>
            )}
          </>
        )}

        {activeTab === "settings" && renderSettingsContent()}
      </ScrollView>

      {/* Book Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bookModalVisible}
        onRequestClose={() => {
          setBookModalVisible(!bookModalVisible);
          resetBookForm();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditMode ? "Edit Book" : "Add New Book"}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setBookModalVisible(false);
                  resetBookForm();
                }}
              >
                <Feather
                  name="x"
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {isEditMode && hasBeenBorrowed(currentBook) && (
                <View style={styles.warningBox}>
                  <Feather
                    name="alert-triangle"
                    size={20}
                    color="#FFD700"
                  />
                  <Text style={styles.warningText}>This book has been borrowed. Only description and cover image can be edited.</Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={bookTitle}
                  onChangeText={setBookTitle}
                  placeholder="Enter book title"
                  placeholderTextColor="#757575"
                  editable={!isEditMode || (isEditMode && !hasBeenBorrowed(currentBook))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Author</Text>
                <TextInput
                  style={styles.input}
                  value={bookAuthor}
                  onChangeText={setBookAuthor}
                  placeholder="Enter author name"
                  placeholderTextColor="#757575"
                  editable={!isEditMode || (isEditMode && !hasBeenBorrowed(currentBook))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>ISBN</Text>
                <TextInput
                  style={styles.input}
                  value={bookIsbn}
                  onChangeText={setBookIsbn}
                  placeholder="Enter ISBN"
                  placeholderTextColor="#757575"
                  editable={!isEditMode || (isEditMode && !hasBeenBorrowed(currentBook))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Publisher</Text>
                <TextInput
                  style={styles.input}
                  value={bookPublisher}
                  onChangeText={setBookPublisher}
                  placeholder="Enter publisher"
                  placeholderTextColor="#757575"
                  editable={!isEditMode || (isEditMode && !hasBeenBorrowed(currentBook))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bookDescription}
                  onChangeText={setBookDescription}
                  placeholder="Enter book description"
                  placeholderTextColor="#757575"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Cover Image URL</Text>
                <TextInput
                  style={styles.input}
                  value={bookCoverImage}
                  onChangeText={setBookCoverImage}
                  placeholder="Enter cover image URL (optional)"
                  placeholderTextColor="#757575"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Number of Copies</Text>
                <TextInput
                  style={styles.input}
                  value={bookCopiesCount}
                  onChangeText={setBookCopiesCount}
                  placeholder="Enter number of copies"
                  placeholderTextColor="#757575"
                  keyboardType="numeric"
                  editable={!isEditMode || (isEditMode && getAvailableCopies(currentBook) === getTotalCopies(currentBook))}
                />
                {isEditMode && hasBeenBorrowed(currentBook) && <Text style={styles.helperText}>You can only increase the number of copies or maintain the current number.</Text>}
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveBook}
              >
                <LinearGradient
                  colors={["#4568DC", "#B06AB3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.saveButtonText}>{isEditMode ? "Update Book" : "Add Book"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 15,
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
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
    marginBottom: 10,
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
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4568DC",
    paddingVertical: 8,
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
