import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

// Demo book data
const DEMO_BOOKS = [
  {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9781847941831",
    category: "Self-Help",
    status: "available",
    copies: 5,
    availableCopies: 3,
  },
  {
    id: "2",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "9781449373320",
    category: "Technology",
    status: "available",
    copies: 2,
    availableCopies: 0,
  },
  {
    id: "3",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    category: "Technology",
    status: "available",
    copies: 3,
    availableCopies: 1,
  },
  {
    id: "4",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    isbn: "9780857197689",
    category: "Finance",
    status: "available",
    copies: 4,
    availableCopies: 2,
  },
  {
    id: "5",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    category: "Fiction",
    status: "available",
    copies: 6,
    availableCopies: 4,
  },
  {
    id: "6",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    category: "Fiction",
    status: "available",
    copies: 3,
    availableCopies: 3,
  },
  {
    id: "7",
    title: "Educated",
    author: "Tara Westover",
    isbn: "9780399590504",
    category: "Memoir",
    status: "available",
    copies: 2,
    availableCopies: 1,
  },
  {
    id: "8",
    title: "The Alchemist",
    author: "Paulo Coelho",
    isbn: "9780062315007",
    category: "Fiction",
    status: "available",
    copies: 8,
    availableCopies: 5,
  },
];

// Category options for filtering
const CATEGORIES = ["All", "Fiction", "Technology", "Self-Help", "Finance", "Memoir"];

const ManageBooksScreen = ({ navigation }) => {
  const [books, setBooks] = useState(DEMO_BOOKS);
  const [filteredBooks, setFilteredBooks] = useState(DEMO_BOOKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [sortBy, setSortBy] = useState("title"); // 'title', 'author', 'category'

  useEffect(() => {
    filterBooks();
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  const filterBooks = () => {
    let result = [...books];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (book) => book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase()) || book.isbn.includes(searchQuery)
      );
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      result = result.filter((book) => book.category === selectedCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "author") {
        comparison = a.author.localeCompare(b.author);
      } else if (sortBy === "category") {
        comparison = a.category.localeCompare(b.category);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredBooks(result);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // In a real app, this would fetch fresh data from the API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAddBook = () => {
    // Navigate to AddBookManual screen
    navigation.navigate("AddBookManual");
  };

  const handleScanBook = () => {
    // Navigate to AddBookScan screen
    navigation.navigate("AddBookScan");
  };

  const handleEditBook = (book) => {
    // Navigate to edit screen with book data
    navigation.navigate("AddBookManual", { book, isEditing: true });
  };

  const handleDeleteBook = (bookId) => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // In a real app, this would call the API to delete the book
          setLoading(true);
          setTimeout(() => {
            const updatedBooks = books.filter((book) => book.id !== bookId);
            setBooks(updatedBooks);
            setFilteredBooks(filteredBooks.filter((book) => book.id !== bookId));
            setLoading(false);
            Alert.alert("Success", "Book deleted successfully");
          }, 500);
        },
      },
    ]);
  };

  const handleImportBooks = () => {
    Alert.alert("Import Books", "This would open a file picker to import books from CSV/Excel.", [{ text: "OK" }]);
  };

  const handleExportBooks = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Export Books", "Books catalog exported successfully. In a real app, this would generate a file for download.", [{ text: "OK" }]);
    }, 1000);
  };

  const renderBookItem = ({ item }) => {
    const availabilityColor = item.availableCopies === 0 ? "#ef4444" : item.availableCopies < item.copies / 2 ? "#f97316" : "#22c55e";

    return (
      <View style={styles.bookItem}>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <Text style={styles.bookAuthor}>by {item.author}</Text>
          <View style={styles.bookDetails}>
            <Text style={styles.bookDetail}>
              <Text style={styles.detailLabel}>ISBN: </Text>
              {item.isbn}
            </Text>
            <Text style={styles.bookDetail}>
              <Text style={styles.detailLabel}>Category: </Text>
              {item.category}
            </Text>
            <View style={styles.availabilityContainer}>
              <Text style={styles.detailLabel}>Availability: </Text>
              <View style={styles.copiesContainer}>
                <View style={[styles.availabilityIndicator, { backgroundColor: availabilityColor }]} />
                <Text style={styles.bookDetail}>
                  {item.availableCopies}/{item.copies} copies
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bookActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleEditBook(item)}
          >
            <Ionicons
              name="create-outline"
              size={22}
              color="#4568DC"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleDeleteBook(item.id)}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color="#ef4444"
            />
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Manage Books</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <MaterialIcons
              name="filter-list"
              size={24}
              color="#B06AB3"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#757575"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search books by title, author, or ISBN"
          placeholderTextColor="#757575"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#757575"
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category pills */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryPill, selectedCategory === item && styles.selectedCategoryPill]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.categoryText, selectedCategory === item && styles.selectedCategoryText]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Books list */}
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        contentContainerStyle={styles.booksList}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book"
              size={60}
              color="#757575"
            />
            <Text style={styles.emptyText}>No books match your filter</Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Bottom action buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.importButton]}
          onPress={handleImportBooks}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>Import</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleAddBook}
        >
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons
              name="add"
              size={30}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={handleExportBooks}
        >
          <Ionicons
            name="cloud-download-outline"
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Scanner FAB */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={handleScanBook}
      >
        <LinearGradient
          colors={["#B06AB3", "#4568DC"]}
          style={styles.scanGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons
            name="barcode-outline"
            size={24}
            color="#FFFFFF"
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setFilterModalVisible(false)}
        >
          <View
            style={styles.filterModal}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>Sort Books</Text>

            <Text style={styles.modalSectionTitle}>Sort by</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortBy("title")}
              >
                <View style={styles.radioCircle}>{sortBy === "title" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Title</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortBy("author")}
              >
                <View style={styles.radioCircle}>{sortBy === "author" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Author</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortBy("category")}
              >
                <View style={styles.radioCircle}>{sortBy === "category" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Category</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionTitle}>Order</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortOrder("asc")}
              >
                <View style={styles.radioCircle}>{sortOrder === "asc" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Ascending</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortOrder("desc")}
              >
                <View style={styles.radioCircle}>{sortOrder === "desc" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Descending</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <LinearGradient
                colors={["#4568DC", "#B06AB3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.applyButtonGradient}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
        </View>
      )}
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
    marginLeft: 8,
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
  },
  headerIconButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#FFFFFF",
    fontSize: 16,
  },
  clearButton: {
    padding: 6,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryPill: {
    backgroundColor: "#4568DC",
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  selectedCategoryText: {
    fontWeight: "bold",
  },
  booksList: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for bottom actions
  },
  bookItem: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#B06AB3",
    marginBottom: 8,
  },
  bookDetails: {
    gap: 4,
  },
  bookDetail: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  detailLabel: {
    color: "#757575",
    fontSize: 14,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  copiesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  bookActions: {
    justifyContent: "space-around",
    paddingLeft: 16,
  },
  iconButton: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#757575",
    fontSize: 16,
    marginTop: 16,
  },
  clearFiltersText: {
    color: "#4568DC",
    fontSize: 16,
    marginTop: 8,
    textDecorationLine: "underline",
  },
  bottomActions: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  actionButton: {
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  importButton: {
    backgroundColor: "#2A2A2A",
  },
  exportButton: {
    backgroundColor: "#2A2A2A",
  },
  actionButtonText: {
    color: "#FFFFFF",
    marginLeft: 6,
  },
  fabButton: {
    borderRadius: 30,
    width: 60,
    height: 60,
    overflow: "hidden",
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  scanButton: {
    position: "absolute",
    right: 16,
    bottom: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  scanGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  filterModal: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#B06AB3",
    marginTop: 16,
    marginBottom: 8,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4568DC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioFilled: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#4568DC",
  },
  radioLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  applyButton: {
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 16,
  },
  applyButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ManageBooksScreen;
