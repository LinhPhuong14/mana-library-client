import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "react-native-paper";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import dataService from "../../services/demo/dataService";

const SystemMetricsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    checkedOutBooks: 0,
    reservedBooks: 0,
    totalUsers: 0,
    activeUsers: 0,
    overdueBooks: 0,
    newRegistrations: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Initialize demo data if not already initialized
      await dataService.initializeDemoData();

      // Get books data
      const books = await dataService.getBooks();

      // Calculate book statistics
      let availableCount = 0;
      let checkedOutCount = 0;
      let reservedCount = 0;
      let overdueCount = 0;

      const now = new Date();

      books.forEach((book) => {
        // Count reservations
        if (book.reservedBy) {
          reservedCount += book.reservedBy.length;
        }

        // Count copies and overdue books
        if (book.copies) {
          book.copies.forEach((copy) => {
            if (copy.borrowedBy) {
              checkedOutCount++;

              // Check if overdue
              if (copy.dueDate && new Date(copy.dueDate) < now) {
                overdueCount++;
              }
            } else {
              availableCount++;
            }
          });
        }
      });

      // Get users data
      const users = await dataService.getUsers();
      const activeUsers = users.filter((user) => user.status === "active").length;

      // Get recent transactions for activities
      const transactions = await dataService.getTransactions();
      const recentTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      // Format transactions as activities
      const activities = await Promise.all(
        recentTransactions.map(async (tx) => {
          const user = users.find((u) => u.id === tx.userId);
          const book = books.find((b) => b.id === tx.bookId);

          return {
            id: tx.id,
            type: mapTransactionTypeToActivity(tx.type),
            user: user ? user.name : `User ${tx.userId}`,
            book: book ? book.title : `Book ${tx.bookId}`,
            timestamp: formatTimestamp(tx.date),
          };
        })
      );

      // Calculate new registrations (users from last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsers = users.filter((user) => {
        return user.memberSince && new Date(user.memberSince) > thirtyDaysAgo;
      }).length;

      // Update stats
      setStats({
        totalBooks: books.length,
        availableBooks: availableCount,
        checkedOutBooks: checkedOutCount,
        reservedBooks: reservedCount,
        totalUsers: users.length,
        activeUsers,
        overdueBooks: overdueCount,
        newRegistrations: newUsers,
      });

      setRecentActivities(activities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp relative to now (e.g., "2 mins ago")
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString();
  };

  // Map transaction type to activity type
  const mapTransactionTypeToActivity = (type) => {
    switch (type) {
      case "borrow":
        return "book_checkout";
      case "return":
        return "book_return";
      case "reservation":
        return "reservation";
      case "fine":
        return "fine";
      default:
        return type;
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case "book_checkout":
        return (
          <MaterialIcons
            name="logout"
            size={22}
            color="#4568DC"
          />
        );
      case "book_return":
        return (
          <MaterialIcons
            name="login"
            size={22}
            color="#B06AB3"
          />
        );
      case "new_user":
        return (
          <Ionicons
            name="person-add"
            size={22}
            color="#8A2BE2"
          />
        );
      case "reservation":
        return (
          <MaterialIcons
            name="bookmark"
            size={22}
            color="#f97316"
          />
        );
      case "fine":
        return (
          <MaterialIcons
            name="attach-money"
            size={22}
            color="#ef4444"
          />
        );
      default:
        return (
          <MaterialIcons
            name="help"
            size={22}
            color="#9ca3af"
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#B06AB3"
          />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>System Dashboard</Text>
          <TouchableOpacity onPress={() => navigation.navigate("AdminLogin")}>
            <Ionicons
              name="exit-outline"
              size={24}
              color="#B06AB3"
            />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="Total Books"
            value={stats.totalBooks}
            icon="library-books"
            colors={["#4568DC", "#B06AB3"]}
          />
          <StatsCard
            title="Checked Out"
            value={stats.checkedOutBooks}
            icon="logout"
            colors={["#B06AB3", "#4568DC"]}
          />
          <StatsCard
            title="Overdue"
            value={stats.overdueBooks}
            icon="warning"
            colors={["#f97316", "#B06AB3"]}
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon="people"
            colors={["#8A2BE2", "#4568DC"]}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <ActionButton
            title="Manage Users"
            icon="people"
            onPress={() => navigation.navigate("ManageUsers")}
          />
          <ActionButton
            title="Server Config"
            icon="settings"
            onPress={() => navigation.navigate("ServerConfig")}
          />
          <ActionButton
            title="Storage Manager"
            icon="storage"
            onPress={() => navigation.navigate("StorageManager")}
          />
        </View>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Card.Title
            title="Recent Activity"
            titleStyle={styles.cardTitle}
          />
          <Card.Content>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <View
                  key={activity.id || index}
                  style={styles.activityItem}
                >
                  <View style={styles.activityIconContainer}>{getActivityIcon(activity.type)}</View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      <Text style={styles.bold}>{activity.user}</Text>
                      {activity.type === "book_checkout" && " checked out "}
                      {activity.type === "book_return" && " returned "}
                      {activity.type === "new_user" && " registered as a new user"}
                      {activity.type === "reservation" && " reserved "}
                      {activity.type === "fine" && " was charged a fine for "}
                      {(activity.type === "book_checkout" || activity.type === "book_return" || activity.type === "reservation" || activity.type === "fine") && (
                        <Text style={styles.bookTitle}>{activity.book}</Text>
                      )}
                    </Text>
                    <Text style={styles.timestamp}>{activity.timestamp}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent activities found</Text>
            )}
          </Card.Content>
        </Card>

        {/* System Health */}
        <Card style={styles.systemCard}>
          <Card.Title
            title="System Health"
            titleStyle={styles.cardTitle}
          />
          <Card.Content>
            <View style={styles.systemItem}>
              <Text style={styles.systemLabel}>API Status:</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: "#22c55e" }]} />
                <Text style={styles.statusText}>Operational</Text>
              </View>
            </View>
            <View style={styles.systemItem}>
              <Text style={styles.systemLabel}>Database:</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: "#22c55e" }]} />
                <Text style={styles.statusText}>Connected</Text>
              </View>
            </View>
            <View style={styles.systemItem}>
              <Text style={styles.systemLabel}>Last Backup:</Text>
              <Text style={styles.statusText}>Today, 03:00 AM</Text>
            </View>
            <View style={styles.systemItem}>
              <Text style={styles.systemLabel}>Storage:</Text>
              <Text style={styles.statusText}>64% used (3.2/5GB)</Text>
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.versionText}>ManaLibrary Admin v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper component for stats cards
const StatsCard = ({ title, value, icon, colors }) => (
  <Card style={styles.statsCard}>
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <MaterialIcons
        name={icon}
        size={30}
        color="#fff"
      />
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </LinearGradient>
  </Card>
);

// Helper component for action buttons
const ActionButton = ({ title, icon, onPress }) => (
  <TouchableOpacity
    style={styles.actionButton}
    onPress={onPress}
  >
    <LinearGradient
      colors={["#4568DC", "#B06AB3"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.actionIconContainer}
    >
      <MaterialIcons
        name={icon}
        size={24}
        color="#FFFFFF"
      />
    </LinearGradient>
    <Text style={styles.actionText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 8,
  },
  statsCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  gradientBackground: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },
  statsTitle: {
    color: "#FFFFFF",
    fontWeight: "500",
    marginTop: 5,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 8,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  actionButton: {
    alignItems: "center",
    width: 100,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },
  activityCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: "#1E1E1E",
  },
  cardTitle: {
    color: "#FFFFFF",
  },
  activityItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  bold: {
    fontWeight: "bold",
    color: "#B06AB3",
  },
  bookTitle: {
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#4568DC",
  },
  timestamp: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  systemCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: "#1E1E1E",
  },
  systemItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  systemLabel: {
    fontWeight: "500",
    color: "#FFFFFF",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    color: "#FFFFFF",
  },
  versionText: {
    color: "#757575",
    textAlign: "center",
    marginVertical: 16,
    fontSize: 12,
  },
  emptyText: {
    color: "#757575",
    textAlign: "center",
    padding: 12,
    fontSize: 14,
  },
});

export default SystemMetricsScreen;
