import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../../services/demo/dataService";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [bookStats, setBookStats] = useState({
    borrowed: 0,
    returned: 0,
    active: 0,
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        // Get current user from AsyncStorage
        const userData = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);

        if (userData) {
          const currentUser = JSON.parse(userData);

          // Get complete user data
          const allUsers = await dataService.getUsers();
          const completeUserData = allUsers.find((u) => u.id === currentUser.id);

          if (completeUserData) {
            setUser(completeUserData);

            // Load user's book history
            await loadUserBooks(completeUserData.id);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const loadUserBooks = async (userId) => {
    try {
      // Get all books
      const allBooks = await dataService.getBooks();

      // Find books borrowed by this user
      const borrowed = allBooks.filter((book) => book.copies && book.copies.some((copy) => copy.borrowedBy === userId));

      // Get transactions to count book history
      const transactions = await dataService.getTransactions({ userId });

      const borrowCount = transactions.filter((t) => t.type === "borrow").length;
      const returnCount = transactions.filter((t) => t.type === "return").length;

      setBorrowedBooks(borrowed);
      setBookStats({
        borrowed: borrowCount,
        returned: returnCount,
        active: borrowed.length,
      });
    } catch (error) {
      console.error("Error loading user books:", error);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate("Auth", {
      screen: "Login",
    });
  };

  const navigateToEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no user is logged in, show login screen
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loginContainer}>
          <Ionicons
            name="person-circle-outline"
            size={100}
            color="#B06AB3"
          />
          <Text style={styles.loginText}>Sign in to view your profile</Text>
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
      </SafeAreaView>
    );
  }

  // Get user initials for avatar
  const userInitials = user.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={navigateToEditProfile}
        >
          <Feather
            name="edit"
            size={20}
            color="#B06AB3"
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar and Name */}
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{userInitials}</Text>
          </LinearGradient>
          <Text style={styles.username}>{user.name}</Text>
          <Text style={styles.userRole}>{user.role || "Member"}</Text>
        </View>

        {/* User Information */}
        <LinearGradient
          colors={["#4568DC", "#B06AB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.card}
        >
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="mail"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {user.phone && (
              <>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons
                      name="call"
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{user.phone}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            )}

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="calendar"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{new Date(user.memberSince).toLocaleDateString()}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Book Statistics */}
        <LinearGradient
          colors={["#FF512F", "#DD2476"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.card}
        >
          <Text style={styles.sectionTitle}>Reading Statistics</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons
                name="library-outline"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.statValue}>{bookStats.borrowed}</Text>
              <Text style={styles.statLabel}>Total Borrowed</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.statValue}>{bookStats.returned}</Text>
              <Text style={styles.statLabel}>Returned</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons
                name="book-outline"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.statValue}>{bookStats.active}</Text>
              <Text style={styles.statLabel}>Currently Reading</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Currently Borrowing */}
        <LinearGradient
          colors={["#8E2DE2", "#4A00E0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.card}
        >
          <Text style={styles.sectionTitle}>Currently Borrowing</Text>

          {borrowedBooks.length > 0 ? (
            borrowedBooks.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.bookItem}
                onPress={() => navigation.navigate("BookDetail", { bookId: book.id })}
              >
                <Ionicons
                  name="book"
                  size={20}
                  color="#FFFFFF"
                  style={styles.bookIcon}
                />
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>by {book.author}</Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>You are not currently borrowing any books</Text>
          )}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  editButton: {
    padding: 8,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
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
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
    textAlign: "center",
  },
  loginButton: {
    width: "80%",
    borderRadius: 8,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 12,
  },
  userRole: {
    fontSize: 16,
    color: "#B06AB3",
    marginTop: 4,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  infoValue: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  bookIcon: {
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bookAuthor: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
});

export default ProfileScreen;
