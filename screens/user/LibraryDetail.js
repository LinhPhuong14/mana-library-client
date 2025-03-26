import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../../services/demo/dataService";
import { useFocusEffect } from "@react-navigation/native";

const LibraryDetailScreen = ({ navigation, route }) => {
  const { libraryId } = route.params;
  const [library, setLibrary] = useState(null);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [owner, setOwner] = useState(null);
  const [libraryStats, setLibraryStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    categories: [],
  });

  useEffect(() => {
    const checkUserLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error checking user login status:", error);
      }
    };

    checkUserLoginStatus();
  }, []);

  // Use the useFocusEffect hook to refresh data whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadLibraryDetails = async () => {
        try {
          setLoading(true);

          // Initialize demo data if needed
          await dataService.initializeDemoData();

          // Get library details
          const libraryData = await dataService.getLibrary(libraryId);
          setLibrary(libraryData || {});

          // Get owner details if owner ID exists
          if (libraryData && libraryData.owner) {
            const ownerData = await dataService.getUser(libraryData.owner);
            setOwner(ownerData);
          }

          // Get books from this library
          const libraryBooks = await dataService.getBooks(libraryId);
          setBooks(libraryBooks || []);
          setFilteredBooks(libraryBooks || []);

          // Calculate library stats
          if (libraryBooks && libraryBooks.length > 0) {
            let availableCount = 0;
            const categorySet = new Set(["All"]);

            libraryBooks.forEach((book) => {
              if (book.category) categorySet.add(book.category);
              if (book.copies) {
                availableCount += book.copies.filter((copy) => !copy.borrowedBy).length;
              }
            });

            setLibraryStats({
              totalBooks: libraryBooks.length,
              availableBooks: availableCount,
              categories: Array.from(categorySet),
            });
          }

          setLoading(false);
        } catch (err) {
          console.error("Failed to load library details:", err);
          setError("Failed to load library details");
          setLoading(false);
        }
      };

      loadLibraryDetails();
      return () => {}; // Cleanup if needed
    }, [libraryId])
  );

  useEffect(() => {
    // Apply filtering based on search query and category
    let filtered = [...books];

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((book) => book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((book) => book.category === selectedCategory);
    }

    setFilteredBooks(filtered);
  }, [searchQuery, selectedCategory, books]);

  const navigateToBookDetail = (book) => {
    navigation.navigate("BookDetail", { book });
  };

  const getAvailableCopies = (book) => {
    if (!book.copies) return 0;
    return book.copies.filter((copy) => !copy.borrowedBy).length;
  };

  const handleBorrow = async (bookId) => {
    if (!currentUser) {
      navigateToLogin();
      return;
    }

    try {
      // Get the book
      const book = books.find((b) => b.id === bookId);
      if (!book) {
        Alert.alert("Error", "Book not found");
        return;
      }

      // Find an available copy
      const availableCopy = book.copies.find((copy) => !copy.borrowedBy);
      if (!availableCopy) {
        Alert.alert("Not Available", "This book is currently unavailable for borrowing");
        return;
      }

      Alert.alert("Borrow Book", "Do you want to borrow this book?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Borrow",
          onPress: async () => {
            try {
              // Borrow the book
              const result = await dataService.borrowBook(bookId, currentUser.id, availableCopy.id);

              // Update local state
              const updatedBooks = books.map((b) => (b.id === bookId ? result.book : b));

              setBooks(updatedBooks);

              // Recalculate total available copies
              let totalAvailable = 0;
              updatedBooks.forEach((book) => {
                if (book.copies) {
                  totalAvailable += book.copies.filter((copy) => !copy.borrowedBy).length;
                }
              });

              setLibraryStats((prev) => ({
                ...prev,
                availableBooks: totalAvailable,
              }));

              // Update filtered books too
              setFilteredBooks((prev) => prev.map((b) => (b.id === bookId ? result.book : b)));

              Alert.alert("Success", "Book has been borrowed successfully");
            } catch (error) {
              console.error("Borrow error:", error);
              Alert.alert("Error", error.message || "Failed to borrow the book");
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to process your request");
    }
  };

  const navigateToLogin = () => {
    navigation.navigate("Auth", { screen: "Login" });
  };

  const renderLoginPrompt = () => (
    <View style={styles.loginPromptContainer}>
      <Ionicons
        name="log-in-outline"
        size={50}
        color="#B06AB3"
      />
      <Text style={styles.loginPromptText}>Log in to borrow books from this library</Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={navigateToLogin}
      >
        <LinearGradient
          colors={["#4568DC", "#B06AB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loginButtonGradient}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderBookCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.bookCard}
      onPress={() => navigateToBookDetail(item)}
    >
      <View style={styles.bookCardContent}>
        <View style={styles.coverContainer}>
          {item.coverImage ? (
            <Image
              source={{ uri: item.coverImage }}
              style={styles.coverImage}
              defaultSource={require("../../assets/book-placeholder.png")}
            />
          ) : (
            <View style={styles.placeholderCover}>
              <Feather
                name="book"
                size={30}
                color="#FFFFFF"
              />
            </View>
          )}
        </View>

        <View style={styles.bookInfo}>
          <View>
            <Text
              style={styles.bookTitle}
              numberOfLines={2}
            >
              {item.title || "Untitled Book"}
            </Text>
            <Text style={styles.bookAuthor}>by {item.author || "Unknown Author"}</Text>
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
            )}
          </View>

          <View>
            <View style={styles.bookStats}>
              <Text style={styles.availabilityText}>
                {getAvailableCopies(item)}/{item.copies?.length || 0} copies available
              </Text>
            </View>

            {currentUser ? (
              <TouchableOpacity
                style={[styles.borrowButton, getAvailableCopies(item) === 0 && styles.disabledButton]}
                onPress={() => handleBorrow(item.id)}
                disabled={getAvailableCopies(item) === 0}
              >
                <Text style={styles.borrowButtonText}>{getAvailableCopies(item) > 0 ? "Borrow" : "Unavailable"}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
          <Text style={styles.loadingText}>Loading library details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Library Header */}
        <LinearGradient
          colors={["#4568DC", "#B06AB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
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
            <Text style={styles.headerTitle}>{library?.name || "Unnamed Library"}</Text>
          </View>
          <Text style={styles.libraryDescription}>{library?.description || "No description available"}</Text>
          <View style={styles.libraryInfoRow}>
            <Feather
              name="map-pin"
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.libraryInfo}>{library?.location || "No location specified"}</Text>
          </View>
          <View style={styles.libraryInfoRow}>
            <Feather
              name={library?.isPublic ? "globe" : "lock"}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.libraryInfo}>{library?.isPublic ? "Public Library" : "Private Library"}</Text>
          </View>
          <View style={styles.libraryInfoRow}>
            <Feather
              name="user"
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.libraryInfo}>Owner: {owner ? owner.name : "Unknown"}</Text>
          </View>
        </LinearGradient>

        {/* Library Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons
              name="book-outline"
              size={22}
              color="#B06AB3"
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>{libraryStats.totalBooks}</Text>
            <Text style={styles.statLabel}>Books</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons
              name="bookmark-outline"
              size={22}
              color="#22c55e"
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>{libraryStats.availableBooks}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons
              name="people-outline"
              size={22}
              color="#4568DC"
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>{library?.visits || 0}</Text>
            <Text style={styles.statLabel}>Visitors</Text>
          </View>
        </View>

        {/* Login Prompt if Not Logged In */}
        {!currentUser && renderLoginPrompt()}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color="#757575"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            placeholderTextColor="#757575"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather
                name="x"
                size={20}
                color="#757575"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {libraryStats.categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryPill, selectedCategory === category && styles.selectedCategoryPill]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Books List */}
        <View style={styles.booksSection}>
          <Text style={styles.sectionTitle}>Available Books {filteredBooks.length > 0 && `(${filteredBooks.length})`}</Text>

          {filteredBooks.length > 0 ? (
            filteredBooks.map((item) => renderBookCard(item))
          ) : (
            <View style={styles.emptyContainer}>
              <Feather
                name="search"
                size={50}
                color="#757575"
              />
              <Text style={styles.emptyText}>{searchQuery || selectedCategory !== "All" ? "No books match your search criteria" : "No books available in this library"}</Text>
              {(searchQuery || selectedCategory !== "All") && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  <Text style={styles.clearButtonText}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ...existing styles remain unchanged
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  libraryDescription: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 15,
    opacity: 0.9,
  },
  libraryInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  libraryInfo: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 8,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: -20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#BBBBBB",
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "#333",
    marginHorizontal: 10,
  },
  loginPromptContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    alignItems: "center",
  },
  loginPromptText: {
    color: "#BBBBBB",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  loginButton: {
    width: "80%",
    borderRadius: 8,
    overflow: "hidden",
  },
  loginButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    margin: 20,
    marginTop: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    height: 40,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    marginRight: 10,
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
  booksSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  bookCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  bookCardContent: {
    padding: 15,
    flexDirection: "row",
  },
  coverContainer: {
    marginRight: 15,
  },
  coverImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  placeholderCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  bookInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#B06AB3",
    marginTop: 5,
  },
  categoryBadge: {
    backgroundColor: "rgba(176, 106, 179, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  categoryBadgeText: {
    color: "#B06AB3",
    fontSize: 12,
  },
  bookStats: {
    marginTop: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: "#BBBBBB",
  },
  borrowButton: {
    backgroundColor: "#4568DC",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: "center",
    marginTop: 10,
    alignSelf: "flex-start",
  },
  disabledButton: {
    backgroundColor: "#3A3A3A",
  },
  borrowButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#757575",
    fontSize: 16,
    textAlign: "center",
    marginTop: 15,
  },
  clearButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  clearButtonText: {
    color: "#4568DC",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#E0E0E0",
    marginTop: 15,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    textAlign: "center",
  },
});

export default LibraryDetailScreen;
