import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../../services/demo/dataService";

const PartnerProfileScreen = ({ navigation }) => {
  const [partner, setPartner] = useState({
    id: "user5",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    phone: "+1 (555) 123-4567",
    memberSince: "2022-08-15",
    role: "partner",
    libraries: 3,
    totalBooks: 42,
    activeBorrowings: 15,
    pendingPayments: 25.5,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real app, fetch the partner profile data here
    const loadPartnerData = async () => {
      try {
        setIsLoading(true);
        // Get current user from storage
        const userData = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);
        const user = userData ? JSON.parse(userData) : null;

        if (user && user.id) {
          // This would be a real API call in production
          // For now we're just using the demo data
          const libraries = await dataService.getLibraries();
          const partnerLibraries = libraries.filter((lib) => lib.owner === user.id);

          const books = await dataService.getBooks();
          const partnerBooks = books.filter((book) => partnerLibraries.some((lib) => lib.id === book.libraryId));

          // Calculate stats
          let borrowedCount = 0;
          partnerBooks.forEach((book) => {
            if (book.copies) {
              borrowedCount += book.copies.filter((copy) => copy.borrowedBy).length;
            }
          });

          // Get pending payments
          const transactions = await dataService.getTransactions();
          const pendingAmount = transactions
            .filter((tx) => tx.status === "pending" && tx.type === "fine" && partnerBooks.some((book) => book.id === tx.bookId))
            .reduce((sum, tx) => sum + tx.amount, 0);

          setPartner({
            ...partner,
            ...user,
            libraries: partnerLibraries.length,
            totalBooks: partnerBooks.length,
            activeBorrowings: borrowedCount,
            pendingPayments: pendingAmount.toFixed(2),
          });
        }
      } catch (error) {
        console.error("Error loading partner data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPartnerData();
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true); // Show loading state
            // Clear storage and navigate to login
            await AsyncStorage.removeItem(dataService.STORAGE_KEYS.CURRENT_USER);
            navigation.reset({
              index: 0,
              routes: [{ name: "AdminLogin" }],
            });
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Avatar and Name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["#4568DC", "#B06AB3"]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {partner.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.partnerName}>{partner.name}</Text>
          <Text style={styles.partnerRole}>Partner</Text>
        </View>

        {/* Partner Statistics */}
        <LinearGradient
          colors={["#4568DC", "#B06AB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statsCard}
        >
          <Text style={styles.cardTitle}>Library Statistics</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons
                name="library-outline"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.statValue}>{partner.libraries}</Text>
              <Text style={styles.statLabel}>Libraries</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons
                name="book-outline"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.statValue}>{partner.totalBooks}</Text>
              <Text style={styles.statLabel}>Books</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons
                name="swap-horizontal-outline"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.statValue}>{partner.activeBorrowings}</Text>
              <Text style={styles.statLabel}>Borrowed</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Pending Payments</Text>
            <Text style={styles.paymentValue}>${partner.pendingPayments}</Text>
          </View>
        </LinearGradient>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="mail"
                  size={20}
                  color="#B06AB3"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{partner.email}</Text>
              </View>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="call"
                  size={20}
                  color="#B06AB3"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{partner.phone}</Text>
              </View>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="calendar"
                  size={20}
                  color="#B06AB3"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{new Date(partner.memberSince).toLocaleDateString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingOption}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <View style={styles.settingIconContainer}>
                <Feather
                  name="edit"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.settingText}>Edit Profile</Text>
              <Feather
                name="chevron-right"
                size={20}
                color="#757575"
              />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            <TouchableOpacity
              style={styles.settingOption}
              onPress={() => Alert.alert("Notifications", "Notification settings would be configured here.")}
            >
              <View style={[styles.settingIconContainer, { backgroundColor: "#f9731620" }]}>
                <Feather
                  name="bell"
                  size={20}
                  color="#f97316"
                />
              </View>
              <Text style={styles.settingText}>Notifications</Text>
              <Feather
                name="chevron-right"
                size={20}
                color="#757575"
              />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            <TouchableOpacity
              style={styles.settingOption}
              onPress={handleLogout}
            >
              <View style={[styles.settingIconContainer, { backgroundColor: "#ef444420" }]}>
                <Feather
                  name="log-out"
                  size={20}
                  color="#ef4444"
                />
              </View>
              <Text style={[styles.settingText, { color: "#ef4444" }]}>Logout</Text>
              <Feather
                name="chevron-right"
                size={20}
                color="#757575"
              />
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
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
  partnerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  partnerRole: {
    fontSize: 16,
    color: "#B06AB3",
  },
  statsCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontSize: 14,
    color: "#E0E0E0",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 16,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  paymentValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B06AB3",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(176, 106, 179, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#757575",
  },
  infoValue: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#2A2A2A",
  },
  settingOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(69, 104, 220, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
});

export default PartnerProfileScreen;
