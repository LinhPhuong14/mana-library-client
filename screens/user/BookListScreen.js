import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../../services/demo/dataService";

const BookListScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("borrowed");
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [reservedBooks, setReservedBooks] = useState([]);
  const [libraries, setLibraries] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const checkUserAndLoadBooks = async () => {
      try {
        setLoading(true);

        // Get current user from storage
        const userData = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);
        const user = userData ? JSON.parse(userData) : null;
        setUser(user);

        // Load libraries for displaying names
        const allLibraries = await dataService.getLibraries();
        setLibraries(allLibraries);

        if (user) {
          // Load user's books
          await loadUserBooks(user.id);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndLoadBooks();
  }, []);

  const loadUserBooks = async (userId) => {
    try {
      // Get all books
      const allBooks = await dataService.getBooks();

      // Find borrowed books by checking copy.borrowedBy
      const borrowed = allBooks.filter((book) => book.copies && book.copies.some((copy) => copy.borrowedBy === userId));

      // Find reserved books
      const reserved = allBooks.filter((book) => book.reservedBy && book.reservedBy.includes(userId));

      setBorrowedBooks(borrowed);
      setReservedBooks(reserved);
    } catch (error) {
      console.error("Error loading books:", error);
    }
  };

  const getLibraryName = (libraryId) => {
    const library = libraries.find((lib) => lib.id === libraryId);
    return library?.name || "Unknown Library";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getStatusColor = (dueDate) => {
    if (!dueDate) return "#757575";

    const now = new Date();
    const due = new Date(dueDate);

    if (due < now) {
      return "#ef4444"; // Overdue - red
    }

    // Calculate days until due
    const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= 3) {
      return "#f97316"; // Soon due - orange
    }

    return "#22c55e"; // Good - green
  };

  const navigateToLogin = () => {
    // Navigate to login screen
    navigation.navigate("Auth", {
      screen: "Login",
    });
  };

  const renderBookItem = ({ item }) => {
    const borrowedCopy = item.copies?.find((copy) => copy.borrowedBy === user?.id);
    const dueDate = borrowedCopy?.dueDate;
    const borrowDate = borrowedCopy?.borrowDate;
    const statusColor = getStatusColor(dueDate);

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
      >
        <LinearGradient
          colors={["#2A2A2A", "#333333"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bookCardGradient}
        >
          <View style={styles.bookHeader}>
            <View>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>by {item.author}</Text>
            </View>

            {activeTab === "borrowed" && dueDate && (
              <View style={[styles.statusBadge, { backgroundColor: statusColor + "30" }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>Due: {formatDate(dueDate)}</Text>
              </View>
            )}

            {activeTab === "reserved" && (
              <View style={[styles.statusBadge, { backgroundColor: "#4568DC30" }]}>
                <Text style={[styles.statusText, { color: "#4568DC" }]}>Reserved</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.bookDetails}>
            <View style={styles.detailRow}>
              <Ionicons
                name="library-outline"
                size={16}
                color="#B06AB3"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>From: {getLibraryName(item.libraryId)}</Text>
            </View>

            {activeTab === "borrowed" && borrowDate && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#B06AB3"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>Borrowed: {formatDate(borrowDate)}</Text>
              </View>
            )}

            {item.category && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="bookmark-outline"
                  size={16}
                  color="#B06AB3"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>Category: {item.category}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderLoginView = () => (
    <View style={styles.loginContainer}>
      <Ionicons
        name="library-outline"
        size={80}
        color="#B06AB3"
      />
      <Text style={styles.loginText}>Sign in to view your books</Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={navigateToLogin}
      >
        <LinearGradient
          colors={["#4568DC", "#B06AB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderTabSelector = () => (
    <View style={styles.tabSelector}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "borrowed" && styles.activeTab]}
        onPress={() => setActiveTab("borrowed")}
      >
        <Text style={[styles.tabText, activeTab === "borrowed" && styles.activeTabText]}>Borrowed</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "reserved" && styles.activeTab]}
        onPress={() => setActiveTab("reserved")}
      >
        <Text style={[styles.tabText, activeTab === "reserved" && styles.activeTabText]}>Reserved</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyBookList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={activeTab === "borrowed" ? "book-outline" : "time-outline"}
        size={60}
        color="#757575"
      />
      <Text style={styles.emptyText}>{activeTab === "borrowed" ? "You don't have any books borrowed right now" : "You don't have any book reservations"}</Text>

      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate("Discovery")}
      >
        <LinearGradient
          colors={["#4568DC", "#B06AB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.exploreButtonText}>Discover Libraries</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
          <Text style={styles.loadingText}>Loading your books...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
          <Text style={styles.headerTitle}>My Books</Text>
        </View>

        {user ? (
          <>
            {renderTabSelector()}

            <FlatList
              data={activeTab === "borrowed" ? borrowedBooks : reservedBooks}
              keyExtractor={(item) => item.id}
              renderItem={renderBookItem}
              contentContainerStyle={styles.booksList}
              ListEmptyComponent={renderEmptyBookList}
            />
          </>
        ) : (
          renderLoginView()
        )}
      </View>
    </SafeAreaView>
  );
};

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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 16,
    fontSize: 16,
  },
  tabSelector: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#4568DC",
  },
  tabText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: "bold",
  },
  booksList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  bookCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  bookCardGradient: {
    padding: 16,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#B06AB3",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#3A3A3A",
    marginVertical: 12,
  },
  bookDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#BBBBBB",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#757575",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  exploreButton: {
    width: "70%",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 16,
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 16,
    marginBottom: 32,
    textAlign: "center",
  },
  loginButton: {
    width: "80%",
    borderRadius: 8,
    overflow: "hidden",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BookListScreen;
