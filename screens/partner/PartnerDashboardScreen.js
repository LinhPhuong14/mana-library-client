import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../../services/demo/dataService";

const PartnerDashboardScreen = ({ navigation }) => {
  const [libraries, setLibraries] = useState([]);
  const [books, setBooks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalBorrowings, setTotalBorrowings] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [userName, setUserName] = useState("Partner");
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPartnerMChen, setIsPartnerMChen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Initialize demo data if not already initialized
        await dataService.initializeDemoData();

        // Get current user from AsyncStorage (set during login)
        const userDataStr = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);

        if (!userDataStr) {
          console.error("No user data found in storage");
          Alert.alert("Error", "User session not found. Please login again.");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
          return;
        }

        const userData = JSON.parse(userDataStr);

        // Set user state from storage
        setUserName(userData.name);
        setUserId(userData.id);
        setIsPartnerMChen(userData.id === "user5");

        // Load libraries owned by the partner
        const allLibraries = await dataService.getLibraries();
        const partnerLibraries = allLibraries.filter((lib) => lib.owner === userData.id);
        setLibraries(partnerLibraries);

        // Load books in those libraries
        const allBooks = await dataService.getBooks();
        const partnerBooks = allBooks.filter((book) => partnerLibraries.some((lib) => lib.id === book.libraryId));
        setBooks(partnerBooks);

        // Calculate statistics
        setTotalBooks(partnerBooks.length);

        // Calculate borrowings
        let borrowedCount = 0;
        let pendingAmount = 0;

        partnerBooks.forEach((book) => {
          if (book.copies) {
            borrowedCount += book.copies.filter((copy) => copy.borrowedBy).length;
          }
        });
        setTotalBorrowings(borrowedCount);

        // Load transactions (for payments/activities)
        const transactions = await dataService.getTransactions();
        const partnerTransactions = transactions.filter((tx) => partnerBooks.some((book) => book.id === tx.bookId));

        // Calculate pending payments
        pendingAmount = partnerTransactions.filter((tx) => tx.status === "pending" && tx.type === "fine").reduce((sum, tx) => sum + tx.amount, 0);
        setPendingPayments(pendingAmount.toFixed(2));

        // Generate activities from transactions and borrowings
        const recentActivities = [];

        // Add activities from transactions
        partnerTransactions.slice(0, 10).forEach((tx) => {
          // Find related book
          const book = partnerBooks.find((b) => b.id === tx.bookId);

          recentActivities.push({
            id: `tx-${tx.id}`,
            type: tx.type === "fine" ? "payment" : tx.type,
            bookId: tx.bookId,
            bookTitle: book ? book.title : "Unknown Book",
            userId: tx.userId,
            user: "User", // We'll update this
            amount: tx.amount,
            date: tx.date || new Date().toISOString(),
            libraryId: book ? book.libraryId : null,
            copyId: tx.copyId,
          });
        });

        // Sort by date descending
        recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Load user names for the activities
        const users = await dataService.getUsers();
        recentActivities.forEach((activity) => {
          const user = users.find((u) => u.id === activity.userId);
          if (user) {
            activity.user = user.name || "User " + activity.userId.substring(4);
          }
        });

        setActivities(recentActivities.slice(0, 5)); // Just take the 5 most recent
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        Alert.alert("Error", "Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Generate library statistics
  const getLibraryStats = (libraryId) => {
    const libraryBooks = books.filter((book) => book.libraryId === libraryId);
    let borrowedCount = 0;
    let pendingPaymentsCount = 0;

    libraryBooks.forEach((book) => {
      if (book.copies) {
        borrowedCount += book.copies.filter((copy) => copy.borrowedBy).length;
      }
    });

    return {
      totalBooks: libraryBooks.length,
      activeBorrowings: borrowedCount,
      pendingPayments: pendingPaymentsCount.toFixed(2),
    };
  };

  // Navigation functions
  const navigateToProfile = () => {
    navigation.navigate("Profile");
  };

  const navigateToAddLibrary = () => {
    navigation.navigate("AddLibrary");
  };

  const navigateToManageLibrary = (libraryId, initialTab = "books") => {
    if (!libraryId && libraries.length > 0) {
      libraryId = libraries[0].id;
    }

    if (!libraryId) {
      Alert.alert("No Libraries", "You need to create a library first.");
      return;
    }

    navigation.navigate("ManageLibrary", { libraryId, initialTab });
  };

  const navigateToPayments = () => {
    if (libraries.length > 0) {
      navigation.navigate("ManageLibrary", {
        libraryId: libraries[0].id,
        initialTab: "fines",
      });
    } else {
      Alert.alert("No Libraries", "You need to create a library first to manage payments.");
    }
  };

  const navigateToOverdueItems = () => {
    if (libraries.length > 0) {
      navigation.navigate("ManageLibrary", {
        libraryId: libraries[0].id,
        initialTab: "transactions",
      });
    } else {
      Alert.alert("No Libraries", "You need to create a library first to view overdue items.");
    }
  };

  const navigateToTransactionHistory = () => {
    navigation.navigate("TransactionHistory");
  };

  const navigateToViewBorrower = (userId, bookId, copyId) => {
    if (!userId || !bookId || !copyId) {
      Alert.alert("Missing Information", "Cannot view borrower details with incomplete information.");
      return;
    }

    navigation.navigate("ViewBorrower", { userId, bookId, copyId });
  };

  const handleActivityPress = (item) => {
    try {
      if (item.type === "borrow" || item.type === "return") {
        // If we have all required information, navigate to borrower details
        if (item.copyId && item.userId && item.bookId) {
          navigateToViewBorrower(item.userId, item.bookId, item.copyId);
        } else if (item.userId && item.bookId) {
          // If copyId is missing, try to find it from the book's copies
          const book = books.find((b) => b.id === item.bookId);
          if (book && book.copies) {
            // Find a copy borrowed by this user
            const copy = book.copies.find((c) => c.borrowedBy === item.userId);
            if (copy) {
              navigateToViewBorrower(item.userId, item.bookId, copy.id);
              return;
            }
          }
          // If we still can't determine the copyId, navigate to the book in the library
          Alert.alert("Incomplete Information", "Cannot view complete borrower details. Navigating to library management instead.");
          navigateToManageLibrary(item.libraryId, "books");
        } else {
          navigateToManageLibrary(item.libraryId, "books");
        }
      } else if (item.type === "payment") {
        navigateToManageLibrary(item.libraryId, "fines");
      } else if (item.type === "reservation") {
        navigateToManageLibrary(item.libraryId, "books");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Failed to navigate to the selected item.");
    }
  };

  const renderLibraryItem = ({ item }) => {
    const stats = getLibraryStats(item.id);
    // Check if this is the Tech Innovation Collection
    const isTechInnovation = item.id === "lib8";

    return (
      <TouchableOpacity
        style={styles.libraryCard}
        onPress={() => navigateToManageLibrary(item.id)}
      >
        <LinearGradient
          colors={isTechInnovation ? ["#8A2BE2", "#4568DC"] : ["#4568DC", "#B06AB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientCard}
        >
          {isTechInnovation && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          <View style={styles.libraryCardContent}>
            <View style={styles.libraryInfo}>
              <Text style={styles.libraryName}>{item.name}</Text>
              <Text style={styles.libraryDescription}>{item.description}</Text>
              <View style={styles.libraryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalBooks}</Text>
                  <Text style={styles.statLabel}>Books</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.activeBorrowings}</Text>
                  <Text style={styles.statLabel}>Borrowed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${stats.pendingPayments}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
              </View>
            </View>
            <View style={styles.libraryAction}>
              <Feather
                name="chevron-right"
                size={24}
                color="#FFFFFF"
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderActivityItem = ({ item }) => {
    let icon, color, description;

    switch (item.type) {
      case "borrow":
        icon = "book-outline";
        color = "#4568DC";
        description = `${item.user} borrowed "${item.bookTitle}"`;
        break;
      case "return":
        icon = "return-up-back-outline";
        color = "#22c55e";
        description = `${item.user} returned "${item.bookTitle}"`;
        break;
      case "payment":
        icon = "cash-outline";
        color = "#f97316";
        description = `${item.user} paid $${item.amount?.toFixed(2) || "0.00"}`;
        break;
      case "reservation":
        icon = "time-outline";
        color = "#B06AB3";
        description = `${item.user} reserved "${item.bookTitle}"`;
        break;
      default:
        icon = "information-circle-outline";
        color = "#757575";
        description = "Unknown activity";
    }

    return (
      <TouchableOpacity
        style={styles.activityItem}
        onPress={() => handleActivityPress(item)}
      >
        <View style={[styles.activityIconContainer, { backgroundColor: color + "20" }]}>
          <Ionicons
            name={icon}
            size={20}
            color={color}
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityDescription}>{description}</Text>
          <Text style={styles.activityDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#B06AB3"
        />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={navigateToProfile}
        >
          <Ionicons
            name="person-circle-outline"
            size={40}
            color="#B06AB3"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={["#1E1E1E", "#2A2A2A"]}
            style={styles.statsCard}
          >
            <View style={styles.statOverviewItem}>
              <Ionicons
                name="library-outline"
                size={24}
                color="#4568DC"
                style={styles.statIcon}
              />
              <Text style={styles.statOverviewValue}>{libraries.length}</Text>
              <Text style={styles.statOverviewLabel}>Libraries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statOverviewItem}>
              <Ionicons
                name="book-outline"
                size={24}
                color="#B06AB3"
                style={styles.statIcon}
              />
              <Text style={styles.statOverviewValue}>{totalBooks}</Text>
              <Text style={styles.statOverviewLabel}>Books</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statOverviewItem}>
              <Ionicons
                name="swap-horizontal-outline"
                size={24}
                color="#22c55e"
                style={styles.statIcon}
              />
              <Text style={styles.statOverviewValue}>{totalBorrowings}</Text>
              <Text style={styles.statOverviewLabel}>Borrowed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statOverviewItem}>
              <Ionicons
                name="cash-outline"
                size={24}
                color="#f97316"
                style={styles.statIcon}
              />
              <Text style={styles.statOverviewValue}>${pendingPayments}</Text>
              <Text style={styles.statOverviewLabel}>Pending</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToAddLibrary}
            >
              <LinearGradient
                colors={["#4568DC", "#B06AB3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={28}
                  color="#FFFFFF"
                />
                <Text style={styles.actionText}>Create Library</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToTransactionHistory}
            >
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Ionicons
                  name="list-outline"
                  size={28}
                  color="#FFFFFF"
                />
                <Text style={styles.actionText}>Transaction History</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Libraries */}
        <View style={styles.librariesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Libraries</Text>
            <TouchableOpacity onPress={navigateToAddLibrary}>
              <Text style={styles.seeAllText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {libraries.length > 0 ? (
            <>
              <FlatList
                data={libraries}
                keyExtractor={(item) => item.id}
                renderItem={renderLibraryItem}
                scrollEnabled={false}
                nestedScrollEnabled
              />

              {isPartnerMChen && (
                <View style={styles.tipContainer}>
                  <MaterialIcons
                    name="lightbulb-outline"
                    size={20}
                    color="#FFD700"
                  />
                  <Text style={styles.tipText}>Tip: The "Tech Innovation Collection" has active borrowers and reservations.</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="library-outline"
                size={60}
                color="#757575"
              />
              <Text style={styles.emptyStateText}>No libraries yet</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={navigateToAddLibrary}
              >
                <Text style={styles.emptyStateButtonText}>Create Your First Library</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={navigateToTransactionHistory}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {activities.length > 0 ? (
            <View style={styles.activityList}>
              <FlatList
                data={activities}
                keyExtractor={(item) => item.id}
                renderItem={renderActivityItem}
                scrollEnabled={false}
                nestedScrollEnabled
              />
            </View>
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>No recent activity</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: "#757575",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileButton: {
    padding: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-between",
  },
  statOverviewItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    marginBottom: 5,
  },
  statOverviewValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statOverviewLabel: {
    fontSize: 12,
    color: "#757575",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#333333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#4568DC",
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    marginHorizontal: 6,
    overflow: "hidden",
  },
  actionGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: 8,
  },
  librariesContainer: {
    marginBottom: 24,
  },
  libraryCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  gradientCard: {
    padding: 16,
  },
  newBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  newBadgeText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 10,
  },
  libraryCardContent: {
    flexDirection: "row",
  },
  libraryInfo: {
    flex: 1,
  },
  libraryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  libraryDescription: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 12,
  },
  libraryStats: {
    flexDirection: "row",
  },
  statItem: {
    marginRight: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#E0E0E0",
  },
  libraryAction: {
    justifyContent: "center",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tipText: {
    color: "#E0E0E0",
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#757575",
    marginVertical: 16,
  },
  emptyStateButton: {
    backgroundColor: "#4568DC",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  activityContainer: {
    marginBottom: 24,
  },
  activityList: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  activityDate: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  emptyActivity: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
  },
  emptyActivityText: {
    fontSize: 14,
    color: "#757575",
  },
});

export default PartnerDashboardScreen;
