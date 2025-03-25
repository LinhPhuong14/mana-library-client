import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import dataService from "../../services/demo/dataService";

const ViewBorrowerScreen = ({ navigation, route }) => {
  const { bookId, copyId, userId } = route.params;

  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [user, setUser] = useState(null);
  const [daysOverdue, setDaysOverdue] = useState(0);
  const [potentialFine, setPotentialFine] = useState(0);
  const [copy, setCopy] = useState(null);
  const [library, setLibrary] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch book details
        const bookData = await dataService.getBook(bookId);
        setBook(bookData);

        // Find the specific copy
        const bookCopy = bookData?.copies.find((c) => c.id === copyId);
        setCopy(bookCopy);

        // Get library info
        const libraryData = await dataService.getLibrary(bookData?.libraryId);
        setLibrary(libraryData);

        // Fetch user details
        const userData = await dataService.getUser(userId);
        setUser(userData || { id: userId, name: `User ${userId.substring(4)}` });

        // Calculate overdue days and potential fine
        if (bookCopy && bookCopy.dueDate) {
          const dueDate = new Date(bookCopy.dueDate);
          const currentDate = new Date();

          if (currentDate > dueDate) {
            const timeDiff = currentDate.getTime() - dueDate.getTime();
            const overdueDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            setDaysOverdue(overdueDays);

            // Default fine rate: $0.50 per day
            setPotentialFine(overdueDays * 0.5);
          }
        }
      } catch (error) {
        console.error("Error loading borrower data:", error);
        Alert.alert("Error", "Failed to load borrower information");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookId, copyId, userId]);

  const handleMarkAsReturned = async () => {
    try {
      setLoading(true);

      if (!book || !copy || !userId) {
        throw new Error("Missing required information");
      }

      // Call the return book function
      const result = await dataService.returnBook(bookId, userId, copyId);

      // Show appropriate message based on whether a fine was generated
      if (result.fine) {
        Alert.alert("Book Returned with Fine", `The book has been returned. A fine of $${result.fine.amount.toFixed(2)} has been applied for ${daysOverdue} days overdue.`, [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Book Returned", "The book has been successfully marked as returned.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      console.error("Error returning book:", error);
      Alert.alert("Error", error.message || "Failed to process return");
    } finally {
      setLoading(false);
    }
  };

  const handleExtendLoan = async () => {
    try {
      setLoading(true);

      if (!book || !copy) {
        throw new Error("Missing book information");
      }

      // Find the copy index in the book's copies array
      const copyIndex = book.copies.findIndex((c) => c.id === copyId);

      if (copyIndex === -1) {
        throw new Error("Book copy not found");
      }

      // Create a new dueDate by adding 14 days to the current dueDate
      const currentDueDate = new Date(copy.dueDate);
      const newDueDate = new Date(currentDueDate);
      newDueDate.setDate(currentDueDate.getDate() + 14);

      // Update the copy's dueDate
      const updatedCopies = [...book.copies];
      updatedCopies[copyIndex] = {
        ...updatedCopies[copyIndex],
        dueDate: newDueDate.toISOString(),
      };

      // Update the book
      await dataService.updateBook(bookId, { copies: updatedCopies });

      // Create a transaction record for the extension
      await dataService.addTransaction({
        userId,
        bookId,
        copyId,
        type: "extension",
        date: new Date().toISOString(),
        amount: 0,
        status: "completed",
      });

      // Update local state
      setCopy({
        ...copy,
        dueDate: newDueDate.toISOString(),
      });

      setDaysOverdue(0);
      setPotentialFine(0);

      Alert.alert("Loan Extended", `The due date has been extended to ${newDueDate.toLocaleDateString()}.`, [{ text: "OK" }]);
    } catch (error) {
      console.error("Error extending loan:", error);
      Alert.alert("Error", error.message || "Failed to extend loan");
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) return;

    // Simulate opening messenger link
    const messengerId = user.messenger || user.id;
    const url = `https://m.me/${messengerId}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert("Contact Information", `Contact the borrower at:\n${user.email || "No email available"}\n${user.phone || "No phone available"}`);
        }
      })
      .catch((err) => {
        console.error("Error opening contact link:", err);
        Alert.alert("Error", "Could not open messaging app");
      });
  };

  const handleReminder = () => {
    if (daysOverdue <= 0) {
      Alert.alert("Not Overdue", "This book is not overdue yet. No reminder needed.");
      return;
    }

    if (daysOverdue < 7) {
      Alert.alert("Send Reminder", "A gentle reminder will be sent to the borrower about the overdue book.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            // Simulate sending a reminder
            setTimeout(() => {
              Alert.alert("Success", "Reminder sent to the borrower");
            }, 500);
          },
        },
      ]);
    } else {
      Alert.alert("Book Significantly Overdue", "This book is more than 7 days overdue. Consider reporting the issue.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Strong Reminder",
          onPress: () => {
            // Simulate sending a reminder
            setTimeout(() => {
              Alert.alert("Success", "Strong reminder sent to the borrower");
            }, 500);
          },
        },
      ]);
    }
  };

  const handleReport = () => {
    if (daysOverdue < 7) {
      Alert.alert("Not Eligible for Report", "Reports are only available for books that are more than 7 days overdue.");
      return;
    }

    Alert.alert(
      "Report Overdue Book",
      "This will escalate the issue to library administrators. If the book is not returned within 7 days of the report, the system may automatically process a refund for the book's value to your account.\n\nDo you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: () => {
            // Simulate reporting
            setTimeout(() => {
              Alert.alert("Report Submitted", "Your report has been submitted. The borrower will be notified about potential consequences.");
            }, 500);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#4568DC"
          />
          <Text style={styles.loadingText}>Loading borrower information...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Borrower Details</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* Borrower Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Borrower Information</Text>
          <View style={styles.card}>
            <View style={styles.userInfoContainer}>
              <View style={styles.avatarContainer}>
                <Ionicons
                  name="person"
                  size={48}
                  color="#4568DC"
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || `User ${userId.substring(4)}`}</Text>
                <Text style={styles.userId}>ID: {userId}</Text>
                {user?.email && <Text style={styles.userDetail}>Email: {user.email}</Text>}
                {user?.phone && <Text style={styles.userDetail}>Phone: {user.phone}</Text>}
              </View>
            </View>
          </View>
        </View>

        {/* Book Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Details</Text>
          <View style={styles.card}>
            <View style={styles.bookInfoContainer}>
              <View style={styles.bookCover}>
                {book?.coverImage ? (
                  <Image
                    source={{ uri: book.coverImage }}
                    style={styles.coverImage}
                  />
                ) : (
                  <View style={styles.placeholderCover}>
                    <Feather
                      name="book"
                      size={40}
                      color="#757575"
                    />
                  </View>
                )}
              </View>
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{book?.title || "Unknown Book"}</Text>
                <Text style={styles.bookAuthor}>by {book?.author || "Unknown Author"}</Text>
                <Text style={styles.bookDetail}>ISBN: {book?.isbn || "N/A"}</Text>
                <Text style={styles.bookDetail}>Copy ID: {copyId}</Text>
                <Text style={styles.bookDetail}>Library: {library?.name || "Unknown Library"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Loan Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Information</Text>
          <View style={styles.card}>
            <View style={styles.loanInfoContainer}>
              <View style={styles.loanDetail}>
                <Text style={styles.loanLabel}>Borrowed Date:</Text>
                <Text style={styles.loanValue}>{copy?.borrowDate ? new Date(copy.borrowDate).toLocaleDateString() : "N/A"}</Text>
              </View>

              <View style={styles.loanDetail}>
                <Text style={styles.loanLabel}>Due Date:</Text>
                <Text style={[styles.loanValue, daysOverdue > 0 ? styles.overdue : null]}>{copy?.dueDate ? new Date(copy.dueDate).toLocaleDateString() : "N/A"}</Text>
              </View>

              {daysOverdue > 0 && (
                <>
                  <View style={styles.loanDetail}>
                    <Text style={styles.loanLabel}>Days Overdue:</Text>
                    <Text style={[styles.loanValue, styles.overdue]}>{daysOverdue} days</Text>
                  </View>

                  <View style={styles.loanDetail}>
                    <Text style={styles.loanLabel}>Potential Fine:</Text>
                    <Text style={[styles.loanValue, styles.overdue]}>${potentialFine.toFixed(2)}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkAsReturned}
            >
              <LinearGradient
                colors={["#22c55e", "#16a34a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Feather
                  name="check-circle"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.actionText}>Mark Returned</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleExtendLoan}
            >
              <LinearGradient
                colors={["#4568DC", "#B06AB3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Feather
                  name="calendar"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.actionText}>Extend Loan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleContact}
            >
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Feather
                  name="message-circle"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.actionText}>Contact</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, daysOverdue <= 0 ? styles.disabledButton : null]}
              onPress={handleReminder}
              disabled={daysOverdue <= 0}
            >
              <LinearGradient
                colors={daysOverdue > 0 ? ["#f97316", "#ea580c"] : ["#6b7280", "#4b5563"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Feather
                  name="bell"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.actionText}>Send Reminder</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.reportButton, daysOverdue < 7 ? styles.disabledButton : null]}
            onPress={handleReport}
            disabled={daysOverdue < 7}
          >
            <LinearGradient
              colors={daysOverdue >= 7 ? ["#ef4444", "#dc2626"] : ["#6b7280", "#4b5563"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.reportGradient}
            >
              <Feather
                name="alert-triangle"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.reportText}>Report Issue</Text>
            </LinearGradient>
          </TouchableOpacity>

          {daysOverdue < 7 && <Text style={styles.reportHint}>Reporting is available for books that are more than 7 days overdue</Text>}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
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
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(69, 104, 220, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
  },
  userDetail: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 4,
  },
  bookInfoContainer: {
    flexDirection: "row",
  },
  bookCover: {
    width: 100,
    height: 150,
    marginRight: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  coverImage: {
    width: 100,
    height: 150,
    resizeMode: "cover",
  },
  placeholderCover: {
    width: 100,
    height: 150,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 16,
    color: "#E0E0E0",
    marginBottom: 8,
  },
  bookDetail: {
    fontSize: 14,
    color: "#B0B0B0",
    marginBottom: 4,
  },
  loanInfoContainer: {
    marginVertical: 8,
  },
  loanDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  loanLabel: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  loanValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  overdue: {
    color: "#ef4444",
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    marginHorizontal: 4,
    overflow: "hidden",
  },
  actionGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: 8,
  },
  reportButton: {
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 8,
  },
  reportGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  reportText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  reportHint: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
    marginTop: 8,
  },
});

export default ViewBorrowerScreen;
