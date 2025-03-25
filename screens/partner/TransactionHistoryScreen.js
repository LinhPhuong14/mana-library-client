import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import dataService from "../../services/demo/dataService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TransactionHistoryScreen = ({ navigation, route }) => {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // For filter buttons
  const filters = [
    { id: "all", label: "All", color: "#4568DC" },
    { id: "borrow", label: "Borrows", color: "#22c55e" },
    { id: "return", label: "Returns", color: "#22c55e" },
    { id: "fine", label: "Fines", color: "#ef4444" },
    { id: "extension", label: "Extensions", color: "#B06AB3" },
    { id: "reservation", label: "Reservations", color: "#f97316" },
  ];

  useEffect(() => {
    loadTransactionData();
  }, []);

  const loadTransactionData = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const userData = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);
      const user = userData ? JSON.parse(userData) : null;

      if (!user) {
        console.error("No user found");
        Alert.alert("Session Error", "Your session has expired. Please log in again.", [
          {
            text: "OK",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: "AdminLogin" }],
              }),
          },
        ]);
        return;
      }

      // Load libraries owned by the partner
      const allLibraries = await dataService.getLibraries();
      const partnerLibraries = allLibraries.filter((lib) => lib.owner === user.id);
      setLibraries(partnerLibraries);

      // Load books in partner libraries
      const allBooks = await dataService.getBooks();
      const partnerBooks = allBooks.filter((book) => partnerLibraries.some((lib) => lib.id === book.libraryId));
      setBooks(partnerBooks);

      // Load all users for reference
      const allUsers = await dataService.getUsers();
      setUsers(allUsers);

      // Load transactions related to partner books
      const allTransactions = await dataService.getTransactions();
      const partnerTransactions = allTransactions.filter((tx) => partnerBooks.some((book) => book.id === tx.bookId));

      // Enrich transaction data with book and user info
      const enrichedTransactions = partnerTransactions.map((tx) => {
        const relatedBook = partnerBooks.find((book) => book.id === tx.bookId);
        const relatedUser = allUsers.find((user) => user.id === tx.userId);

        return {
          ...tx,
          bookTitle: relatedBook?.title || "Unknown Book",
          userName: relatedUser?.name || "Unknown User",
        };
      });

      // Sort transactions by date (newest first)
      enrichedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(enrichedTransactions);
    } catch (error) {
      console.error("Error loading transaction data:", error);
      Alert.alert("Error", "Failed to load transaction data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async (transactionId) => {
    try {
      // Update the transaction status
      await dataService.updateTransaction(transactionId, { status: "paid" });

      // Update the local state
      setTransactions((prev) => prev.map((tx) => (tx.id === transactionId ? { ...tx, status: "paid" } : tx)));

      Alert.alert("Success", "Transaction marked as paid");
    } catch (error) {
      console.error("Error updating transaction:", error);
      Alert.alert("Error", "Failed to update transaction");
    }
  };

  const handleRemoveTransaction = async (transactionId) => {
    Alert.alert("Remove Transaction", "Are you sure you want to remove this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            // In a real implementation, you might have an API call to delete the transaction
            // Here we'll just update the local state
            setTransactions((prev) => prev.filter((tx) => tx.id !== transactionId));
            Alert.alert("Success", "Transaction removed");
          } catch (error) {
            console.error("Error removing transaction:", error);
            Alert.alert("Error", "Failed to remove transaction");
          }
        },
      },
    ]);
  };

  const getFilteredTransactions = () => {
    if (filter === "all") return transactions;
    return transactions.filter((tx) => tx.type === filter);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderFilterButton = ({ item }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === item.id && { borderColor: item.color }]}
      onPress={() => setFilter(item.id)}
    >
      <Text style={[styles.filterButtonText, filter === item.id && { color: item.color }]}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }) => {
    let icon, color;

    switch (item.type) {
      case "borrow":
        icon = "book-outline";
        color = "#22c55e";
        break;
      case "return":
        icon = "return-up-back-outline";
        color = "#22c55e";
        break;
      case "fine":
        icon = "warning-outline";
        color = "#ef4444";
        break;
      case "payment":
        icon = "cash-outline";
        color = "#f97316";
        break;
      case "extension":
        icon = "calendar-outline";
        color = "#B06AB3";
        break;
      case "reservation":
        icon = "time-outline";
        color = "#B06AB3";
        break;
      default:
        icon = "information-circle-outline";
        color = "#757575";
    }

    return (
      <View style={styles.transactionItem}>
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <Ionicons
            name={icon}
            size={24}
            color={color}
          />
        </View>

        <View style={styles.transactionContent}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTitle}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
            <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          </View>

          <Text style={styles.transactionDetail}>{item.bookTitle}</Text>
          <Text style={styles.transactionDetail}>By: {item.userName}</Text>

          {item.amount > 0 && <Text style={styles.transactionAmount}>${item.amount.toFixed(2)}</Text>}

          {item.reason && <Text style={styles.transactionReason}>Reason: {item.reason.charAt(0).toUpperCase() + item.reason.slice(1)}</Text>}

          <View style={styles.statusContainer}>
            <Text style={[styles.statusLabel, { color: item.status === "pending" ? "#ef4444" : item.status === "paid" || item.status === "completed" ? "#22c55e" : "#f97316" }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {item.type === "fine" && item.status === "pending" && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.payButton]}
              onPress={() => handleMarkAsPaid(item.id)}
            >
              <Feather
                name="check"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => handleRemoveTransaction(item.id)}
            >
              <Feather
                name="trash-2"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator
          size="large"
          color="#B06AB3"
        />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
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

      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <FlatList
            data={filters}
            renderItem={renderFilterButton}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <FlatList
          data={getFilteredTransactions()}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.transactionList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={60}
                color="#757575"
              />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#B0B0B0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    backgroundColor: "#1A1A1A",
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#757575",
    marginRight: 8,
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  transactionList: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 4,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  transactionDate: {
    fontSize: 12,
    color: "#B0B0B0",
  },
  transactionDetail: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f97316",
    marginTop: 4,
  },
  transactionReason: {
    fontSize: 14,
    color: "#B0B0B0",
    marginTop: 2,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  actionsContainer: {
    justifyContent: "space-around",
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  payButton: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
  },
  removeButton: {
    backgroundColor: "rgba(244, 67, 54, 0.3)",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    marginTop: 10,
  },
});

export default TransactionHistoryScreen;
