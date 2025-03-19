import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text, Chip, Badge } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Component to display a book item in a list
 *
 * @param {Object} book - Book data object
 * @param {Function} onPress - Function to call when pressed
 */
const BookListItem = ({ book, onPress }) => {
  const getStatusColor = () => {
    switch (book.status?.toLowerCase()) {
      case "available":
        return "#4CAF50";
      case "borrowed":
        return "#FF9800";
      case "reserved":
        return "#2196F3";
      case "processing":
        return "#9C27B0";
      case "unavailable":
        return "#F44336";
      default:
        return "#757575";
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
        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {book.title}
        </Text>
        <Text
          style={styles.author}
          numberOfLines={1}
        >
          {book.author}
        </Text>

        <View style={styles.metaRow}>
          {book.isbn && (
            <Text
              style={styles.isbn}
              numberOfLines={1}
            >
              ISBN: {book.isbn}
            </Text>
          )}

          {book.publishedDate && <Text style={styles.year}>{new Date(book.publishedDate).getFullYear()}</Text>}
        </View>

        <View style={styles.bottomRow}>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
            textStyle={{ color: "white", fontSize: 12 }}
          >
            {book.status || "Unknown"}
          </Chip>

          {book.copiesAvailable > 0 && (
            <Badge
              size={22}
              style={styles.copiesBadge}
            >
              {book.copiesAvailable}
            </Badge>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#ffffff",
  },
  cover: {
    width: 70,
    height: 100,
    borderRadius: 4,
  },
  placeholderCover: {
    width: 70,
    height: 100,
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
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  author: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  isbn: {
    fontSize: 12,
    color: "#757575",
    flex: 1,
  },
  year: {
    fontSize: 12,
    color: "#757575",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statusChip: {
    height: 24,
  },
  copiesBadge: {
    backgroundColor: "#4568DC",
    color: "white",
  },
});

export default BookListItem;
