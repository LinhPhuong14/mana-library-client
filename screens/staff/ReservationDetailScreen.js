import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { Text, Title, Card, Button, Divider, Paragraph, ActivityIndicator, Chip, Avatar, List } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import bookService from "../../services/bookService";
import userService from "../../services/userService";
import ErrorDisplay from "../../components/common/ErrorDisplay";
import { formatDate, getDaysDifference } from "../../utils/dateUtils";

const ReservationDetailScreen = () => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const { reservationId } = route.params || {};

  useEffect(() => {
    loadReservationDetails();
  }, [reservationId]);

  const loadReservationDetails = async () => {
    if (!reservationId) {
      setError("Reservation ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch reservation details
      const reservationData = await bookService.getReservationById(reservationId);
      setReservation(reservationData);
    } catch (err) {
      console.error("Failed to load reservation details:", err);
      setError(err.message || "Failed to load reservation details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    Alert.alert("Cancel Reservation", "Are you sure you want to cancel this reservation?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: confirmCancelReservation },
    ]);
  };

  const confirmCancelReservation = async () => {
    try {
      setProcessing(true);
      await bookService.cancelReservation(reservation.book._id, reservation.user._id);
      Alert.alert("Success", "Reservation has been cancelled");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to cancel reservation");
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setProcessing(true);
      await bookService.checkoutBook(reservation.book._id, reservation.user._id);
      Alert.alert("Success", "Book has been checked out to the user");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to check out book");
    } finally {
      setProcessing(false);
    }
  };

  const handleViewBookDetails = () => {
    navigation.navigate("BookDetail", { bookId: reservation.book._id });
  };

  const handleViewUserDetails = () => {
    navigation.navigate("UserDetail", { userId: reservation.user._id });
  };

  const getStatusChipColor = () => {
    switch (reservation?.status?.toUpperCase()) {
      case "ACTIVE":
        return "#4CAF50";
      case "FULFILLED":
        return "#2196F3";
      case "EXPIRED":
        return "#F44336";
      case "CANCELLED":
        return "#9E9E9E";
      default:
        return "#757575";
    }
  };

  const getDaysRemaining = () => {
    if (!reservation?.expirationDate) return null;

    const currentDate = new Date();
    const expDate = new Date(reservation.expirationDate);
    const daysRemaining = getDaysDifference(currentDate, expDate);

    if (daysRemaining < 0) {
      return `Expired ${Math.abs(daysRemaining)} days ago`;
    } else if (daysRemaining === 0) {
      return "Expires today";
    } else {
      return `${daysRemaining} days remaining`;
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator
          size="large"
          color="#4568DC"
        />
        <Text style={styles.loadingText}>Loading reservation details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={loadReservationDetails}
      />
    );
  }

  if (!reservation) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialIcons
          name="error-outline"
          size={48}
          color="#F44336"
        />
        <Text style={styles.errorText}>Reservation not found</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusContainer}>
            <View>
              <Text style={styles.statusLabel}>Reservation Status</Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusChipColor() }]}
                textStyle={{ color: "white" }}
              >
                {reservation.status?.toUpperCase() || "UNKNOWN"}
              </Chip>
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.statusLabel}>Valid Until</Text>
              <Text style={styles.dateText}>{formatDate(reservation.expirationDate)}</Text>
              <Text style={[styles.daysRemaining, { color: getDaysRemaining().includes("Expired") ? "#F44336" : "#4CAF50" }]}>{getDaysRemaining()}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Book Information" />
        <Card.Content>
          <View style={styles.bookContainer}>
            {reservation.book.coverImage ? (
              <Image
                source={{ uri: reservation.book.coverImage }}
                style={styles.bookCover}
              />
            ) : (
              <View style={styles.noCoverContainer}>
                <MaterialIcons
                  name="book"
                  size={40}
                  color="#CCCCCC"
                />
              </View>
            )}
            <View style={styles.bookInfo}>
              <Title style={styles.bookTitle}>{reservation.book.title}</Title>
              <Paragraph style={styles.bookAuthor}>{reservation.book.author}</Paragraph>
              <View style={styles.bookDetailRow}>
                <MaterialIcons
                  name="bookmark"
                  size={16}
                  color="#4568DC"
                  style={styles.icon}
                />
                <Text style={styles.bookDetailText}>{reservation.book.genre ? reservation.book.genre.join(", ") : "N/A"}</Text>
              </View>
              {reservation.book.ISBN && (
                <View style={styles.bookDetailRow}>
                  <MaterialIcons
                    name="qr-code"
                    size={16}
                    color="#4568DC"
                    style={styles.icon}
                  />
                  <Text style={styles.bookDetailText}>ISBN: {reservation.book.ISBN}</Text>
                </View>
              )}
              <Button
                mode="outlined"
                onPress={handleViewBookDetails}
                style={styles.viewButton}
              >
                View Book Details
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="User Information" />
        <Card.Content>
          <List.Item
            title={`${reservation.user.profile?.firstName || ""} ${reservation.user.profile?.lastName || ""}`}
            description={reservation.user.identifier?.username || reservation.user.auth?.email || "No contact info"}
            left={(props) => (
              <Avatar.Icon
                {...props}
                icon="account"
                size={50}
                style={styles.avatar}
              />
            )}
            right={(props) => (
              <Button
                mode="text"
                onPress={handleViewUserDetails}
                labelStyle={{ color: "#4568DC" }}
              >
                View
              </Button>
            )}
          />

          <Divider style={{ marginVertical: 10 }} />

          <View style={styles.userDetailRow}>
            <View style={styles.userDetail}>
              <Text style={styles.userDetailLabel}>Card Number</Text>
              <Text style={styles.userDetailValue}>{reservation.user.library?.cardNumber || "N/A"}</Text>
            </View>
            <View style={styles.userDetail}>
              <Text style={styles.userDetailLabel}>Membership</Text>
              <Text style={styles.userDetailValue}>{reservation.user.library?.membershipType || "Standard"}</Text>
            </View>
          </View>

          <View style={styles.userDetailRow}>
            <View style={styles.userDetail}>
              <Text style={styles.userDetailLabel}>Current Loans</Text>
              <Text style={styles.userDetailValue}>{reservation.user.library?.borrowedBooks?.length || 0}</Text>
            </View>
            <View style={styles.userDetail}>
              <Text style={styles.userDetailLabel}>Reservations</Text>
              <Text style={styles.userDetailValue}>{reservation.user.library?.reservedBooks?.length || 0}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Reservation Details" />
        <Card.Content>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>{formatDate(reservation.reservationDate)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expires</Text>
            <Text style={styles.detailValue}>{formatDate(reservation.expirationDate)}</Text>
          </View>

          {reservation.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.notesText}>{reservation.notes}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        {reservation.status?.toUpperCase() === "ACTIVE" && (
          <>
            <Button
              mode="contained"
              icon="book-arrow-right"
              onPress={handleCheckout}
              style={styles.actionButton}
              loading={processing}
              disabled={processing}
            >
              Check Out Book
            </Button>

            <Button
              mode="outlined"
              icon="cancel"
              onPress={handleCancelReservation}
              style={[styles.actionButton, styles.cancelButton]}
              loading={processing}
              disabled={processing}
            >
              Cancel Reservation
            </Button>
          </>
        )}

        {reservation.status?.toUpperCase() === "EXPIRED" && (
          <Button
            mode="contained"
            icon="delete"
            onPress={confirmCancelReservation}
            style={[styles.actionButton, styles.deleteButton]}
            loading={processing}
            disabled={processing}
          >
            Remove Expired Reservation
          </Button>
        )}

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Back to List
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#757575",
  },
  errorText: {
    fontSize: 16,
    marginVertical: 16,
    color: "#F44336",
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  statusCard: {
    margin: 16,
    backgroundColor: "#ffffff",
    elevation: 2,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 4,
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  dateInfo: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  daysRemaining: {
    fontSize: 12,
    marginTop: 4,
  },
  bookContainer: {
    flexDirection: "row",
  },
  bookCover: {
    width: 100,
    height: 150,
    borderRadius: 4,
  },
  noCoverContainer: {
    width: 100,
    height: 150,
    borderRadius: 4,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
  },
  bookTitle: {
    fontSize: 18,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
  },
  bookDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  icon: {
    marginRight: 4,
  },
  bookDetailText: {
    fontSize: 14,
    flex: 1,
  },
  viewButton: {
    marginTop: 8,
  },
  avatar: {
    backgroundColor: "#4568DC",
  },
  userDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  userDetail: {
    flex: 1,
  },
  userDetailLabel: {
    fontSize: 12,
    color: "#757575",
  },
  userDetailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#757575",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 2,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    marginTop: 6,
    fontSize: 14,
  },
  actionsContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  cancelButton: {
    borderColor: "#F44336",
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  backButton: {
    marginTop: 8,
  },
});

export default ReservationDetailScreen;
