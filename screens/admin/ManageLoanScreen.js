import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

// Using demo data from other screens
const DEMO_USERS = [
  {
    id: "1",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    role: "Student",
    memberSince: "2023-05-18",
    status: "active",
    booksCheckedOut: 3,
    fines: "$0.00",
  },
  {
    id: "2",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "Teacher",
    memberSince: "2023-07-02",
    status: "active",
    booksCheckedOut: 1,
    fines: "$0.00",
  },
  {
    id: "3",
    name: "Sophia Davis",
    email: "sophia.davis@example.com",
    role: "Student",
    memberSince: "2023-01-25",
    status: "restricted",
    booksCheckedOut: 2,
    fines: "$5.50",
  },
  {
    id: "4",
    name: "James Miller",
    email: "james.miller@example.com",
    role: "Teacher",
    memberSince: "2022-11-14",
    status: "active",
    booksCheckedOut: 0,
    fines: "$0.00",
  },
  {
    id: "5",
    name: "Olivia Johnson",
    email: "olivia.johnson@example.com",
    role: "Student",
    memberSince: "2023-03-30",
    status: "active",
    booksCheckedOut: 1,
    fines: "$2.25",
  },
];

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
];

// Creating demo loans based on users and books
const DEMO_LOANS = [
  {
    id: "1",
    bookId: "1", // Atomic Habits
    userId: "1", // Emma Wilson
    borrowDate: "2025-01-15",
    dueDate: "2025-02-15",
    status: "overdue",
  },
  {
    id: "2",
    bookId: "4", // The Psychology of Money
    userId: "1", // Emma Wilson
    borrowDate: "2025-03-01",
    dueDate: "2025-04-01",
    status: "active",
  },
  {
    id: "3",
    bookId: "3", // Clean Code
    userId: "1", // Emma Wilson
    borrowDate: "2025-01-20",
    dueDate: "2025-02-20",
    status: "overdue",
  },
  {
    id: "4",
    bookId: "2", // Designing Data-Intensive Applications
    userId: "2", // Michael Brown
    borrowDate: "2025-01-10",
    dueDate: "2025-02-10",
    status: "overdue",
  },
  {
    id: "5",
    bookId: "3", // Clean Code
    userId: "3", // Sophia Davis
    borrowDate: "2025-01-05",
    dueDate: "2025-02-05",
    status: "overdue",
  },
  {
    id: "6",
    bookId: "5", // To Kill a Mockingbird
    userId: "3", // Sophia Davis
    borrowDate: "2025-03-05",
    dueDate: "2025-04-05",
    status: "active",
  },
  {
    id: "7",
    bookId: "4", // The Psychology of Money
    userId: "5", // Olivia Johnson
    borrowDate: "2025-02-10",
    dueDate: "2025-04-10",
    status: "active",
  },
];

const FILTER_OPTIONS = ["All", "Active", "Overdue"];

const ManageLoansScreen = ({ navigation }) => {
  const [loans, setLoans] = useState(DEMO_LOANS);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("dueDate");

  // Statistics for display
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    overdueLoans: 0,
    avgLoanDays: 30,
  });

  // Initialize and update stats
  useEffect(() => {
    updateStats();
  }, [loans]);

  // Filter and sort loans
  useEffect(() => {
    filterLoans();
  }, [searchQuery, filterStatus, sortBy, sortOrder, loans]);

  const updateStats = () => {
    const activeLoans = loans.filter((loan) => loan.status === "active").length;
    const overdueLoans = loans.filter((loan) => loan.status === "overdue").length;

    setStats({
      totalLoans: loans.length,
      activeLoans,
      overdueLoans,
      avgLoanDays: 30, // Fixed value for demo
    });
  };

  const filterLoans = () => {
    // First, enrich loans with book and user data
    let enrichedLoans = loans.map((loan) => {
      const book = DEMO_BOOKS.find((b) => b.id === loan.bookId);
      const user = DEMO_USERS.find((u) => u.id === loan.userId);
      return {
        ...loan,
        bookTitle: book?.title || "Unknown Book",
        bookAuthor: book?.author || "Unknown Author",
        userName: user?.name || "Unknown User",
        userRole: user?.role || "Unknown Role",
      };
    });

    // Apply search filter
    if (searchQuery) {
      enrichedLoans = enrichedLoans.filter((loan) => loan.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) || loan.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Apply status filter
    if (filterStatus !== "All") {
      enrichedLoans = enrichedLoans.filter((loan) => loan.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // Apply sorting
    enrichedLoans.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "dueDate") {
        comparison = new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === "borrowDate") {
        comparison = new Date(a.borrowDate) - new Date(b.borrowDate);
      } else if (sortBy === "bookTitle") {
        comparison = a.bookTitle.localeCompare(b.bookTitle);
      } else if (sortBy === "userName") {
        comparison = a.userName.localeCompare(b.userName);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredLoans(enrichedLoans);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, this would fetch fresh data from the API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAddLoan = () => {
    // In a real app, this would navigate to an add loan screen
    Alert.alert("Add Loan", "This would navigate to the new loan form screen");
  };

  const handleExtendLoan = (loanId) => {
    Alert.alert("Extend Loan", "Do you want to extend this loan by 14 days?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Extend",
        onPress: () => {
          setLoading(true);
          setTimeout(() => {
            const updatedLoans = loans.map((loan) => {
              if (loan.id === loanId) {
                // Add 14 days to the due date
                const dueDate = new Date(loan.dueDate);
                dueDate.setDate(dueDate.getDate() + 14);
                return {
                  ...loan,
                  dueDate: dueDate.toISOString().split("T")[0],
                  status: "active",
                };
              }
              return loan;
            });
            setLoans(updatedLoans);
            setLoading(false);
            Alert.alert("Success", "Loan extended successfully.");
          }, 500);
        },
      },
    ]);
  };

  const handleReturnLoan = (loanId) => {
    Alert.alert("Return Book", "Mark this book as returned?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Return",
        onPress: () => {
          setLoading(true);
          setTimeout(() => {
            // In a real app, we would update the availability of the book
            // and remove the loan or mark it as completed
            const updatedLoans = loans.filter((loan) => loan.id !== loanId);
            setLoans(updatedLoans);
            setLoading(false);
            Alert.alert("Success", "Book marked as returned successfully.");
          }, 500);
        },
      },
    ]);
  };

  const handleSendReminder = (loanId) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const user = DEMO_USERS.find((u) => u.id === loan.userId);

    Alert.alert("Send Reminder", `Send a reminder to ${user?.name} about their loan?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send",
        onPress: () => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            Alert.alert("Success", `Reminder sent to ${user?.email}`);
          }, 800);
        },
      },
    ]);
  };

  const getLoanStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#22c55e"; // green
      case "overdue":
        return "#ef4444"; // red
      default:
        return "#757575"; // gray
    }
  };

  const renderLoanItem = ({ item }) => {
    const statusColor = getLoanStatusColor(item.status);
    const today = new Date();
    const dueDate = new Date(item.dueDate);
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    return (
      <View style={styles.loanCard}>
        <View style={styles.loanContent}>
          <View style={styles.loanInfo}>
            <Text style={styles.bookTitle}>{item.bookTitle}</Text>
            <Text style={styles.bookAuthor}>by {item.bookAuthor}</Text>

            <View style={styles.borrowerContainer}>
              <Text style={styles.borrowerLabel}>Borrower:</Text>
              <Text style={styles.borrowerName}>{item.userName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{item.userRole}</Text>
              </View>
            </View>

            <View style={styles.dateContainer}>
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Borrowed:</Text>
                <Text style={styles.dateValue}>{item.borrowDate}</Text>
              </View>
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Due:</Text>
                <Text style={styles.dateValue}>{item.dueDate}</Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{item.status === "overdue" ? `Overdue by ${Math.abs(daysLeft)} days` : `${daysLeft} days left`}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {item.status === "overdue" && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSendReminder(item.id)}
              >
                <MaterialIcons
                  name="notification-important"
                  size={20}
                  color="#f97316"
                />
                <Text style={styles.actionButtonText}>Remind</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleExtendLoan(item.id)}
            >
              <MaterialIcons
                name="update"
                size={20}
                color="#4568DC"
              />
              <Text style={styles.actionButtonText}>Extend</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReturnLoan(item.id)}
            >
              <MaterialIcons
                name="check-circle"
                size={20}
                color="#22c55e"
              />
              <Text style={styles.actionButtonText}>Return</Text>
            </TouchableOpacity>
          </View>
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
        <Text style={styles.headerTitle}>Manage Loans</Text>
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

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradient}
          >
            <Text style={styles.statValue}>{stats.totalLoans}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={["#B06AB3", "#4568DC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradient}
          >
            <Text style={styles.statValue}>{stats.activeLoans}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={["#f97316", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradient}
          >
            <Text style={styles.statValue}>{stats.overdueLoans}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#757575"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by book or borrower"
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

      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterPill, filterStatus === item && styles.selectedFilterPill]}
              onPress={() => setFilterStatus(item)}
            >
              <Text style={[styles.filterText, filterStatus === item && styles.selectedFilterText]}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterContent}
        />
      </View>

      {/* Loan List */}
      <FlatList
        data={filteredLoans}
        renderItem={renderLoanItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.loanList}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="book"
              size={60}
              color="#2A2A2A"
            />
            <Text style={styles.emptyText}>No loans found</Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setFilterStatus("All");
              }}
            >
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add New Loan Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={handleAddLoan}
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
            <Text style={styles.modalTitle}>Sort Loans</Text>

            <Text style={styles.modalSectionTitle}>Sort by</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortBy("dueDate")}
              >
                <View style={styles.radioCircle}>{sortBy === "dueDate" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Due Date</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortBy("borrowDate")}
              >
                <View style={styles.radioCircle}>{sortBy === "borrowDate" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Borrow Date</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortBy("bookTitle")}
              >
                <View style={styles.radioCircle}>{sortBy === "bookTitle" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Book Title</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortBy("userName")}
              >
                <View style={styles.radioCircle}>{sortBy === "userName" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Borrower Name</Text>
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    marginHorizontal: 4,
  },
  statGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    marginTop: 4,
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
  filtersContainer: {
    marginBottom: 10,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    marginRight: 8,
  },
  selectedFilterPill: {
    backgroundColor: "#4568DC",
  },
  filterText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  selectedFilterText: {
    fontWeight: "bold",
  },
  loanList: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for FAB
  },
  loanCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  loanContent: {
    padding: 16,
  },
  loanInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#B06AB3",
    marginBottom: 10,
  },
  borrowerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  borrowerLabel: {
    fontSize: 14,
    color: "#757575",
    marginRight: 6,
  },
  borrowerName: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    flex: 1,
  },
  roleBadge: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: "#757575",
  },
  dateValue: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginLeft: 16,
  },
  actionButtonText: {
    color: "#FFFFFF",
    marginLeft: 4,
    fontSize: 14,
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
  },
  fabButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 30,
    overflow: "hidden",
  },
  fabGradient: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  filterModal: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  modalSectionTitle: {
    fontSize: 16,
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
    borderColor: "#B06AB3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioFilled: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#B06AB3",
  },
  radioLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  applyButton: {
    marginTop: 16,
    overflow: "hidden",
    borderRadius: 8,
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ManageLoansScreen;
