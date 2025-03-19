"use client"

import { useState } from "react"
import { View, StyleSheet, FlatList, TouchableOpacity, StatusBar, Dimensions } from "react-native"
import { Text, IconButton, Searchbar, Chip, Surface, useTheme, Portal, Modal, Button } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Animated, { FadeIn } from "react-native-reanimated"

// Mock data 
const mockBooks = [
  {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9781847941831",
    category: "Self-Help",
    available: 3,
    total: 5,
    coverUrl: "https://m.media-amazon.com/images/I/51-nXsSRfZL._SY445_SX342_.jpg",
  },
  {
    id: "2",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    category: "Technology",
    available: 1,
    total: 3,
    coverUrl: "https://m.media-amazon.com/images/I/41xShlnTZTL._SY445_SX342_.jpg",
  },
  {
    id: "3",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "9781449373320",
    category: "Technology",
    available: 0,
    total: 2,
    coverUrl: "https://m.media-amazon.com/images/I/51ZSpMl1-LL._SY445_SX342_.jpg",
  },
  {
    id: "4",
    title: "Educated",
    author: "Tara Westover",
    isbn: "9780399590504",
    category: "Memoir",
    available: 1,
    total: 2,
    coverUrl: "https://m.media-amazon.com/images/I/41+aN7ZbS9L._SY445_SX342_.jpg",
  },
]

const ManageBooksScreen = () => {
  const [books, setBooks] = useState(mockBooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("All")
  const [visible, setVisible] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const navigation = useNavigation()
  const theme = useTheme()
  const { width } = Dimensions.get("window")

  // Categories for filter chips
  const categories = ["All", "Fiction", "Technology", "Self-Help", "Memoir"]

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery)

    if (filter === "All") return matchesSearch
    return matchesSearch && book.category === filter
  })

  const handleEdit = (book) => {
    navigation.navigate("AddBookManual", { book })
  }

  const handleDelete = (id) => {
    setSelectedBook(books.find((book) => book.id === id))
    setVisible(true)
  }

  const confirmDelete = () => {
    setBooks(books.filter((book) => book.id !== selectedBook.id))
    setVisible(false)
  }

  const getAvailabilityColor = (available, total) => {
    if (available === 0) return "#ff4d4d" // Red
    if (available < total / 2) return "#ff9933" // Orange
    return "#4cd964" // Green
  }

  const renderBookItem = ({ item, index }) => (
    <Animated.View entering={FadeIn.delay(index * 100).duration(300)} style={styles.bookItemContainer}>
      <Surface style={styles.bookItem}>
        <View style={styles.bookContent}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <Text style={styles.bookAuthor}>by {item.author}</Text>

          <View style={styles.bookDetails}>
            <Text style={styles.bookDetailLabel}>ISBN:</Text>
            <Text style={styles.bookDetailValue}>{item.isbn}</Text>
          </View>

          <View style={styles.bookDetails}>
            <Text style={styles.bookDetailLabel}>Category:</Text>
            <Text style={styles.bookDetailValue}>{item.category}</Text>
          </View>

          <View style={styles.bookDetails}>
            <Text style={styles.bookDetailLabel}>Availability:</Text>
            <View style={styles.availabilityContainer}>
              <View
                style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor(item.available, item.total) }]}
              />
              <Text style={styles.bookDetailValue}>
                {item.available}/{item.total} copies
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bookActions}>
          <IconButton
            icon="pencil"
            iconColor="#4a6fff"
            size={22}
            onPress={() => handleEdit(item)}
            style={styles.actionButton}
          />
          <IconButton
            icon="delete"
            iconColor="#ff4d4d"
            size={22}
            onPress={() => handleDelete(item.id)}
            style={styles.actionButton}
          />
        </View>
      </Surface>
    </Animated.View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#000000" />

      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton icon="arrow-left" iconColor="#ffffff" size={24} onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Manage Books</Text>
          <IconButton icon="menu" iconColor="#ffffff" size={24} onPress={() => {}} />
        </View>
      </SafeAreaView>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search books by title, author, or ISBN"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#999999"
          inputStyle={styles.searchInput}
          placeholderTextColor="#999999"
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Chip
              selected={filter === item}
              onPress={() => setFilter(item)}
              style={[styles.filterChip, filter === item ? styles.activeFilterChip : {}]}
              textStyle={[styles.filterChipText, filter === item ? styles.activeFilterChipText : {}]}
            >
              {item}
            </Chip>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        contentContainerStyle={styles.booksList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.importButton} onPress={() => {}}>
          <MaterialCommunityIcons name="cloud-download" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>Import</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddBookManual")}>
          <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportButton} onPress={() => {}}>
          <MaterialCommunityIcons name="cloud-upload" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Delete Book</Text>
          <Text style={styles.modalText}>Are you sure you want to delete "{selectedBook?.title}"?</Text>
          <View style={styles.modalButtons}>
            <Button mode="text" onPress={() => setVisible(false)} style={styles.modalButton} textColor="#ffffff">
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={confirmDelete}
              style={[styles.modalButton, styles.deleteButton]}
              buttonColor="#ff4d4d"
            >
              Delete
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  searchContainer: {
    padding: 16,
  },
  searchbar: {
    backgroundColor: "#333333",
    borderRadius: 8,
    elevation: 0,
  },
  searchInput: {
    color: "#ffffff",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: "#333333",
    borderRadius: 20,
  },
  activeFilterChip: {
    backgroundColor: "#4a6fff",
  },
  filterChipText: {
    color: "#ffffff",
  },
  activeFilterChipText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  booksList: {
    padding: 16,
    paddingBottom: 100,
  },
  bookItemContainer: {
    marginBottom: 16,
  },
  bookItem: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
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
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#121212",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#ffffff",
    marginLeft: 8,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4a6fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  modal: {
    backgroundColor: "#1e1e1e",
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
  },
})

export default ManageBooksScreen


