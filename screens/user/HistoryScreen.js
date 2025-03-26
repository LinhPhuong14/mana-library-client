import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabView, TabBar } from "react-native-tab-view";
import { useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../../services/demo/dataService";

const HistoryScreen = ({ navigation }) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "borrowed", title: "Current Loans" },
    { key: "returned", title: "Returned" },
    { key: "all", title: "All History" },
  ]);

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Get current user
      const userData = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);

      if (!userData) {
        navigation.navigate("Auth", { screen: "Login" });
        return;
      }

      const user = JSON.parse(userData);
      setCurrentUser(user);

      // Load books data
      const allBooks = await dataService.getBooks();

      // Get books currently borrowed by this user
      const currentlyBorrowed = allBooks.filter((book) => book.copies && book.copies.some((copy) => copy.borrowedBy === user.id));

      // Enhance borrowed books with library information
      const libraries = await dataService.getLibraries();
      const enhancedBorrowed = await Promise.all(
        currentlyBorrowed.map(async (book) => {
          const library = libraries.find((lib) => lib.id === book.libraryId);
          const borrowedCopy = book.copies.find((copy) => copy.borrowedBy === user.id);

          return {
            ...book,
            libraryName: library?.name || "Unknown Library",
            borrowDate: borrowedCopy?.borrowDate || null,
            dueDate: borrowedCopy?.dueDate || null,
          };
        })
      );

      setBorrowedBooks(enhancedBorrowed);

      // Get all transactions for this user
      const transactions = await dataService.getTransactions({ userId: user.id });

      // Get returned books transactions
      const returnTransactions = transactions.filter((t) => t.type === "return");

      // Get book details for returned books
      const returnedBooksData = await Promise.all(
        returnTransactions.map(async (transaction) => {
          const book = allBooks.find((b) => b.id === transaction.bookId);
          const library = libraries.find((lib) => lib.id === book?.libraryId);

          return {
            ...transaction,
            book: book || { title: "Unknown Book", author: "Unknown Author" },
            libraryName: library?.name || "Unknown Library",
          };
        })
      );

      setReturnedBooks(returnedBooksData);

      // Enhance all transactions with book and library data
      const enhancedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const book = allBooks.find((b) => b.id === transaction.bookId);
          const library = libraries.find((lib) => lib.id === book?.libraryId);

          return {
            ...transaction,
            book: book || { title: "Unknown Book", author: "Unknown Author" },
            libraryName: library?.name || "Unknown Library",
          };
        })
      );

      // Sort transactions by date (newest first)
      enhancedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setAllTransactions(enhancedTransactions);
    } catch (error) {
      console.error("Error loading history data:", error);
    } finally {
      setLoading(false);
    }
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

  const getTransactionIcon = (type) => {
    switch (type) {
      case "borrow":
        return { name: "log-out-outline", color: "#4568DC" };
      case "return":
        return { name: "log-in-outline", color: "#22c55e" };
      case "reservation":
        return { name: "time-outline", color: "#f97316" };
      case "fine":
        return { name: "warning-outline", color: "#ef4444" };
      default:
        return { name: "ellipsis-horizontal", color: "#757575" };
    }
  };

  const navigateToBookDetail = (bookId) => {
    navigation.navigate("BookDetail", { bookId });
  };

  const renderCurrentlyBorrowed = () => (
    <FlatList
      data={borrowedBooks}
      keyExtractor={(item) => `borrowed-${item.id}`}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons
            name="book-outline"
            size={60}
            color="#757575"
          />
          <Text style={styles.emptyStateText}>You don't have any books borrowed right now</Text>
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
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.bookCard}
          onPress={() => navigateToBookDetail(item.id)}
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
                <Text style={styles.bookAuthor}>{item.author}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.dueDate) + "30" }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.dueDate) }]}>{item.dueDate ? `Due: ${formatDate(item.dueDate)}` : "No due date"}</Text>
              </View>
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
                <Text style={styles.detailText}>From: {item.libraryName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#B06AB3"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>Borrowed: {formatDate(item.borrowDate)}</Text>
              </View>

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
      )}
    />
  );

  const renderReturned = () => (
    <FlatList
      data={returnedBooks}
      keyExtractor={(item) => `returned-${item.id}`}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons
            name="checkmark-circle-outline"
            size={60}
            color="#757575"
          />
          <Text style={styles.emptyStateText}>You haven't returned any books yet</Text>
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
              <Text style={styles.exploreButtonText}>Browse Libraries</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.bookCard}
          onPress={() => item.book?.id && navigateToBookDetail(item.book.id)}
        >
          <LinearGradient
            colors={["#2A2A2A", "#333333"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookCardGradient}
          >
            <View style={styles.bookHeader}>
              <View>
                <Text style={styles.bookTitle}>{item.book.title}</Text>
                <Text style={styles.bookAuthor}>{item.book.author}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: "#22c55e30" }]}>
                <Text style={[styles.statusText, { color: "#22c55e" }]}>Returned</Text>
              </View>
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
                <Text style={styles.detailText}>From: {item.libraryName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#B06AB3"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>Returned: {formatDate(item.date)}</Text>
              </View>

              {item.book?.category && (
                <View style={styles.detailRow}>
                  <Ionicons
                    name="bookmark-outline"
                    size={16}
                    color="#B06AB3"
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>Category: {item.book.category}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    />
  );

  const renderAllHistory = () => (
    <FlatList
      data={allTransactions}
      keyExtractor={(item) => `transaction-${item.id}`}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons
            name="time-outline"
            size={60}
            color="#757575"
          />
          <Text style={styles.emptyStateText}>No transaction history found</Text>
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
              <Text style={styles.exploreButtonText}>Start Exploring</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => {
        const icon = getTransactionIcon(item.type);
        return (
          <TouchableOpacity
            style={styles.transactionCard}
            onPress={() => {
              if (item.book?.id) {
                navigateToBookDetail(item.book.id);
              }
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: icon.color + "20" }]}>
              <Ionicons
                name={icon.name}
                size={20}
                color={icon.color}
              />
            </View>

            <View style={styles.transactionContent}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
                <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
              </View>

              <Text style={styles.bookTitle}>{item.book?.title}</Text>
              <Text style={styles.bookAuthor}>{item.book?.author}</Text>

              {item.amount > 0 && (
                <View style={styles.detailRow}>
                  <Ionicons
                    name="cash-outline"
                    size={16}
                    color="#ef4444"
                    style={styles.detailIcon}
                  />
                  <Text style={styles.fineAmount}>${item.amount.toFixed(2)}</Text>
                </View>
              )}

              <View style={styles.transactionFooter}>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="library-outline"
                    size={14}
                    color="#B06AB3"
                    style={styles.detailIcon}
                  />
                  <Text style={styles.libraryName}>{item.libraryName}</Text>
                </View>

                {item.status && (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: item.status === "completed" ? "#22c55e30" : item.status === "active" ? "#4568DC30" : item.status === "pending" ? "#f9731630" : "#75757530",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: item.status === "completed" ? "#22c55e" : item.status === "active" ? "#4568DC" : item.status === "pending" ? "#f97316" : "#757575",
                        },
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "borrowed":
        return renderCurrentlyBorrowed();
      case "returned":
        return renderReturned();
      case "all":
        return renderAllHistory();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
          <Text style={styles.loadingText}>Loading history...</Text>
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
          <Text style={styles.headerTitle}>Transaction History</Text>
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              indicatorStyle={{ backgroundColor: "#B06AB3" }}
              style={styles.tabBar}
              activeColor="#B06AB3"
              inactiveColor="#757575"
              labelStyle={styles.tabLabel}
            />
          )}
        />
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
  tabBar: {
    backgroundColor: "#1E1E1E",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  tabLabel: {
    fontWeight: "bold",
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
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
  transactionCard: {
    flexDirection: "row",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  transactionDate: {
    fontSize: 12,
    color: "#757575",
  },
  fineAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ef4444",
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  libraryName: {
    fontSize: 12,
    color: "#BBBBBB",
  },
});

export default HistoryScreen;
