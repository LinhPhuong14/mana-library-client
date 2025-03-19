import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

// Demo user data
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
  {
    id: "6",
    name: "William Taylor",
    email: "william.taylor@example.com",
    role: "Student",
    memberSince: "2022-09-07",
    status: "inactive",
    booksCheckedOut: 0,
    fines: "$0.00",
  },
  {
    id: "7",
    name: "Ava Martinez",
    email: "ava.martinez@example.com",
    role: "Teacher",
    memberSince: "2023-02-19",
    status: "active",
    booksCheckedOut: 4,
    fines: "$0.00",
  },
  {
    id: "8",
    name: "Noah Anderson",
    email: "noah.anderson@example.com",
    role: "Student",
    memberSince: "2023-04-12",
    status: "active",
    booksCheckedOut: 1,
    fines: "$0.00",
  },
];

// Role options for filtering
const ROLES = ["All", "Student", "Teacher", "Staff"];

const ManageUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState(DEMO_USERS);
  const [filteredUsers, setFilteredUsers] = useState(DEMO_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedRole, sortBy, sortOrder]);

  const filterUsers = () => {
    let result = [...users];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Apply role filter
    if (selectedRole !== "All") {
      result = result.filter((user) => user.role === selectedRole);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "email") {
        comparison = a.email.localeCompare(b.email);
      } else if (sortBy === "memberSince") {
        comparison = new Date(a.memberSince) - new Date(b.memberSince);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredUsers(result);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // In a real app, this would fetch fresh data from the API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAddUser = () => {
    navigation.navigate("UserDetail", { isAdding: true });
  };

  const handleEditUser = (user) => {
    navigation.navigate("UserDetail", { user, isEditing: true });
  };

  const handleDeleteUser = (userId) => {
    Alert.alert("Delete User", "Are you sure you want to delete this user? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // In a real app, this would call the API to delete the user
          setLoading(true);
          setTimeout(() => {
            const updatedUsers = users.filter((user) => user.id !== userId);
            setUsers(updatedUsers);
            setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));
            setLoading(false);
            Alert.alert("Success", "User deleted successfully");
          }, 500);
        },
      },
    ]);
  };

  const handleImportUsers = () => {
    Alert.alert("Import Users", "This would open a file picker to import users from CSV/Excel.", [{ text: "OK" }]);
  };

  const handleExportUsers = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Export Users", "Users data exported successfully. In a real app, this would generate a file for download.", [{ text: "OK" }]);
    }, 1000);
  };

  const handleViewUser = (user) => {
    navigation.navigate("UserDetail", { user, isViewing: true });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#22c55e"; // green
      case "inactive":
        return "#757575"; // gray
      case "restricted":
        return "#f97316"; // orange
      default:
        return "#ef4444"; // red
    }
  };

  const renderUserItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleViewUser(item)}
      >
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.userEmail}>{item.email}</Text>

          <View style={styles.userDetails}>
            <Text style={styles.userDetail}>
              <Text style={styles.detailLabel}>Role: </Text>
              {item.role}
            </Text>
            <Text style={styles.userDetail}>
              <Text style={styles.detailLabel}>Member since: </Text>
              {item.memberSince}
            </Text>
            <View style={styles.statsContainer}>
              <Text style={styles.userDetail}>
                <Text style={styles.detailLabel}>Books out: </Text>
                {item.booksCheckedOut}
              </Text>
              {item.fines !== "$0.00" && (
                <View style={styles.finesContainer}>
                  <Text style={styles.detailLabel}>Fines: </Text>
                  <Text style={styles.finesText}>{item.fines}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleEditUser(item)}
          >
            <Ionicons
              name="create-outline"
              size={22}
              color="#4568DC"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleDeleteUser(item.id)}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color="#ef4444"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Manage Users</Text>
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
          placeholder="Search by name or email"
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

      {/* Role filters */}
      <View style={styles.rolesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ROLES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.rolePill, selectedRole === item && styles.selectedRolePill]}
              onPress={() => setSelectedRole(item)}
            >
              <Text style={[styles.roleText, selectedRole === item && styles.selectedRoleText]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Users list */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.usersList}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people"
              size={60}
              color="#757575"
            />
            <Text style={styles.emptyText}>No users match your filter</Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSelectedRole("All");
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
          onPress={handleImportUsers}
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
          onPress={handleAddUser}
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
          onPress={handleExportUsers}
        >
          <Ionicons
            name="cloud-download-outline"
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={styles.modalTitle}>Sort Users</Text>

            <Text style={styles.modalSectionTitle}>Sort by</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortBy("name")}
              >
                <View style={styles.radioCircle}>{sortBy === "name" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Name</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortBy("email")}
              >
                <View style={styles.radioCircle}>{sortBy === "email" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSortBy("memberSince")}
              >
                <View style={styles.radioCircle}>{sortBy === "memberSince" && <View style={styles.radioFilled} />}</View>
                <Text style={styles.radioLabel}>Join Date</Text>
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
  rolesContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  rolePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedRolePill: {
    backgroundColor: "#4568DC",
  },
  roleText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  selectedRoleText: {
    fontWeight: "bold",
  },
  usersList: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for bottom actions
  },
  userItem: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  userEmail: {
    fontSize: 14,
    color: "#B06AB3",
    marginBottom: 8,
  },
  userDetails: {
    gap: 4,
  },
  userDetail: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  detailLabel: {
    color: "#757575",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  finesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  finesText: {
    color: "#ef4444",
    fontSize: 14,
  },
  userActions: {
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

export default ManageUsersScreen;
