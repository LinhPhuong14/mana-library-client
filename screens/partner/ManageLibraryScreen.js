"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"

// Sample data for libraries
const initialLibraries = [
  {
    id: "123",
    name: "Main Library",
    owner: "user1",
    description: "The main library collection",
    location: "Building A, Floor 2",
    contact: "library@example.com",
    isPublic: true,
    createdAt: "2023-01-15T08:00:00.000Z",
  },
]

// Update the copies structure in initialBooks to include dueDate
const initialBooks = [
  {
    id: "1",
    libraryId: "123",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    publisher: "Scribner",
    description: "A classic novel set in the Roaring Twenties.",
    coverImage: "https://example.com/gatsby.jpg",
    copies: [
      { id: 1, borrowedBy: "user2", borrowedDate: "2023-03-01T08:00:00.000Z", dueDate: "2023-03-15T08:00:00.000Z" },
      { id: 2, borrowedBy: "user3", borrowedDate: "2023-03-05T08:00:00.000Z", dueDate: "2023-03-19T08:00:00.000Z" },
      { id: 3, borrowedBy: null, borrowedDate: null, dueDate: null },
      { id: 4, borrowedBy: null, borrowedDate: null, dueDate: null },
      { id: 5, borrowedBy: null, borrowedDate: null, dueDate: null },
    ],
    reservedBy: [],
  },
  {
    id: "2",
    libraryId: "123",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    publisher: "HarperCollins",
    description: "A profound novel about racial injustice.",
    coverImage: "https://example.com/mockingbird.jpg",
    copies: [
      { id: 1, borrowedBy: "user4", borrowedDate: "2023-02-15T08:00:00.000Z", dueDate: "2023-03-01T08:00:00.000Z" },
      { id: 2, borrowedBy: "user5", borrowedDate: "2023-03-10T08:00:00.000Z", dueDate: "2023-03-24T08:00:00.000Z" },
      { id: 3, borrowedBy: null, borrowedDate: null, dueDate: null },
    ],
    reservedBy: ["user6"],
  },
  {
    id: "3",
    libraryId: "123",
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    publisher: "Signet Classics",
    description: "A dystopian novel about totalitarianism.",
    coverImage: "https://example.com/1984.jpg",
    copies: [
      { id: 1, borrowedBy: null, borrowedDate: null, dueDate: null },
      { id: 2, borrowedBy: null, borrowedDate: null, dueDate: null },
      { id: 3, borrowedBy: null, borrowedDate: null, dueDate: null },
      { id: 4, borrowedBy: null, borrowedDate: null, dueDate: null },
    ],
    reservedBy: [],
  },
  {
    id: "4",
    libraryId: "123",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    publisher: "Penguin Classics",
    description: "A romantic novel of manners.",
    coverImage: "https://example.com/pride.jpg",
    copies: [
      { id: 1, borrowedBy: "user7", borrowedDate: "2023-01-20T08:00:00.000Z", dueDate: "2023-02-03T08:00:00.000Z" },
      { id: 2, borrowedBy: "user8", borrowedDate: "2023-02-25T08:00:00.000Z", dueDate: "2023-03-11T08:00:00.000Z" },
    ],
    reservedBy: ["user9", "user10", "user11"],
  },
]

// Sample data for fines
const initialFines = [
  {
    id: "1",
    type: "Overdue",
    amount: 0.5,
    description: "Per day for overdue books",
    active: true,
  },
  {
    id: "2",
    type: "Damaged",
    amount: 15.0,
    description: "For minor damage to books",
    active: true,
  },
  {
    id: "3",
    type: "Lost",
    amount: 50.0,
    description: "For lost or severely damaged books",
    active: true,
  },
]

// Add transactions array to track fines
const initialTransactions = [
  {
    id: "1",
    userId: "user4",
    bookId: "2",
    copyId: 1,
    type: "fine",
    reason: "overdue",
    amount: 7.5,
    status: "pending",
    createdAt: "2023-03-10T08:00:00.000Z",
    daysOverdue: 15,
  },
]

const ManageLibraryScreen = ({ navigation, route }) => {
 const libraryId = route?.params?.libraryId  

  const [library, setLibrary] = useState(initialLibraries.find((lib) => lib.id === libraryId))
  const [books, setBooks] = useState(initialBooks.filter((book) => book.libraryId === libraryId))
  const [fines, setFines] = useState(initialFines)
  // Add transactions state after the fines state
  const [transactions, setTransactions] = useState(initialTransactions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("books")

  // Modal states
  const [bookModalVisible, setBookModalVisible] = useState(false)
  const [fineModalVisible, setFineModalVisible] = useState(false)
  const [currentBook, setCurrentBook] = useState(null)
  const [currentFine, setCurrentFine] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Form states for book modal
  const [bookTitle, setBookTitle] = useState("")
  const [bookAuthor, setBookAuthor] = useState("")
  const [bookIsbn, setBookIsbn] = useState("")
  const [bookPublisher, setBookPublisher] = useState("")
  const [bookDescription, setBookDescription] = useState("")
  const [bookCoverImage, setBookCoverImage] = useState("")
  const [bookCopiesCount, setBookCopiesCount] = useState("")

  // Form states for fine modal
  const [fineType, setFineType] = useState("")
  const [fineAmount, setFineAmount] = useState("")
  const [fineDescription, setFineDescription] = useState("")
  const [fineActive, setFineActive] = useState(true)

  // Add useEffect to check for overdue books when component mounts
  useEffect(() => {
    checkOverdueBooks()
  }, [])

  // Function to check for overdue books and apply fines
  const checkOverdueBooks = () => {
    const currentDate = new Date()
    const newTransactions = [...transactions]
    let finesApplied = false

    books.forEach((book) => {
      book.copies.forEach((copy) => {
        if (copy.borrowedBy && copy.dueDate) {
          const dueDate = new Date(copy.dueDate)

          // Check if book is overdue
          if (currentDate > dueDate) {
            // Calculate days overdue
            const timeDiff = currentDate.getTime() - dueDate.getTime()
            const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24))

            // Check if a fine already exists for this copy
            const existingFine = transactions.find(
              (t) =>
                t.bookId === book.id &&
                t.copyId === copy.id &&
                t.type === "fine" &&
                t.reason === "overdue" &&
                t.status === "pending",
            )

            if (!existingFine) {
              // Find the overdue fine rate
              const overdueFine = fines.find((f) => f.type === "Overdue" && f.active)

              if (overdueFine) {
                // Create new fine transaction
                const fineAmount = overdueFine.amount * daysOverdue

                const newFine = {
                  id: Date.now().toString(),
                  userId: copy.borrowedBy,
                  bookId: book.id,
                  copyId: copy.id,
                  type: "fine",
                  reason: "overdue",
                  amount: fineAmount,
                  status: "pending",
                  createdAt: new Date().toISOString(),
                  daysOverdue: daysOverdue,
                }

                newTransactions.push(newFine)
                finesApplied = true
              }
            }
          }
        }
      })
    })

    if (finesApplied) {
      setTransactions(newTransactions)
      Alert.alert("Overdue Fines Applied", "Fines have been automatically applied to overdue books.")
    }
  }

  // Helper function to count available copies
  const getAvailableCopies = (book) => {
    return book.copies.filter((copy) => copy.borrowedBy === null).length
  }

  // Helper function to count total copies
  const getTotalCopies = (book) => {
    return book.copies.length
  }

  // Helper function to check if book has been borrowed
  const hasBeenBorrowed = (book) => {
    return book.copies.some((copy) => copy.borrowedBy !== null) || book.copies.length !== getAvailableCopies(book)
  }

  // Reset book form
  const resetBookForm = () => {
    setBookTitle("")
    setBookAuthor("")
    setBookIsbn("")
    setBookPublisher("")
    setBookDescription("")
    setBookCoverImage("")
    setBookCopiesCount("")
    setCurrentBook(null)
    setIsEditMode(false)
  }

  // Reset fine form
  const resetFineForm = () => {
    setFineType("")
    setFineAmount("")
    setFineDescription("")
    setFineActive(true)
    setCurrentFine(null)
    setIsEditMode(false)
  }

  // Open book modal for editing
  const openBookEditModal = (book) => {
    if (hasBeenBorrowed(book)) {
      // If book has been borrowed, show restricted edit options
      Alert.alert(
        "Restricted Editing",
        "This book has been borrowed. You can only edit the cover image and description.",
        [
          {
            text: "Edit Limited Fields",
            onPress: () => {
              setCurrentBook(book)
              setBookTitle(book.title)
              setBookAuthor(book.author)
              setBookIsbn(book.isbn)
              setBookPublisher(book.publisher)
              setBookDescription(book.description)
              setBookCoverImage(book.coverImage || "")
              setBookCopiesCount(book.copies.length.toString())
              setIsEditMode(true)
              setBookModalVisible(true)
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      )
    } else {
      // Full edit options for books that haven't been borrowed
      setCurrentBook(book)
      setBookTitle(book.title)
      setBookAuthor(book.author)
      setBookIsbn(book.isbn)
      setBookPublisher(book.publisher)
      setBookDescription(book.description)
      setBookCoverImage(book.coverImage || "")
      setBookCopiesCount(book.copies.length.toString())
      setIsEditMode(true)
      setBookModalVisible(true)
    }
  }

  // Open book modal for adding
  const openBookAddModal = () => {
    resetBookForm()
    setBookModalVisible(true)
  }

  // Open fine modal for editing
  const openFineEditModal = (fine) => {
    setCurrentFine(fine)
    setFineType(fine.type)
    setFineAmount(fine.amount.toString())
    setFineDescription(fine.description)
    setFineActive(fine.active)
    setIsEditMode(true)
    setFineModalVisible(true)
  }

  // Open fine modal for adding
  const openFineAddModal = () => {
    resetFineForm()
    setFineModalVisible(true)
  }

  // Handle save book
  const handleSaveBook = () => {
    // Validate form
    if (
      !bookTitle.trim() ||
      !bookAuthor.trim() ||
      !bookIsbn.trim() ||
      !bookPublisher.trim() ||
      !bookDescription.trim()
    ) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    const copiesCount = Number.parseInt(bookCopiesCount) || 0
    if (copiesCount <= 0) {
      Alert.alert("Error", "Number of copies must be greater than 0")
      return
    }

    setLoading(true)

    setTimeout(() => {
      if (isEditMode && currentBook) {
        // Check if book has been borrowed
        const hasBorrowed = hasBeenBorrowed(currentBook)

        // Get current borrowed copies to preserve them
        const borrowedCopies = currentBook.copies.filter((copy) => copy.borrowedBy !== null)

        // Create updated book object
        const updatedBook = {
          ...currentBook,
          // Only update title, author, isbn, publisher if book hasn't been borrowed
          title: hasBorrowed ? currentBook.title : bookTitle,
          author: hasBorrowed ? currentBook.author : bookAuthor,
          isbn: hasBorrowed ? currentBook.isbn : bookIsbn,
          publisher: hasBorrowed ? currentBook.publisher : bookPublisher,
          // These fields can always be updated
          description: bookDescription,
          coverImage: bookCoverImage,
        }

        // Handle copies update
        const newCopiesCount = Number.parseInt(bookCopiesCount)
        const currentCopiesCount = currentBook.copies.length

        if (newCopiesCount > currentCopiesCount) {
          // Add new copies
          const newCopies = []
          for (let i = currentCopiesCount + 1; i <= newCopiesCount; i++) {
            newCopies.push({ id: i, borrowedBy: null })
          }
          updatedBook.copies = [...currentBook.copies, ...newCopies]
        } else if (newCopiesCount < currentCopiesCount) {
          // Remove copies, but keep borrowed ones
          if (newCopiesCount < borrowedCopies.length) {
            Alert.alert("Error", "Cannot reduce copies below the number currently borrowed")
            setLoading(false)
            return
          }

          // Keep all borrowed copies
          updatedBook.copies = [...borrowedCopies]

          // Add available copies up to the new total
          const availableCopiesNeeded = newCopiesCount - borrowedCopies.length
          for (let i = 1; i <= availableCopiesNeeded; i++) {
            updatedBook.copies.push({ id: borrowedCopies.length + i, borrowedBy: null })
          }
        }

        // Update books array
        const updatedBooks = books.map((book) => (book.id === currentBook.id ? updatedBook : book))

        setBooks(updatedBooks)
        Alert.alert("Success", "Book updated successfully")
      } else {
        // Create new book
        const newCopies = []
        for (let i = 1; i <= Number.parseInt(bookCopiesCount); i++) {
          newCopies.push({ id: i, borrowedBy: null })
        }

        const newBook = {
          id: Date.now().toString(),
          libraryId: libraryId,
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn,
          publisher: bookPublisher,
          description: bookDescription,
          coverImage: bookCoverImage || "https://example.com/placeholder.jpg",
          copies: newCopies,
          reservedBy: [],
        }

        // Add to books array
        setBooks([...books, newBook])
        Alert.alert("Success", "Book added successfully")
      }

      setLoading(false)
      setBookModalVisible(false)
      resetBookForm()
    }, 500)
  }

  // Handle save fine
  const handleSaveFine = () => {
    // Validate form
    if (!fineType.trim() || !fineAmount.trim() || !fineDescription.trim()) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    const amount = Number.parseFloat(fineAmount)
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Amount must be a positive number")
      return
    }

    setLoading(true)

    setTimeout(() => {
      if (isEditMode && currentFine) {
        // Update fine
        const updatedFine = {
          ...currentFine,
          type: fineType,
          amount: amount,
          description: fineDescription,
          active: fineActive,
        }

        // Update fines array
        const updatedFines = fines.map((fine) => (fine.id === currentFine.id ? updatedFine : fine))

        setFines(updatedFines)
        Alert.alert("Success", "Fine updated successfully")
      } else {
        // Create new fine
        const newFine = {
          id: Date.now().toString(),
          type: fineType,
          amount: amount,
          description: fineDescription,
          active: fineActive,
        }

        // Add to fines array
        setFines([...fines, newFine])
        Alert.alert("Success", "Fine added successfully")
      }

      setLoading(false)
      setFineModalVisible(false)
      resetFineForm()
    }, 500)
  }

  // Handle remove book
  const handleRemoveBook = (bookId) => {
    const bookToRemove = books.find((book) => book.id === bookId)

    // Check if any copies are currently borrowed
    const hasBorrowedCopies = bookToRemove.copies.some((copy) => copy.borrowedBy !== null)

    if (hasBorrowedCopies) {
      Alert.alert(
        "Cannot Remove Book",
        "This book has copies that are currently borrowed. All copies must be returned before removal.",
        [{ text: "OK" }],
      )
      return
    }

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
        },
      },
    ])
  }

  // Handle remove fine
  const handleRemoveFine = (fineId) => {
    Alert.alert("Remove Fine", "Are you sure you want to remove this fine type?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setLoading(true)
          setTimeout(() => {
            const updatedFines = fines.filter((fine) => fine.id !== fineId)
            setFines(updatedFines)
            setLoading(false)
            Alert.alert("Success", "Fine removed successfully")
          }, 500)
        },
      },
    ])
  }

  // Toggle fine active status
  const toggleFineStatus = (fineId) => {
    const updatedFines = fines.map((fine) => {
      if (fine.id === fineId) {
        return { ...fine, active: !fine.active }
      }
      return fine
    })

    setFines(updatedFines)
  }

  // Navigate to book detail screen
  const navigateToBookDetail = (bookId) => {
    navigation.navigate("BookDetail", {
      bookId: bookId,
      libraryId: libraryId,
    })
  }

  // Render book item
  const renderBookItem = ({ item }) => {
    const availableCopies = getAvailableCopies(item)
    const totalCopies = getTotalCopies(item)
    const reservationsCount = item.reservedBy.length

    return (
      <TouchableOpacity onPress={() => navigateToBookDetail(item.id)} style={styles.bookItem}>
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
                  {availableCopies}/{totalCopies}
                </Text>
              </Text>
              <Text style={styles.statText}>
                Reservations: <Text style={styles.statValue}>{reservationsCount}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => openBookEditModal(item)}>
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
  }

  // Render fine item
  const renderFineItem = ({ item }) => (
    <View style={styles.fineItem}>
      <View style={styles.fineInfo}>
        <View style={styles.fineHeader}>
          <Text style={styles.fineType}>{item.type}</Text>
          <View style={[styles.statusIndicator, item.active ? styles.activeStatus : styles.inactiveStatus]} />
        </View>
        <Text style={styles.fineAmount}>${item.amount.toFixed(2)}</Text>
        <Text style={styles.fineDescription}>{item.description}</Text>
      </View>

      <View style={styles.fineActions}>
        <TouchableOpacity style={[styles.fineAction, styles.toggleButton]} onPress={() => toggleFineStatus(item.id)}>
          <Feather name={item.active ? "eye-off" : "eye"} size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.fineAction, styles.editButton]} onPress={() => openFineEditModal(item)}>
          <Feather name="edit" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.fineAction, styles.removeButton]} onPress={() => handleRemoveFine(item.id)}>
          <Feather name="trash-2" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  )

  // Render fines content
  const renderFinesContent = () => (
    <View style={styles.finesContainer}>
      <View style={styles.finesHeader}>
        <Text style={styles.finesTitle}>Library Fines</Text>
        <TouchableOpacity style={styles.addFineButton} onPress={openFineAddModal}>
          <Feather name="plus" size={18} color="#FFFFFF" />
          <Text style={styles.addFineButtonText}>Add Fine</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.finesDescription}>
        Set and manage fines for overdue books, damaged items, and other library violations.
      </Text>

      <FlatList
        data={fines}
        keyExtractor={(item) => item.id}
        renderItem={renderFineItem}
        scrollEnabled={false}
        nestedScrollEnabled
        ListEmptyComponent={<Text style={styles.emptyListText}>No fines configured</Text>}
      />
    </View>
  )

  // Render transactions content
  const renderTransactionsContent = () => {
    const pendingFines = transactions.filter((t) => t.type === "fine" && t.status === "pending")

    const renderTransactionItem = ({ item }) => {
      // Find the book for this transaction
      const book = books.find((b) => b.id === item.bookId)

      return (
        <View style={styles.transactionItem}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>{book ? book.title : "Unknown Book"}</Text>
            <Text style={styles.transactionDetail}>User ID: {item.userId}</Text>
            <Text style={styles.transactionDetail}>Days Overdue: {item.daysOverdue}</Text>
            <Text style={styles.transactionAmount}>Fine Amount: ${item.amount.toFixed(2)}</Text>
            <Text style={styles.transactionDate}>Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.transactionActions}>
            <TouchableOpacity
              style={[styles.transactionAction, styles.resolveButton]}
              onPress={() => handleResolveTransaction(item.id)}
            >
              <Feather name="check" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.transactionAction, styles.removeButton]}
              onPress={() => handleRemoveTransaction(item.id)}
            >
              <Feather name="trash-2" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Pending Fines</Text>
          <TouchableOpacity style={styles.checkOverdueButton} onPress={checkOverdueBooks}>
            <Feather name="refresh-cw" size={18} color="#FFFFFF" />
            <Text style={styles.checkOverdueButtonText}>Check Overdue</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.transactionsDescription}>Automatically generated fines for overdue books.</Text>

        <FlatList
          data={pendingFines}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          scrollEnabled={false}
          nestedScrollEnabled
          ListEmptyComponent={<Text style={styles.emptyListText}>No pending fines</Text>}
        />
      </View>
    )
  }

  // Add transaction handling functions
  const handleResolveTransaction = (transactionId) => {
    Alert.alert("Resolve Fine", "Mark this fine as paid?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Resolve",
        onPress: () => {
          const updatedTransactions = transactions.map((transaction) => {
            if (transaction.id === transactionId) {
              return { ...transaction, status: "resolved" }
            }
            return transaction
          })

          setTransactions(updatedTransactions)
          Alert.alert("Success", "Fine marked as resolved")
        },
      },
    ])
  }

  const handleRemoveTransaction = (transactionId) => {
    Alert.alert("Remove Fine", "Are you sure you want to remove this fine?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const updatedTransactions = transactions.filter((transaction) => transaction.id !== transactionId)

          setTransactions(updatedTransactions)
          Alert.alert("Success", "Fine removed successfully")
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{library ? library.name : "Library Management"}</Text>
      </View>

      {/* Add a new tab for transactions in the tab container */}
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

        <TouchableOpacity
          style={[styles.tab, activeTab === "transactions" && styles.activeTab]}
          onPress={() => setActiveTab("transactions")}
        >
          <Text style={[styles.tabText, activeTab === "transactions" && styles.activeTabText]}>Transactions</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {activeTab === "books" ? (
          <>
            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.addButton} onPress={openBookAddModal} disabled={loading}>
                <Feather name="plus" size={18} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add New Book</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={renderBookItem}
                scrollEnabled={false}
                nestedScrollEnabled
                ListEmptyComponent={<Text style={styles.emptyListText}>No books in the library</Text>}
              />
            )}
          </>
        ) : activeTab === "fines" ? (
          renderFinesContent()
        ) : (
          renderTransactionsContent()
        )}
      </ScrollView>

      {/* Book Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bookModalVisible}
        onRequestClose={() => {
          setBookModalVisible(false)
          resetBookForm()
        }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditMode ? "Edit Book" : "Add New Book"}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setBookModalVisible(false)
                  resetBookForm()
                }}
              >
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title*</Text>
                <TextInput
                  style={styles.input}
                  value={bookTitle}
                  onChangeText={setBookTitle}
                  placeholder="Book title"
                  placeholderTextColor="#757575"
                  editable={!(isEditMode && currentBook && hasBeenBorrowed(currentBook))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Author*</Text>
                <TextInput
                  style={styles.input}
                  value={bookAuthor}
                  onChangeText={setBookAuthor}
                  placeholder="Author name"
                  placeholderTextColor="#757575"
                  editable={!(isEditMode && currentBook && hasBeenBorrowed(currentBook))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>ISBN*</Text>
                <TextInput
                  style={styles.input}
                  value={bookIsbn}
                  onChangeText={setBookIsbn}
                  placeholder="ISBN number"
                  placeholderTextColor="#757575"
                  editable={!(isEditMode && currentBook && hasBeenBorrowed(currentBook))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Publisher*</Text>
                <TextInput
                  style={styles.input}
                  value={bookPublisher}
                  onChangeText={setBookPublisher}
                  placeholder="Publisher name"
                  placeholderTextColor="#757575"
                  editable={!(isEditMode && currentBook && hasBeenBorrowed(currentBook))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description*</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bookDescription}
                  onChangeText={setBookDescription}
                  placeholder="Book description"
                  placeholderTextColor="#757575"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Cover Image URL</Text>
                <TextInput
                  style={styles.input}
                  value={bookCoverImage}
                  onChangeText={setBookCoverImage}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor="#757575"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Number of Copies*</Text>
                <TextInput
                  style={styles.input}
                  value={bookCopiesCount}
                  onChangeText={setBookCopiesCount}
                  placeholder="Number of copies"
                  placeholderTextColor="#757575"
                  keyboardType="numeric"
                />
              </View>

              {isEditMode && currentBook && hasBeenBorrowed(currentBook) && (
                <View style={styles.warningBox}>
                  <Feather name="alert-triangle" size={18} color="#FFD700" />
                  <Text style={styles.warningText}>This book has been borrowed. Some fields cannot be edited.</Text>
                </View>
              )}

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveBook} disabled={loading}>
                <LinearGradient
                  colors={["#4568DC", "#B06AB3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save Book"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Fine Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fineModalVisible}
        onRequestClose={() => {
          setFineModalVisible(false)
          resetFineForm()
        }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditMode ? "Edit Fine" : "Add New Fine"}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setFineModalVisible(false)
                  resetFineForm()
                }}
              >
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Fine Type*</Text>
                <TextInput
                  style={styles.input}
                  value={fineType}
                  onChangeText={setFineType}
                  placeholder="e.g. Overdue, Damaged, Lost"
                  placeholderTextColor="#757575"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount ($)*</Text>
                <TextInput
                  style={styles.input}
                  value={fineAmount}
                  onChangeText={setFineAmount}
                  placeholder="Fine amount"
                  placeholderTextColor="#757575"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description*</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={fineDescription}
                  onChangeText={setFineDescription}
                  placeholder="Fine description"
                  placeholderTextColor="#757575"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Active</Text>
                  <TouchableOpacity
                    style={[styles.toggleSwitch, fineActive ? styles.toggleActive : styles.toggleInactive]}
                    onPress={() => setFineActive(!fineActive)}
                  >
                    <View style={[styles.toggleHandle, fineActive ? styles.handleActive : styles.handleInactive]} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>
                  {fineActive ? "This fine is currently active" : "This fine is currently inactive"}
                </Text>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveFine} disabled={loading}>
                <LinearGradient
                  colors={["#4568DC", "#B06AB3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save Fine"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

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
  finesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  finesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  finesDescription: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 20,
  },
  addFineButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4568DC",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addFineButtonText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 14,
  },
  fineItem: {
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
  },
  fineInfo: {
    flex: 1,
  },
  fineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  fineType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeStatus: {
    backgroundColor: "#4CAF50",
  },
  inactiveStatus: {
    backgroundColor: "#757575",
  },
  fineAmount: {
    fontSize: 18,
    color: "#B06AB3",
    fontWeight: "bold",
    marginBottom: 5,
  },
  fineDescription: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  fineActions: {
    justifyContent: "space-around",
  },
  fineAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  toggleButton: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    margin: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 5,
  },
  modalForm: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333333",
    padding: 12,
    fontSize: 16,
    color: "#FFFFFF",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  warningText: {
    color: "#FFD700",
    marginLeft: 8,
    flex: 1,
  },
  saveButton: {
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  gradientButton: {
    padding: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helperText: {
    color: "#B0B0B0",
    fontSize: 14,
    marginTop: 4,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#4568DC",
  },
  toggleInactive: {
    backgroundColor: "#333333",
  },
  toggleHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  handleActive: {
    transform: [{ translateX: 22 }],
  },
  handleInactive: {
    transform: [{ translateX: 0 }],
  },
  transactionItem: {
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  transactionDetail: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 2,
  },
  transactionAmount: {
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#B0B0B0",
    marginTop: 5,
  },
  transactionActions: {
    justifyContent: "space-around",
  },
  transactionAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  resolveButton: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
  },
  transactionsContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  transactionsDescription: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 20,
  },
  checkOverdueButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4568DC",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  checkOverdueButtonText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 14,
  },
})

export default ManageLibraryScreen

