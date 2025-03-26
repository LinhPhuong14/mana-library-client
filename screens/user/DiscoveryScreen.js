import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, TextInput, Alert, Modal, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { CameraView, Camera } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import storageService from "../../services/demo/dataService";

const { width } = Dimensions.get("window");
const SCANNER_WIDTH = width * 0.8;
const SCANNER_HEIGHT = SCANNER_WIDTH;

const DiscoveryScreen = ({ navigation }) => {
  const [publicLibraries, setPublicLibraries] = useState([]);
  const [watchedLibraries, setWatchedLibraries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPublicLibraries, setFilteredPublicLibraries] = useState([]);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isManualEntryVisible, setManualEntryVisible] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const cameraRef = useRef(null);
  const [stats, setStats] = useState({
    publicLibraries: 0,
    totalBooks: 0,
    availableBooks: 0,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestCameraPermission();
    loadLibraries();
    checkUserLoginStatus();
  }, []);

  const navigateToChat = () => {
    navigation.navigate("Chat");
  };

  const checkUserLoginStatus = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem(storageService.STORAGE_KEYS.CURRENT_USER);
      if (userData) {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setCurrentUser(user);
        // If we have a user, load their data
        await loadUserData(user.id);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // Load user's books and history
  const loadUserData = async (userId) => {
    try {
      // Get all books
      const allBooks = await storageService.getBooks();

      // Find books borrowed by this user
      const borrowedBooks = allBooks.filter((book) => book.copies && book.copies.some((copy) => copy.borrowedBy === userId));
      setUserBooks(borrowedBooks);

      // Get user's transaction history
      const transactions = await storageService.getTransactions({ userId });
      setUserHistory(transactions);

      // Load user's watched libraries (previously favorites)
      await loadWatchedLibraries(userId);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Load libraries the user is watching (from real data)
  const loadWatchedLibraries = async (userId) => {
    try {
      // In a full implementation, this would fetch the user's watched libraries
      // For now, we'll get the libraries they've borrowed books from
      const allBooks = await storageService.getBooks();
      const borrowedBooks = allBooks.filter((book) => book.copies && book.copies.some((copy) => copy.borrowedBy === userId));

      // Get unique library IDs from the borrowed books
      const libraryIds = [...new Set(borrowedBooks.map((book) => book.libraryId))];

      // Fetch the library details
      const allLibraries = await storageService.getLibraries();
      const watchedLibs = allLibraries.filter((lib) => libraryIds.includes(lib.id));

      // Enhance with book counts
      const enhancedLibraries = await Promise.all(
        watchedLibs.map(async (library) => {
          const libraryBooks = await storageService.getBooks(library.id);
          const availableCount = libraryBooks.reduce((count, book) => {
            if (book.copies) {
              return count + book.copies.filter((copy) => !copy.borrowedBy).length;
            }
            return count;
          }, 0);

          return {
            ...library,
            totalBooks: libraryBooks.length,
            availableBooks: availableCount,
          };
        })
      );

      setWatchedLibraries(enhancedLibraries);
    } catch (error) {
      console.error("Failed to load watched libraries:", error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPublicLibraries(publicLibraries);
    } else {
      const filtered = publicLibraries.filter((lib) => lib.name.toLowerCase().includes(searchQuery.toLowerCase()) || lib.description.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredPublicLibraries(filtered);
    }
  }, [searchQuery, publicLibraries]);

  const loadLibraries = async () => {
    try {
      await storageService.initializeDemoData();
      const data = await storageService.getLibraries();

      // Filter to only public libraries
      const publicLibs = data.filter((lib) => lib.isPublic);
      setPublicLibraries(publicLibs);
      setFilteredPublicLibraries(publicLibs);

      // Load books for all public libraries
      const books = await storageService.getBooks();
      const publicLibraryIds = publicLibs.map((lib) => lib.id);
      const publicBooks = books.filter((book) => publicLibraryIds.includes(book.libraryId));

      // Calculate available book count
      let availableCount = 0;
      publicBooks.forEach((book) => {
        if (book.copies) {
          availableCount += book.copies.filter((copy) => !copy.borrowedBy).length;
        }
      });

      // Set statistics
      setStats({
        publicLibraries: publicLibs.length,
        totalBooks: publicBooks.length,
        availableBooks: availableCount,
      });
    } catch (error) {
      console.error("Failed to load libraries:", error);
    }
  };

  const addLibraryToVisited = async (libraryId) => {
    try {
      const allLibraries = await storageService.getLibraries();
      const library = allLibraries.find((lib) => lib.id === libraryId);

      if (library && !watchedLibraries.some((lib) => lib.id === libraryId)) {
        const books = await storageService.getBooks();
        const libraryBooks = books.filter((book) => book.libraryId === library.id);
        const availableCount = libraryBooks.reduce((count, book) => {
          if (book.copies) {
            return count + book.copies.filter((copy) => !copy.borrowedBy).length;
          }
          return count;
        }, 0);

        const enhancedLibrary = {
          ...library,
          totalBooks: libraryBooks.length,
          availableBooks: availableCount,
        };

        setWatchedLibraries([enhancedLibrary, ...watchedLibraries]);
      }
    } catch (error) {
      console.error("Failed to add library to visited:", error);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === "granted");
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const handleManualCodeSubmit = async () => {
    if (!manualCode.trim()) {
      Alert.alert("Error", "Please enter a library code");
      return;
    }

    try {
      // Extract library ID if using protocol format
      let libraryId = manualCode;
      if (manualCode.startsWith("manalibrary://")) {
        libraryId = manualCode.replace("manalibrary://", "");
      }

      const library = await storageService.getLibrary(libraryId);
      if (!library) {
        Alert.alert("Library Not Found", "The entered library code does not exist.");
        return;
      }

      // Close modals and navigate
      setManualEntryVisible(false);
      setScannerVisible(false);
      setManualCode("");

      // Add to visited libraries
      addLibraryToVisited(libraryId);

      navigation.navigate("LibraryDetails", { libraryId: libraryId });
    } catch (error) {
      console.error("Error checking library:", error);
      Alert.alert("Error", "Failed to verify library. Please try again.");
    }
  };

  const openManualEntry = () => {
    setManualEntryVisible(true);
  };

  const closeManualEntry = () => {
    setManualEntryVisible(false);
    setManualCode("");
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (!scanned) {
      setScanned(true);

      // Add a delay to reset the scanned state to allow for multiple scans
      setTimeout(() => {
        setScanned(false);
      }, 500);

      setScannerVisible(false);

      // Handle manalibrary:// protocol links
      let libraryId = data;
      if (data.startsWith("manalibrary://")) {
        // Extract the library ID from the URL
        libraryId = data.replace("manalibrary://", "");
      }

      try {
        const library = await storageService.getLibrary(libraryId);
        if (!library) {
          Alert.alert("Library Not Found", "The scanned library does not exist.");
          return;
        }

        // Add to visited libraries
        addLibraryToVisited(libraryId);

        navigation.navigate("LibraryDetails", { libraryId: libraryId });
      } catch (error) {
        console.error("Error checking library:", error);
        Alert.alert("Error", "Failed to verify library. Please try again.");
      }
    }
  };

  const toggleScanner = () => {
    if (cameraPermission) {
      setScannerVisible(!isScannerVisible);
      // Reset the scanned state when the scanner is toggled
      setScanned(false);
    } else {
      Alert.alert("Camera Permission", "Please grant camera access in settings.");
    }
  };

  const navigateToLibrary = (libraryId) => {
    addLibraryToVisited(libraryId);
    navigation.navigate("LibraryDetails", { libraryId });
  };

  const navigateToLogin = () => {
    navigation.navigate("Auth", { screen: "Login" });
  };

  // New navigation functions
  const navigateToProfile = () => {
    navigation.navigate("Profile");
  };

  const navigateToBooksList = () => {
    navigation.navigate("BooksList");
  };

  const navigateToHistory = () => {
    navigation.navigate("History");
  };

  const renderLibraryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.libraryCard}
      onPress={() => navigateToLibrary(item.id)}
    >
      <View style={styles.libraryCardContent}>
        <Text style={styles.libraryCardName}>{item.name}</Text>
        <Text
          style={styles.libraryCardDescription}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <View style={styles.libraryCardMeta}>
          <View style={styles.libraryCardStat}>
            <Ionicons
              name="book-outline"
              size={14}
              color="#B06AB3"
              style={styles.libraryCardIcon}
            />
            <Text style={styles.libraryCardStatText}>{item.totalBooks || "0"} books</Text>
          </View>
          <View style={styles.libraryCardStat}>
            <Ionicons
              name="bookmark-outline"
              size={14}
              color="#22c55e"
              style={styles.libraryCardIcon}
            />
            <Text style={styles.libraryCardStatText}>{item.availableBooks || "0"} available</Text>
          </View>
          <View style={styles.libraryCardStat}>
            <Ionicons
              name="location-outline"
              size={14}
              color="#4568DC"
              style={styles.libraryCardIcon}
            />
            <Text style={styles.libraryCardStatText}>{item.location}</Text>
          </View>
        </View>
        <View style={styles.librarySeparator} />
        <View style={styles.libraryCardFooter}>
          <Ionicons
            name="person-outline"
            size={14}
            color="#FF9800"
            style={styles.libraryCardIcon}
          />
          <Text style={styles.libraryCardOwnerText}>{item.owner || "Anonymous"}</Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#757575"
      />
    </TouchableOpacity>
  );

  // Render watched libraries section (previously "My Favorite Libraries")
  const renderWatchedLibrariesSection = () => {
    if (isLoggedIn) {
      return (
        <View style={styles.sectionContainer}>
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>Watching</Text>
          </LinearGradient>
          <View style={styles.sectionContent}>
            {watchedLibraries.length > 0 ? (
              <FlatList
                data={watchedLibraries}
                renderItem={renderLibraryItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="eye-outline"
                  size={50}
                  color="#757575"
                />
                <Text style={styles.emptyStateText}>You are not watching any libraries yet</Text>
              </View>
            )}
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.sectionContainer}>
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>Watching</Text>
          </LinearGradient>
          <View style={[styles.sectionContent, styles.loginPromptContainer]}>
            <Ionicons
              name="eye-outline"
              size={50}
              color="#757575"
            />
            <Text style={styles.loginPromptText}>Login to keep track of your favorite libraries</Text>
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
        </View>
      );
    }
  };

  // Render My Books section
  const renderMyBooksSection = () => {
    if (!isLoggedIn) return null;

    return (
      <View style={styles.sectionContainer}>
        <LinearGradient
          colors={["#4568DC", "#B06AB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>My Activity</Text>
        </LinearGradient>
        <View style={styles.sectionContent}>
          <View style={styles.activityCardsContainer}>
            <TouchableOpacity
              style={styles.activityCard}
              onPress={navigateToBooksList}
            >
              <LinearGradient
                colors={["#8E2DE2", "#4A00E0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activityCardGradient}
              >
                <Ionicons
                  name="book"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.activityCardTitle}>My Books</Text>
                <Text style={styles.activityCardValue}>{userBooks.length}</Text>
                <Text style={styles.activityCardLabel}>borrowed</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.activityCard}
              onPress={navigateToHistory}
            >
              <LinearGradient
                colors={["#FF8C00", "#FF5722"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activityCardGradient}
              >
                <Ionicons
                  name="time"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.activityCardTitle}>History</Text>
                <Text style={styles.activityCardValue}>{userHistory.length}</Text>
                <Text style={styles.activityCardLabel}>transactions</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Discover Libraries</Text>
          {isLoggedIn && (
            <TouchableOpacity
              style={styles.profileButton}
              onPress={navigateToProfile}
            >
              <Ionicons
                name="person-circle"
                size={28}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search libraries..."
            placeholderTextColor="#AAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.scanButton}
            onPress={toggleScanner}
          >
            <Ionicons
              name="qr-code"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Statistics */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={["#1E1E1E", "#2A2A2A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statsCard}
          >
            <View style={styles.statItem}>
              <Ionicons
                name="library-outline"
                size={22}
                color="#4568DC"
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{stats.publicLibraries}</Text>
              <Text style={styles.statLabel}>Libraries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons
                name="book-outline"
                size={22}
                color="#B06AB3"
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{stats.totalBooks}</Text>
              <Text style={styles.statLabel}>Books</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons
                name="bookmark-outline"
                size={22}
                color="#22c55e"
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{stats.availableBooks}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </LinearGradient>
        </View>

        {/* My Books and History Section */}
        {renderMyBooksSection()}

        {/* Watched Libraries Section (previously Favorites) */}
        {renderWatchedLibrariesSection()}

        {/* Discover Public Libraries Section */}
        <View style={styles.sectionContainer}>
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>Discover Public Libraries</Text>
          </LinearGradient>
          <View style={styles.sectionContent}>
            {filteredPublicLibraries.length > 0 ? (
              <FlatList
                data={filteredPublicLibraries}
                renderItem={renderLibraryItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="search"
                  size={50}
                  color="#757575"
                />
                <Text style={styles.emptyStateText}>No libraries match your search</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isScannerVisible}
        animationType="slide"
        onRequestClose={toggleScanner}
      >
        <View style={styles.scannerContainer}>
          <View style={styles.scannerBody}>
            <View style={styles.scanner}>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFillObject}
                facing="back"
                enableTorch={flashEnabled}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "pdf417"],
                }}
              >
                <View style={styles.scannerOverlay}>
                  <View style={styles.scannerMarker} />
                </View>
              </CameraView>

              {/* Flash toggle button */}
              <TouchableOpacity
                style={styles.flashButton}
                onPress={toggleFlash}
              >
                <Ionicons
                  name={flashEnabled ? "flash" : "flash-off"}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.instructionText}>Position the library QR code within the square</Text>

            <TouchableOpacity
              style={styles.manualEntryButton}
              onPress={openManualEntry}
            >
              <Text style={styles.manualEntryButtonText}>Enter Code Manually</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeScannerButton}
              onPress={toggleScanner}
            >
              <Text style={styles.closeScannerButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Manual Entry Modal */}
      <Modal
        visible={isManualEntryVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeManualEntry}
      >
        <View style={styles.manualEntryOverlay}>
          <View style={styles.manualEntryContainer}>
            <Text style={styles.manualEntryTitle}>Enter Library Code</Text>

            <TextInput
              style={styles.manualEntryInput}
              placeholder="Enter library code or URL"
              placeholderTextColor="#AAA"
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.manualEntryButtons}>
              <TouchableOpacity
                style={[styles.manualEntryActionButton, styles.cancelButton]}
                onPress={closeManualEntry}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.manualEntryActionButton, styles.submitButton]}
                onPress={handleManualCodeSubmit}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <TouchableWithoutFeedback onPress={navigateToChat}>
        <View style={styles.chatButton}>
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chatButtonGradient}
          >
            <Ionicons
              name="chatbubble"
              size={24}
              color="#FFFFFF"
            />
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
  chatButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  profileButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 8,
    marginLeft: 4,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 12,
    height: 36,
  },
  scanButton: {
    backgroundColor: "#8A2BE2",
    borderRadius: 6,
    padding: 6,
  },
  statsContainer: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "#BBBBBB",
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "#333",
    marginHorizontal: 10,
  },

  // My Books and History Section
  activityCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  activityCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  activityCardGradient: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  activityCardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  activityCardValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 4,
  },
  activityCardLabel: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontSize: 12,
  },

  // Section styling
  sectionContainer: {
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  sectionAction: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  sectionContent: {
    backgroundColor: "#1E1E1E",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
    marginHorizontal: 16,
  },

  // Login prompt
  loginPromptContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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

  // Library card styling
  libraryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
  },
  libraryCardContent: {
    flex: 1,
  },
  libraryCardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  libraryCardDescription: {
    fontSize: 13,
    color: "#E0E0E0",
    marginVertical: 4,
  },
  libraryCardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  libraryCardStat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  libraryCardIcon: {
    marginRight: 4,
  },
  libraryCardStatText: {
    fontSize: 12,
    color: "#BBBBBB",
  },
  librarySeparator: {
    height: 1,
    backgroundColor: "#3A3A3A",
    marginVertical: 6,
  },
  libraryCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  libraryCardOwnerText: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "500",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStateText: {
    color: "#757575",
    fontSize: 16,
    marginTop: 10,
  },

  createButton: {
    alignSelf: "center",
    marginVertical: 20,
    width: "85%",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  createButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 25,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Scanner related styles
  scannerContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scannerBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scanner: {
    width: SCANNER_WIDTH,
    height: SCANNER_HEIGHT,
    overflow: "hidden",
    borderRadius: 8,
    marginBottom: 20,
    position: "relative",
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerMarker: {
    width: SCANNER_WIDTH * 0.7,
    height: SCANNER_WIDTH * 0.7,
    borderWidth: 2,
    borderColor: "#B06AB3",
    backgroundColor: "transparent",
  },
  flashButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  manualEntryButton: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#B06AB3",
  },
  manualEntryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeScannerButton: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  closeScannerButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  manualEntryOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  manualEntryContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  manualEntryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  manualEntryInput: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 20,
  },
  manualEntryButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  manualEntryActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#444444",
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: "#8A2BE2",
    marginLeft: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 16,
  },
});

export default DiscoveryScreen;
