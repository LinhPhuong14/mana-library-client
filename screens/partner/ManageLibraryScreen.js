"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"

// Sample data for books in the library
const libraryBooks = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    publisher: "Scribner",
    description: "A classic novel set in the Roaring Twenties.",
    coverImage: "https://example.com/gatsby.jpg",
    totalCopies: 5,
    availableCopies: 2,
    borrowCount: 3, // Number of times this book has been borrowed
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    publisher: "HarperCollins",
    description: "A profound novel about racial injustice.",
    coverImage: "https://example.com/mockingbird.jpg",
    totalCopies: 3,
    availableCopies: 1,
    borrowCount: 2,
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    publisher: "Signet Classics",
    description: "A dystopian novel about totalitarianism.",
    coverImage: "https://example.com/1984.jpg",
    totalCopies: 4,
    availableCopies: 4,
    borrowCount: 0,
  },
  {
    id: "4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    publisher: "Penguin Classics",
    description: "A romantic novel of manners.",
    coverImage: "https://example.com/pride.jpg",
    totalCopies: 2,
    availableCopies: 0,
    borrowCount: 5,
  },
]

const ManageLibraryScreen = ({ navigation }) => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("books")
  

// If fetch from api
//   useEffect(() => {
//     fetchBooks()
//   }, [])
//   const fetchBooks = async () => {
//     setLoading(true)
//     try {
//       // Simulate network delay
//       await new Promise((resolve) => setTimeout(resolve, 1500))

//       // Simulate API response
//       const response = await simulateApiCall("/api/books", "GET")
//       setBooks(response.data)
//       setLoading(false)
//     } catch (err) {
//       console.error("Error fetching books:", err)
//       setError("Failed to load books. Please try again later.")
//       setLoading(false)
//     }
//   }

  // Demo API func
//   const PartnerApi = async (endpoint, method, data = null) => {
//     // Simulate network request
//     console.log(`Making ${method} request to ${endpoint}`, data)

//     // Simulate different API endpoints
//     if (endpoint === "/api/books" && method === "GET") {
//       return {
//         status: 200,
//         data: libraryBooks,
//       }
//     }

//     if (endpoint === "/api/books" && method === "POST") {
//       return {
//         status: 201,
//         data: { id: Date.now().toString(), ...data },
//       }
//     }

//     if (endpoint.includes("/api/books/") && method === "PUT") {
//       const bookId = endpoint.split("/").pop()
//       return {
//         status: 200,
//         data: { id: bookId, ...data },
//       }
//     }

//     if (endpoint.includes("/api/books/") && method === "DELETE") {
//       return {
//         status: 204,
//         data: null,
//       }
//     }

//     // Simulate API error
//     throw new Error("API endpoint not found")
//   }

  const handleEditBook = (book) => {
    if (book.borrowCount > 0) {
      // If book has been borrowed, show restricted edit options
      Alert.alert(
        "Restricted Editing",
        "This book has been borrowed before. You can only edit the cover image and description.",
        [
          {
            text: "Edit Limited Fields",
            onPress: () =>
              navigation.navigate("EditBook", {
                book,
                editableFields: ["description", "coverImage"],
              }),
          },
          { text: "Cancel", style: "cancel" },
        ],
      )
    } else {
     //Render a modal form to edit

    }
  }

  const handleRemoveBook = (bookId) => {
    Alert.alert("Remove Book", "Are you sure you want to remove this book from the library?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setLoading(true)
          setTimeout(() => {
            const updatedBooks = books.filter((book) => book.id !== bookId)
            setBooks(updatedBooks)
            setLoading(false)
            Alert.alert("Success", "Book removed successfully")
          }, 500)
        }
        // onPress: async () => {
        //   try {
        //     setLoading(true)
        //     await simulateApiCall(`/api/books/${bookId}`, "DELETE")
        //     setBooks(books.filter((book) => book.id !== bookId))
        //     setLoading(false)
        //   } catch (err) {
        //     console.error("Error removing book:", err)
        //     Alert.alert("Error", "Failed to remove book. Please try again.")
        //     setLoading(false)
        //   }
        // },
      },
    ])
  }

  const handleAddNewBook = () => {
    // Navigate to add book screen with callback to refresh books
    navigation.navigate("AddBook", {
      onBookAdded: (newBook) => {
        setBooks([...books, newBook])
      }
    //   onBookAdded: async (newBook) => {
    //     try {
    //       setLoading(true)
    //       // demo api to add book
    //       const response = await simulateApiCall("/api/books", "POST", newBook)
    //       // Add the new book to the list
    //       setBooks([...books, response.data])
    //       setLoading(false)
    //     } catch (err) {
    //       console.error("Error adding book:", err)
    //       Alert.alert("Error", "Failed to add book. Please try again.")
    //       setLoading(false)
    //     }
    //   },
    })
  }

  const handleManageFines = () => {
    // Navigate to fines management screen
    navigation.navigate("ManageFines")
  }

  const renderBookItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("BookDetail", { bookId: item.id })} style={styles.bookItem}>
      <LinearGradient
        colors={["#4568DC", "#B06AB3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bookCard}
      >
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <Text style={styles.bookAuthor}>by {item.author}</Text>
          <Text style={styles.bookDescription}>{item.description}</Text>

          <View style={styles.bookStats}>
            <Text style={styles.statText}>
              Available:{" "}
              <Text style={styles.statValue}>
                {item.availableCopies}/{item.totalCopies}
              </Text>
            </Text>
            <Text style={styles.statText}>
              Borrowed: <Text style={styles.statValue}>{item.borrowCount} times</Text>
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditBook(item)}>
            <Feather name="edit" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemoveBook(item.id)}
          >
            <Feather name="trash-2" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )

  const renderFinesContent = () => (
    <View style={styles.finesContainer}>
      <Text style={styles.finesTitle}>Manage Library Fines</Text>
      <Text style={styles.finesDescription}>
        Set and manage fines for overdue books, damaged items, and other library violations.
      </Text>

      <TouchableOpacity style={styles.manageFinesButton} onPress={handleManageFines}>
        <Text style={styles.manageFinesButtonText}>Manage Fines</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library Management</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "books" && styles.activeTab]}
          onPress={() => setActiveTab("books")}
        >
          <Text style={[styles.tabText, activeTab === "books" && styles.activeTabText]}>Books</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "fines" && styles.activeTab]}
          onPress={() => setActiveTab("fines")}
        >
          <Text style={[styles.tabText, activeTab === "fines" && styles.activeTabText]}>Fines</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {activeTab === "books" ? (
          <>
            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.addButton} onPress={handleAddNewBook}>
                <Feather name="plus" size={18} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add New Book</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={libraryBooks}
              keyExtractor={(item) => item.id}
              renderItem={renderBookItem}
              scrollEnabled={false}
              nestedScrollEnabled
              ListEmptyComponent={<Text style={styles.emptyListText}>No books in the library</Text>}
            />
          </>
        ) : (
          renderFinesContent()
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  container: {
    padding: 20,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#B06AB3",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  activeTabText: {
    fontWeight: "bold",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 15,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4568DC",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "bold",
  },
  bookItem: {
    marginBottom: 15,
  },
  bookCard: {
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 5,
  },
  bookDescription: {
    fontSize: 14,
    color: "#E0E0E0",
    marginTop: 4,
  },
  bookStats: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statText: {
    fontSize: 12,
    color: "#E0E0E0",
  },
  statValue: {
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  actionButtons: {
    justifyContent: "space-around",
    marginLeft: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  removeButton: {
    backgroundColor: "rgba(255, 0, 0, 0.3)",
  },
  emptyListText: {
    textAlign: "center",
    color: "#757575",
    marginTop: 30,
    fontSize: 16,
  },
  finesContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
  },
  finesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  finesDescription: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 20,
  },
  manageFinesButton: {
    backgroundColor: "#B06AB3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  manageFinesButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    color: "#E0E0E0",
    fontSize: 16,
  },
  errorContainer: {
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
})

export default ManageLibraryScreen

