import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text, Chip } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Book list item component for staff screens
 *
 * @param {Object} book - Book object with title, author, etc.
 * @param {Function} onPress - Function to call when item is pressed
 */
const BookListItem = ({ book, onPress }) => {
  // Function to determine status color
  const getStatusColor = () => {
    switch (book.status?.toLowerCase()) {
      case "available":
        return "#4CAF50"; // Green
      case "borrowed":
        return "#FF9800"; // Orange
      case "reserved":
        return "#2196F3"; // Blue
      case "processing":
        return "#9C27B0"; // Purple
      case "unavailable":
        return "#F44336"; // Red
      default:
        return "#757575"; // Gray
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
    >
      {book.coverImage ? (
        <Image
          source={{ uri: book.coverImage }}
          style={styles.cover}
        />
      ) : (
        <View style={styles.placeholderCover}>
          <MaterialIcons
            name="book"
            size={32}
            color="#CCCCCC"
          />
        </View>
      )}

      <View style={styles.details}>
        <View>
          <Text
            style={styles.title}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {book.title}
          </Text>

          <Text
            style={styles.author}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {book.author}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaContainer}>
            {book.isbn && (
              <Text
                style={styles.isbn}
                numberOfLines={1}
              >
                ISBN: {book.isbn}
              </Text>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>{book.publishedDate ? new Date(book.publishedDate).getFullYear() : "Year N/A"}</Text>

              {book.location && <Text style={styles.infoText}>{book.location}</Text>}
            </View>
          </View>

          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
            textStyle={{ color: "white", fontSize: 10 }}
          >
            {book.status?.toUpperCase() || "UNKNOWN"}
          </Chip>
        </View>
      </View>

      <MaterialIcons
        name="chevron-right"
        size={24}
        color="#CCCCCC"
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  cover: {
    width: 60,
    height: 85,
    borderRadius: 4,
  },
  placeholderCover: {
    width: 60,
    height: 85,
    borderRadius: 4,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
    height: 85,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  author: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  metaContainer: {
    flex: 1,
  },
  isbn: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 12,
    color: "#757575",
    marginRight: 8,
  },
  statusChip: {
    height: 22,
    alignSelf: "flex-start",
  },
  chevron: {
    marginLeft: 8,
  },
});

export default BookListItem;
