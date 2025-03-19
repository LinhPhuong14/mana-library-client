import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { Title, Text, Button, Card, Chip, ActivityIndicator, IconButton, Divider, Menu } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useBook } from "../../context/BookContext";
import bookService from "../../services/bookService";
import LoadingScreen from "../../components/common/LoadingScreen";
import ErrorDisplay from "../../components/common/ErrorDisplay";

const BookDetailScreen = () => {
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { bookId, barcode } = route.params || {};
  const { getBook } = useBook();

  useEffect(() => {
    loadBookData();
  }, [bookId, barcode]);

  const loadBookData = async () => {
    try {
      setLoading(true);
      setError(null);

      let bookData;

      if (bookId) {
        // Load book by ID
        bookData = await bookService.getBookById(bookId);
      } else if (barcode) {
        // Load book by barcode
        bookData = await bookService.getBookByBarcode(barcode);
      } else {
        throw new Error("No book ID or barcode provided");
      }

      if (!bookData) {
        throw new Error("Book not found");
      }

      setBook(bookData);
    } catch (err) {
      console.error("Failed to load book:", err);
      setError(err.message || "Failed to load book information");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBook = () => {
    setMenuVisible(false);
    navigation.navigate("AddEditBook", { bookId: book.id, editing: true });
  };

  const confirmDeleteBook = () => {
    setMenuVisible(false);
    Alert.alert("Confirm Delete", "Are you sure you want to delete this book? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: handleDeleteBook },
    ]);
  };

  const handleDeleteBook = async () => {
    try {
      setProcessing(true);
      await bookService.deleteBook(book.id);
      Alert.alert("Success", "Book deleted successfully");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to delete book");
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckout = () => {
    navigation.navigate("BarcodeScanner", {
      mode: "checkout",
      bookId: book.id,
    });
  };

  const handleReturn = () => {
    navigation.navigate("BarcodeScanner", {
      mode: "return",
      bookId: book.id,
    });
  };

  const handleReservation = async () => {
    try {
      setProcessing(true);
      await bookService.reserveBook(book.id);
      loadBookData(); // Refresh data
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to process reservation");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelReservation = async () => {
    try {
      setProcessing(true);
      await bookService.cancelReservation(book.id);
      loadBookData(); // Refresh data
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to cancel reservation");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading book details..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={loadBookData}
      />
    );
  }

  if (!book) {
    return (
      <ErrorDisplay
        error="Book not found"
        onRetry={loadBookData}
      />
    );
  }

  const renderStatusChip = () => {
    let color = "#4CAF50"; // Default green for available
    let icon = "check-circle";

    switch (book.status.toLowerCase()) {
      case "borrowed":
        color = "#FF9800";
        icon = "account-clock";
        break;
      case "reserved":
        color = "#2196F3";
        icon = "book-clock";
        break;
      case "processing":
        color = "#9C27B0";
        icon = "sync";
        break;
      case "unavailable":
        color = "#F44336";
        icon = "cancel";
        break;
    }

    return (
      <Chip
        icon={icon}
        style={[styles.statusChip, { backgroundColor: color }]}
        textStyle={{ color: "white" }}
      >
        {book.status.toUpperCase()}
      </Chip>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
              style={styles.menuButton}
            />
          }
        >
          <Menu.Item
            onPress={handleEditBook}
            title="Edit Book"
          />
          <Menu.Item
            onPress={confirmDeleteBook}
            title="Delete Book"
          />
        </Menu>
      </View>

      <View style={styles.coverContainer}>
        {book.coverImage ? (
          <Image
            source={{ uri: book.coverImage }}
            style={styles.coverImage}
          />
        ) : (
          <View style={styles.noCoverContainer}>
            <MaterialIcons
              name="book"
              size={80}
              color="#CCCCCC"
            />
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Title style={styles.title}>{book.title}</Title>
        <Text style={styles.author}>by {book.author}</Text>

        <View style={styles.statusContainer}>
          {renderStatusChip()}
          <Text style={styles.copies}>{book.copies > 1 ? `${book.copies} copies available` : "1 copy available"}</Text>
        </View>

        <Divider style={styles.divider} />

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ISBN:</Text>
              <Text style={styles.infoValue}>{book.isbn || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Publisher:</Text>
              <Text style={styles.infoValue}>{book.publisher || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Publication Date:</Text>
              <Text style={styles.infoValue}>{book.publishedDate ? new Date(book.publishedDate).toLocaleDateString() : "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Language:</Text>
              <Text style={styles.infoValue}>{book.language === "en" ? "English" : book.language}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pages:</Text>
              <Text style={styles.infoValue}>{book.pageCount || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{book.location || "N/A"}</Text>
            </View>
          </Card.Content>
        </Card>

        {book.description && (
          <>
            <Title style={styles.sectionTitle}>Description</Title>
            <Text style={styles.description}>{book.description}</Text>
          </>
        )}

        {book.categories && book.categories.length > 0 && (
          <>
            <Title style={styles.sectionTitle}>Categories</Title>
            <View style={styles.categoriesContainer}>
              {book.categories.map((category) => (
                <Chip
                  key={category}
                  style={styles.categoryChip}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </>
        )}

        <Title style={styles.sectionTitle}>Staff Actions</Title>
        <View style={styles.actionsContainer}>
          {book.status.toLowerCase() === "available" && (
            <Button
              mode="contained"
              icon="book-arrow-right"
              onPress={handleCheckout}
              style={styles.actionButton}
              loading={processing}
              disabled={processing}
            >
              Checkout
            </Button>
          )}

          {book.status.toLowerCase() === "borrowed" && (
            <Button
              mode="contained"
              icon="book-arrow-left"
              onPress={handleReturn}
              style={[styles.actionButton, { backgroundColor: "#FF9800" }]}
              loading={processing}
              disabled={processing}
            >
              Return
            </Button>
          )}

          {book.status.toLowerCase() === "available" && (
            <Button
              mode="outlined"
              icon="book-clock"
              onPress={handleReservation}
              style={styles.actionButton}
              loading={processing}
              disabled={processing}
            >
              Reserve
            </Button>
          )}

          {book.status.toLowerCase() === "reserved" && (
            <Button
              mode="outlined"
              icon="book-remove"
              onPress={handleCancelReservation}
              style={styles.actionButton}
              loading={processing}
              disabled={processing}
            >
              Cancel Reservation
            </Button>
          )}

          <Button
            mode="outlined"
            icon="barcode-scan"
            onPress={() => navigation.navigate("BarcodeScanner", { mode: "search" })}
            style={styles.actionButton}
          >
            Scan Another Book
          </Button>
        </View>

        {book.borrower && (
          <>
            <Title style={styles.sectionTitle}>Current Borrower</Title>
            <Card
              style={styles.borrowerCard}
              onPress={() => navigation.navigate("UserDetail", { userId: book.borrower.id })}
            >
              <Card.Content>
                <View style={styles.borrowerInfo}>
                  <MaterialIcons
                    name="person"
                    size={24}
                    color="#4568DC"
                  />
                  <View style={styles.borrowerDetails}>
                    <Text style={styles.borrowerName}>{book.borrower.name}</Text>
                    <Text style={styles.borrowDate}>Borrowed on: {new Date(book.borrower.date).toLocaleDateString()}</Text>
                    <Text style={styles.dueDate}>Due by: {new Date(book.borrower.dueDate).toLocaleDateString()}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 8,
  },
  menuButton: {
    marginRight: 8,
  },
  coverContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  coverImage: {
    width: 160,
    height: 240,
    borderRadius: 8,
  },
  noCoverContainer: {
    width: 160,
    height: 240,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  author: {
    fontSize: 16,
    color: "#757575",
    marginTop: 4,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusChip: {
    marginRight: 8,
  },
  copies: {
    fontSize: 14,
    color: "#757575",
  },
  divider: {
    marginVertical: 16,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    fontWeight: "bold",
    color: "#757575",
  },
  infoValue: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 8,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categoryChip: {
    margin: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    marginVertical: 8,
    minWidth: "48%",
  },
  borrowerCard: {
    marginBottom: 24,
    elevation: 2,
  },
  borrowerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  borrowerDetails: {
    marginLeft: 16,
  },
  borrowerName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  borrowDate: {
    fontSize: 14,
    color: "#757575",
  },
  dueDate: {
    fontSize: 14,
    color: "#F44336",
  },
});

export default BookDetailScreen;
