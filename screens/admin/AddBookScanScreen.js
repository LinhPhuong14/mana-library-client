import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { CameraView, Camera } from "expo-camera";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import dataService from "../../services/demo/dataService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const SCANNER_WIDTH = width * 0.8;
const SCANNER_HEIGHT = SCANNER_WIDTH;

// Function to get book data from demo data by ISBN
const getBookFromISBN = async (isbn) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Get demo data from AsyncStorage
    const demoDataStr = await AsyncStorage.getItem(dataService.STORAGE_KEYS.DEMO);
    const demoData = JSON.parse(demoDataStr || "{}");

    // Check if the ISBN exists in demo data
    if (demoData.books && demoData.books[isbn]) {
      return {
        success: true,
        data: {
          isbn,
          ...demoData.books[isbn],
        },
      };
    }

    // If not in demo data, check our hardcoded mock books
    const mockBooks = {
      9780062315007: {
        title: "The Alchemist",
        author: "Paulo Coelho",
        publishedDate: "1988",
        description: "The Alchemist follows the journey of an Andalusian shepherd boy named Santiago.",
        pageCount: 208,
        categories: ["Fiction"],
        imageUrl: "https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg",
        language: "en",
        publisher: "HarperOne",
      },
      9780061120084: {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        publishedDate: "1960",
        description: "The story of racial injustice and the destruction of innocence.",
        pageCount: 336,
        categories: ["Fiction", "Classics"],
        imageUrl: "https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg",
        language: "en",
        publisher: "HarperCollins",
      },
      9781449373320: {
        title: "Designing Data-Intensive Applications",
        author: "Martin Kleppmann",
        publishedDate: "2017",
        description: "A guide to the architecture of data systems.",
        pageCount: 616,
        categories: ["Technology", "Computer Science"],
        imageUrl: "https://covers.openlibrary.org/b/isbn/9781449373320-M.jpg",
        language: "en",
        publisher: "O'Reilly Media",
      },
    };

    if (mockBooks[isbn]) {
      return { success: true, data: { isbn, ...mockBooks[isbn] } };
    }

    // Not found in any data source
    return {
      success: false,
      error: "Book not found. You can add details manually.",
    };
  } catch (err) {
    console.error("Error fetching book data:", err);
    return {
      success: false,
      error: "Failed to fetch book data. Please try again.",
    };
  }
};

const AddBookScanScreen = ({ navigation, route }) => {
  // Extract libraryId from route params
  const libraryId = route.params?.libraryId;

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState(null);
  const [error, setError] = useState(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Updated to Camera from expo-camera/next
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    // Only process ISBN codes (ISBN-13 is typically 13 digits, ISBN-10 is 10 digits)
    if ((data.length === 13 || data.length === 10) && !isNaN(data)) {
      setScanned(true);
      setScanning(false);
      setIsbn(data);
      fetchBookData(data);
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const fetchBookData = async (isbnCode) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getBookFromISBN(isbnCode);

      if (result.success) {
        setBookData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch book data. Please try again.");
      console.error("Error fetching book data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    if (!isbn || isbn.length < 10) {
      Alert.alert("Invalid ISBN", "Please enter a valid ISBN (10 or 13 digits)");
      return;
    }

    setScanned(true);
    setScanning(false);
    fetchBookData(isbn);
  };

  const resetScanner = () => {
    setScanned(false);
    setScanning(true);
    setBookData(null);
    setError(null);
    setIsbn("");
  };

  const addToLibrary = async () => {
    setLoading(true);

    try {
      // Create copies array with one copy by default
      const copies = [
        {
          id: 1,
          borrowedBy: null,
          borrowDate: null,
          dueDate: null,
        },
      ];

      // Create book object with required data
      const newBook = {
        id: Date.now().toString(),
        libraryId: libraryId, // Use the libraryId from route params
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        publisher: bookData.publisher,
        description: bookData.description,
        coverImage: bookData.imageUrl,
        copies: copies,
        reservedBy: [],
      };

      // Add book to data storage
      await dataService.addBook(newBook);

      // Show success message
      Alert.alert("Success", `"${bookData.title}" has been added to the library catalog.`, [
        {
          text: "OK",
          onPress: () => {
            if (libraryId) {
              // Navigate back to ManageLibrary if we came from there
              navigation.navigate("ManageLibrary", { libraryId });
            } else {
              // Otherwise navigate to ManageBooks (default behavior)
              navigation.navigate("ManageBooks");
            }
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to add book to library. Please try again.");
      console.error("Error adding book:", err);
    } finally {
      setLoading(false);
    }
  };

  const editManually = () => {
    // Navigate to manual add/edit with pre-filled data
    navigation.navigate("AddBookManual", {
      bookData,
      libraryId, // Pass the libraryId to the manual screen
    });
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <Ionicons
            name="camera-off"
            size={60}
            color="#B06AB3"
          />
          <Text style={styles.permissionText}>Camera permission denied</Text>
          <Text style={styles.subText}>Please enable camera access in your device settings to scan book barcodes.</Text>
          <TouchableOpacity
            style={styles.manualEntryButton}
            onPress={() => navigation.navigate("AddBookManual", { libraryId })}
          >
            <Text style={styles.manualEntryText}>Enter Book Details Manually</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Scan Book ISBN</Text>
      </View>

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {scanning ? (
          <View style={styles.scannerContainer}>
            <View style={styles.scanner}>
              {/* Updated to use CameraView component from expo-camera/next */}
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFillObject}
                facing="back"
                enableTorch={flashEnabled}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["ean13", "ean8", "pdf417"],
                }}
              />
              <View style={styles.scannerOverlay}>
                <View style={styles.scannerMarker} />
              </View>

              {/* Flash button */}
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

            <Text style={styles.instructionText}>Position the ISBN barcode within the box</Text>

            <View style={styles.manualEntryContainer}>
              <TextInput
                style={styles.isbnInput}
                placeholder="Or enter ISBN manually"
                placeholderTextColor="#757575"
                keyboardType="numeric"
                value={isbn}
                onChangeText={setIsbn}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleManualSearch}
              >
                <Ionicons
                  name="search"
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color="#B06AB3"
                />
                <Text style={styles.loadingText}>Searching for book data...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={60}
                  color="#f97316"
                />
                <Text style={styles.errorTitle}>Book Not Found</Text>
                <Text style={styles.errorText}>{error}</Text>
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={resetScanner}
                  >
                    <Text style={styles.secondaryButtonText}>Scan Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate("AddBookManual", { isbn, libraryId })}
                  >
                    <LinearGradient
                      colors={["#4568DC", "#B06AB3"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.buttonText}>Add Manually</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ) : bookData ? (
              <View style={styles.bookDetailContainer}>
                <Text style={styles.scanSuccessText}>Book Found!</Text>

                <View style={styles.bookInfoCard}>
                  <View style={styles.bookImageContainer}>
                    <Image
                      source={{ uri: bookData.imageUrl }}
                      defaultSource={require("../../assets/book-placeholder.png")}
                      style={styles.bookCover}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ISBN:</Text>
                      <Text style={styles.detailText}>{bookData.isbn}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Title:</Text>
                      <Text style={styles.detailText}>{bookData.title}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Author:</Text>
                      <Text style={styles.detailText}>{bookData.author}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Publisher:</Text>
                      <Text style={styles.detailText}>{bookData.publisher}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Published:</Text>
                      <Text style={styles.detailText}>{bookData.publishedDate}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pages:</Text>
                      <Text style={styles.detailText}>{bookData.pageCount}</Text>
                    </View>

                    {bookData.categories && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Categories:</Text>
                        <Text style={styles.detailText}>{bookData.categories.join(", ")}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{bookData.description}</Text>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={editManually}
                  >
                    <Text style={styles.secondaryButtonText}>Edit Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={addToLibrary}
                  >
                    <LinearGradient
                      colors={["#4568DC", "#B06AB3"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.buttonText}>Add to Library</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.scanAgainButton}
                  onPress={resetScanner}
                >
                  <Text style={styles.scanAgainText}>Scan Another Book</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      </KeyboardAwareScrollView>

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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  permissionText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  subText: {
    color: "#757575",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  manualEntryButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  manualEntryText: {
    color: "#B06AB3",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  scannerContainer: {
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
    height: SCANNER_WIDTH * 0.2,
    borderWidth: 2,
    borderColor: "#B06AB3",
    backgroundColor: "transparent",
  },
  flashButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
  },
  manualEntryContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  isbnInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    color: "#FFFFFF",
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#4568DC",
    justifyContent: "center",
    alignItems: "center",
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    color: "#f97316",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  bookDetailContainer: {
    flex: 1,
  },
  scanSuccessText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22c55e",
    textAlign: "center",
    marginBottom: 20,
  },
  bookInfoCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    marginBottom: 20,
  },
  bookImageContainer: {
    width: 100,
    marginRight: 15,
  },
  bookCover: {
    width: "100%",
    height: 150,
    borderRadius: 4,
    backgroundColor: "#2A2A2A",
  },
  detailsContainer: {
    flex: 1,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  detailLabel: {
    width: 80,
    color: "#757575",
    fontSize: 14,
  },
  detailText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  descriptionText: {
    color: "#CCCCCC",
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 5,
  },
  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    color: "#B06AB3",
    fontSize: 16,
  },
  scanAgainButton: {
    marginTop: 20,
    alignItems: "center",
    padding: 10,
  },
  scanAgainText: {
    color: "#4568DC",
    fontSize: 16,
    textDecorationLine: "underline",
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

export default AddBookScanScreen;
