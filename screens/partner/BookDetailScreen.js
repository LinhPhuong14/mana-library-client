import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import dataService from "../../services/demo/dataService";

const BookDetailScreen = ({ navigation, route }) => {
  const { bookId, libraryId } = route.params;
  const [book, setBook] = useState(null);
  const [library, setLibrary] = useState(null);
  const [borrowers, setBorrowers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load book data
        const bookData = await dataService.getBook(bookId);
        if (!bookData) {
          setError("Book not found");
          setLoading(false);
          return;
        }
        setBook(bookData);

        // Load library data
        const libraryData = await dataService.getLibrary(libraryId);
        if (libraryData) {
          setLibrary(libraryData);
        }

        // Load borrower info for borrowed copies
        const borrowersData = {};
        const borrowedCopies = bookData.copies.filter((copy) => copy.borrowedBy);

        if (borrowedCopies.length > 0) {
          const users = await dataService.getUsers();

          for (const copy of borrowedCopies) {
            const borrower = users.find((user) => user.id === copy.borrowedBy);
            if (borrower) {
              borrowersData[copy.borrowedBy] = borrower;
            }
          }
        }

        setBorrowers(borrowersData);
      } catch (err) {
        console.error("Failed to load book details:", err);
        setError("Failed to load book details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookId, libraryId]);

  // Helper function to count available copies
  const getAvailableCopies = (book) => {
    return book.copies.filter((copy) => copy.borrowedBy === null).length;
  };

  // Helper function to count total copies
  const getTotalCopies = (book) => {
    return book.copies.length;
  };

  // Navigation handler for viewing borrower details
  const navigateToBorrowerDetails = (copyId, borrowerId) => {
    navigation.navigate("ViewBorrower", {
      bookId,
      copyId,
      userId: borrowerId,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
          <Text style={styles.loadingText}>Loading book details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!book) {
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
          <Text style={styles.headerTitle}>Not Found</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Book not found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate stats
  const availableCopies = getAvailableCopies(book);
  const totalCopies = getTotalCopies(book);
  const borrowedCopies = totalCopies - availableCopies;
  const reservations = book.reservedBy ? book.reservedBy.length : 0;

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
        <Text style={styles.headerTitle}>Book Details</Text>
      </View>

      <ScrollView style={styles.container}>
        <LinearGradient
          colors={["#1E1E1E", "#2A2A2A"]}
          style={styles.bookCard}
        >
          <View style={styles.bookHeader}>
            {book.coverImage ? (
              <Image
                source={{ uri: book.coverImage }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Feather
                  name="book"
                  size={40}
                  color="#FFFFFF"
                />
              </View>
            )}

            <View style={styles.bookTitleContainer}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>by {book.author}</Text>
              {library && (
                <Text style={styles.libraryName}>
                  <Feather
                    name="home"
                    size={14}
                    color="#B0B0B0"
                  />{" "}
                  {library.name}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Available</Text>
              <Text style={styles.statValue}>{availableCopies}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Borrowed</Text>
              <Text style={styles.statValue}>{borrowedCopies}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{totalCopies}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Reservations</Text>
              <Text style={styles.statValue}>{reservations}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ISBN:</Text>
              <Text style={styles.detailValue}>{book.isbn}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Publisher:</Text>
              <Text style={styles.detailValue}>{book.publisher}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Copies</Text>
            {book.copies.map((copy, index) =>
              copy.borrowedBy ? (
                <TouchableOpacity
                  key={copy.id}
                  style={styles.copyItemBorrowed}
                  onPress={() => navigateToBorrowerDetails(copy.id, copy.borrowedBy)}
                >
                  <View style={styles.copyInfo}>
                    <Text style={styles.copyText}>
                      Copy #{copy.id} - <Text style={styles.borrowedText}>Borrowed</Text>
                    </Text>
                    {copy.dueDate && <Text style={styles.dueDate}>Due: {new Date(copy.dueDate).toLocaleDateString()}</Text>}
                    {borrowers[copy.borrowedBy] && (
                      <View style={styles.borrowerInfo}>
                        <Ionicons
                          name="person"
                          size={14}
                          color="#B06AB3"
                        />
                        <Text style={styles.borrowerName}>{borrowers[copy.borrowedBy].name}</Text>
                      </View>
                    )}
                  </View>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color="#757575"
                  />
                </TouchableOpacity>
              ) : (
                <View
                  key={copy.id}
                  style={styles.copyItem}
                >
                  <Text style={styles.copyText}>
                    Copy #{copy.id} - <Text style={styles.availableText}>Available</Text>
                  </Text>
                </View>
              )
            )}
          </View>

          {book.reservedBy && book.reservedBy.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reservations</Text>
              <Text style={styles.reservationCount}>
                {book.reservedBy.length} active {book.reservedBy.length === 1 ? "reservation" : "reservations"}
              </Text>
            </View>
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
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    color: "#E0E0E0",
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4568DC",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  bookCard: {
    borderRadius: 15,
    padding: 20,
  },
  bookHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  bookTitleContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 16,
    color: "#E0E0E0",
    marginBottom: 10,
  },
  libraryName: {
    fontSize: 14,
    color: "#B0B0B0",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#252525",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    color: "#B0B0B0",
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#E0E0E0",
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 16,
    color: "#B0B0B0",
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  copyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  copyItemBorrowed: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    backgroundColor: "rgba(176, 106, 179, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  copyInfo: {
    flex: 1,
  },
  copyText: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  borrowedText: {
    color: "#f97316",
    fontWeight: "500",
  },
  availableText: {
    color: "#22c55e",
    fontWeight: "500",
  },
  dueDate: {
    fontSize: 14,
    color: "#f97316",
    marginTop: 2,
  },
  borrowerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  borrowerName: {
    fontSize: 14,
    color: "#B06AB3",
    marginLeft: 4,
  },
  reservationCount: {
    fontSize: 16,
    color: "#E0E0E0",
  },
});

export default BookDetailScreen;
