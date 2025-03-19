"use client"
import { View, StyleSheet } from "react-native"
import { Text, IconButton, Surface, useTheme } from "react-native-paper"

const BookManagement = ({ book, onEdit, onDelete, onToggleAvailability }) => {
  const theme = useTheme()

  const getAvailabilityColor = (available, total) => {
    if (available === 0) return "#ff4d4d" // Red
    if (available < total / 2) return "#ff9933" // Orange
    return "#4cd964" // Green
  }

  return (
    <Surface style={styles.bookItem}>
      <View style={styles.bookContent}>
        <Text style={styles.bookTitle}>{book.title}</Text>
        <Text style={styles.bookAuthor}>by {book.author}</Text>

        <View style={styles.bookDetails}>
          <Text style={styles.bookDetailLabel}>ISBN:</Text>
          <Text style={styles.bookDetailValue}>{book.isbn}</Text>
        </View>

        <View style={styles.bookDetails}>
          <Text style={styles.bookDetailLabel}>Category:</Text>
          <Text style={styles.bookDetailValue}>{book.category}</Text>
        </View>

        <View style={styles.bookDetails}>
          <Text style={styles.bookDetailLabel}>Availability:</Text>
          <View style={styles.availabilityContainer}>
            <View
              style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor(book.available, book.total) }]}
            />
            <Text style={styles.bookDetailValue}>
              {book.available}/{book.total} copies
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bookActions}>
        <IconButton
          icon="pencil"
          iconColor="#4a6fff"
          size={22}
          onPress={() => onEdit(book)}
          style={styles.actionButton}
        />
        <IconButton
          icon="delete"
          iconColor="#ff4d4d"
          size={22}
          onPress={() => onDelete(book.id)}
          style={styles.actionButton}
        />
      </View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  bookItem: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    marginBottom: 16,
  },
  bookContent: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#bb86fc",
    marginBottom: 12,
  },
  bookDetails: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bookDetailLabel: {
    fontSize: 14,
    color: "#999999",
    width: 90,
  },
  bookDetailValue: {
    fontSize: 14,
    color: "#ffffff",
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  bookActions: {
    justifyContent: "space-around",
  },
  actionButton: {
    margin: 0,
  },
})

export default BookManagement

