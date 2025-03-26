import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../../services/demo/dataService";
import { useFocusEffect } from "@react-navigation/native";

const BookDetailScreen = ({ navigation, route }) => {
  const { book, bookId } = route.params;
  const [bookData, setBookData] = useState(book || null);
  const [loading, setLoading] = useState(!book && bookId);
  const [isBorrowed, setIsBorrowed] = useState(false);
  const [availableCopies, setAvailableCopies] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [dueDate, setDueDate] = useState(null);
  const [library, setLibrary] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Use useFocusEffect to refresh data when the screen gets focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchBookData = async () => {
        try {
          // Check if user is logged in
          const userData = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);
          if (userData) {
            const user = JSON.parse(userData);
            setCurrentUser(user);

            // Check if user has favorited this book
            if (user.favorites && user.favorites.includes(bookId || (book && book.id))) {
              setIsFavorite(true);
            }
          }

          let fetchedBook = book;

          // If we only have bookId, fetch book data
          if (!fetchedBook && bookId) {
            setLoading(true);
            fetchedBook = await dataService.getBook(bookId);
            if (!fetchedBook) {
              throw new Error("Book not found");
            }
          } else if (bookId) {
            // If we're returning to this screen, get fresh book data
            fetchedBook = await dataService.getBook(bookId);
          }

          setBookData(fetchedBook);

          // Calculate available copies
          if (fetchedBook.copies) {
            const available = fetchedBook.copies.filter((copy) => !copy.borrowedBy).length;
            setAvailableCopies(available);

            // Check if current user has borrowed this book
            if (currentUser && fetchedBook.copies.some((copy) => copy.borrowedBy === currentUser.id)) {
              setIsBorrowed(true);

              // Find due date
              const userCopy = fetchedBook.copies.find((copy) => copy.borrowedBy === currentUser.id);
              if (userCopy && userCopy.dueDate) {
                setDueDate(new Date(userCopy.dueDate));
              }
            } else {
              setIsBorrowed(false);
              setDueDate(null);
            }
          }

          // Get library data
          if (fetchedBook.libraryId) {
            const libraryData = await dataService.getLibrary(fetchedBook.libraryId);
            setLibrary(libraryData);
          }

          setLoading(false);
        } catch (error) {
          console.error("Error fetching book details:", error);
          setLoading(false);
        }
      };

      fetchBookData();
      return () => {}; // Clean up if needed
    }, [bookId, book?.id])
  );

  const toggleBorrowStatus = async () => {
    if (!currentUser) {
      navigateToLogin();
      return;
    }

    if (isBorrowed) {
      // Return book functionality
      Alert.alert("Return Book", "Do you want to return this book?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Return",
          onPress: async () => {
            try {
              // Find the copy that is borrowed by the current user
              const borrowedCopy = bookData.copies.find((copy) => copy.borrowedBy === currentUser.id);

              if (!borrowedCopy) {
                Alert.alert("Error", "Could not identify which copy you borrowed");
                return;
              }

              // Use the dataService to return the book
              const result = await dataService.returnBook(bookData.id, currentUser.id, borrowedCopy.id);

              // Check if there was a fine
              if (result && result.fine) {
                Alert.alert("Fine Issued", `Your book was returned late. A fine of $${result.fine.amount.toFixed(2)} has been issued.`);
              }

              // Update UI
              setIsBorrowed(false);
              setAvailableCopies((prev) => prev + 1);
              setDueDate(null);

              // Refresh book data to ensure we have the latest state
              const updatedBook = await dataService.getBook(bookData.id);
              setBookData(updatedBook);

              // Signal to the Library screen that data should be refreshed
              navigation.setParams({ refresh: true });

              Alert.alert("Success", "Book has been returned successfully");
            } catch (error) {
              console.error("Return error:", error);
              Alert.alert("Error", `Failed to return the book: ${error.message || "Unknown error"}`);
            }
          },
        },
      ]);
    } else {
      // Borrow book functionality
      if (availableCopies === 0) {
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
              // Find an available copy
              const availableCopy = bookData.copies.find((copy) => !copy.borrowedBy);

              if (!availableCopy) {
                Alert.alert("Error", "No available copies found");
                return;
              }

              // Use the dataService to borrow the book
              const result = await dataService.borrowBook(bookData.id, currentUser.id, availableCopy.id);

              // Update UI
              setIsBorrowed(true);
              setAvailableCopies((prev) => prev - 1);

              // Set due date from the result
              const borrowedCopy = result.book.copies.find((copy) => copy.borrowedBy === currentUser.id);
              if (borrowedCopy && borrowedCopy.dueDate) {
                setDueDate(new Date(borrowedCopy.dueDate));
              }

              // Refresh book data
              setBookData(result.book);

              // Signal to the Library screen that data should be refreshed
              navigation.setParams({ refresh: true });

              Alert.alert("Success", "Book has been borrowed successfully");
            } catch (error) {
              console.error("Borrow error:", error);
              Alert.alert("Error", `Failed to borrow the book: ${error.message || "Unknown error"}`);
            }
          },
        },
      ]);
    }
  };

  const toggleFavorite = () => {
    if (!currentUser) {
      navigateToLogin();
      return;
    }

    setIsFavorite(!isFavorite);

    // Update user favorites in AsyncStorage
    const updateFavorites = async () => {
      try {
        const userData = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);
        if (userData) {
          const user = JSON.parse(userData);

          let favorites = user.favorites || [];
          const bookIdentifier = bookData.id;

          if (isFavorite) {
            // Remove from favorites
            favorites = favorites.filter((id) => id !== bookIdentifier);
          } else {
            // Add to favorites if not already there
            if (!favorites.includes(bookIdentifier)) {
              favorites.push(bookIdentifier);
            }
          }

          // Update user data
          user.favorites = favorites;
          await AsyncStorage.setItem(dataService.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

          // Update users array as well
          await dataService.updateUser(user.id, { favorites });
        }
      } catch (error) {
        console.error("Error updating favorites:", error);
      }
    };

    updateFavorites();
  };

  const navigateToLogin = () => {
    navigation.navigate("Auth", { screen: "Login" });
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get current reservation status
  const getReservationStatus = () => {
    if (!bookData || !bookData.reservedBy) return 0;
    return bookData.reservedBy.length;
  };

  // Function to render the login prompt
  const renderLoginPrompt = () => (
    <View style={styles.loginPromptContainer}>
      <Ionicons
        name="book-outline"
        size={50}
        color="#B06AB3"
      />
      <Text style={styles.loginPromptText}>Log in to borrow, reserve or save this book</Text>
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
          <Text style={styles.loadingText}>Loading book details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bookData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Book not found or an error occurred.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>Book Details</Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#FF6B6B" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bookHeader}>
          <View style={styles.coverContainer}>
            {bookData.coverImage ? (
              <Image
                source={{ uri: bookData.coverImage }}
                style={styles.coverImage}
                defaultSource={require("../../assets/book-placeholder.png")}
              />
            ) : (
              <View style={styles.placeholderCover}>
                <Feather
                  name="book"
                  size={40}
                  color="#FFFFFF"
                />
              </View>
            )}
          </View>

          <View style={styles.bookTitleContainer}>
            <Text style={styles.title}>{bookData.title || "Unknown Title"}</Text>
            <Text style={styles.author}>by {bookData.author || "Unknown Author"}</Text>

            {bookData.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{bookData.category}</Text>
              </View>
            )}

            <Text style={styles.libraryText}>{library ? `From: ${library.name}` : ""}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={styles.statValue}>{availableCopies > 0 ? "Available" : "Unavailable"}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Copies</Text>
            <Text style={styles.statValue}>
              {availableCopies}/{bookData.copies ? bookData.copies.length : 0}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Reservations</Text>
            <Text style={styles.statValue}>{getReservationStatus()}</Text>
          </View>
        </View>

        {dueDate && currentUser && (
          <View style={styles.dueDateContainer}>
            <Ionicons
              name="alarm-outline"
              size={20}
              color="#f97316"
            />
            <Text style={styles.dueDateText}>Due Date: {formatDate(dueDate)}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{bookData.description || "No description available for this book."}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ISBN:</Text>
            <Text style={styles.detailValue}>{bookData.isbn || "Not available"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Publisher:</Text>
            <Text style={styles.detailValue}>{bookData.publisher || "Unknown"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Year:</Text>
            <Text style={styles.detailValue}>{bookData.publishYear || "Unknown"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pages:</Text>
            <Text style={styles.detailValue}>{bookData.pages || "Unknown"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Language:</Text>
            <Text style={styles.detailValue}>{bookData.language || "Unknown"}</Text>
          </View>
        </View>

        {/* Either show the login prompt or the action buttons */}
        {!currentUser ? (
          renderLoginPrompt()
        ) : (
          <View style={styles.buttonContainer}>
            {!isBorrowed ? (
              <TouchableOpacity
                style={[styles.actionButton, availableCopies === 0 && styles.disabledButton]}
                onPress={toggleBorrowStatus}
                disabled={availableCopies === 0}
              >
                <LinearGradient
                  colors={["#4568DC", "#B06AB3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Feather
                    name="book"
                    size={18}
                    color="#FFFFFF"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>{availableCopies > 0 ? "Borrow Book" : "Currently Unavailable"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={toggleBorrowStatus}
              >
                <LinearGradient
                  colors={["#22c55e", "#15803d"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Feather
                    name="check-circle"
                    size={18}
                    color="#FFFFFF"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Return Book</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {!isBorrowed && availableCopies === 0 && (
              <TouchableOpacity
                style={styles.reserveButton}
                onPress={async () => {
                  try {
                    const result = await dataService.reserveBook(bookData.id, currentUser.id);
                    setBookData(result.book);

                    // Signal to the Library screen that data should be refreshed
                    navigation.setParams({ refresh: true });

                    Alert.alert("Success", "Book reserved successfully!");
                  } catch (error) {
                    Alert.alert("Error", error.message || "Failed to reserve book");
                  }
                }}
              >
                <LinearGradient
                  colors={["#f59e0b", "#d97706"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Feather
                    name="clock"
                    size={18}
                    color="#FFFFFF"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Reserve Book</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ...existing styles unchanged
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  backButton: {
    padding: 5,
  },
  favoriteButton: {
    padding: 5,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#E0E0E0",
    marginTop: 15,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4568DC",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  bookHeader: {
    flexDirection: "row",
    marginBottom: 25,
  },
  coverContainer: {
    marginRight: 15,
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  placeholderCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  bookTitleContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  author: {
    fontSize: 16,
    color: "#B06AB3",
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: "rgba(176, 106, 179, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  categoryText: {
    color: "#B06AB3",
    fontSize: 12,
  },
  libraryText: {
    fontSize: 14,
    color: "#B0B0B0",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    color: "#B0B0B0",
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  dueDateText: {
    color: "#f97316",
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#E0E0E0",
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 16,
    color: "#B0B0B0",
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  loginPromptContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginVertical: 20,
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
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  actionButton: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
  },
  borrowButton: {
    backgroundColor: "#4568DC",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  returnButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  reserveButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  disabledButton: {
    opacity: 0.6,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BookDetailScreen;
