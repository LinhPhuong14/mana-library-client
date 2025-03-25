import AsyncStorage from "@react-native-async-storage/async-storage";
import usersData from "./data/users.json";
import librariesData from "./data/libraries.json";
import booksData from "./data/books.json";
import transactionsData from "./data/transactions.json";
import demoData from "./data/demo.json";

// Storage keys
const STORAGE_KEYS = {
  LIBRARIES: "mana_libraries",
  BOOKS: "mana_books",
  USERS: "mana_users",
  TRANSACTIONS: "mana_transactions",
  // demo data
  DEMO: "demo_data",
  // special key for the current user
  CURRENT_USER: "mana_current_user",
};

export const initializeDemoData = async () => {
  try {
    // Check if data already exists by checking users
    const existingUsers = await AsyncStorage.getItem("mana_users");

    if (existingUsers === null) {
      // Initialize all data since it doesn't exist
      await AsyncStorage.setItem("mana_users", JSON.stringify(usersData.users));
      await AsyncStorage.setItem("mana_libraries", JSON.stringify(librariesData.libraries));
      await AsyncStorage.setItem("mana_books", JSON.stringify(booksData.books));
      await AsyncStorage.setItem("mana_transactions", JSON.stringify(transactionsData.transactions));
      await AsyncStorage.setItem("demo_data", JSON.stringify(demoData));

      console.log("Demo data initialized successfully");
      return true;
    } else {
      console.log("Data already exists, skipping initialization");
      return false;
    }
  } catch (error) {
    console.error("Error initializing demo data:", error);
    return false;
  }
};

// CRUD operations for libraries
export const getLibraries = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.LIBRARIES);
  return JSON.parse(data) || [];
};

export const getLibrary = async (libraryId) => {
  const libraries = await getLibraries();
  return libraries.find((lib) => lib.id === libraryId);
};

export const addLibrary = async (library) => {
  const libraries = await getLibraries();
  const newLibrary = {
    id: library.id || Date.now().toString(),
    ...library,
  };
  libraries.push(newLibrary);
  await AsyncStorage.setItem(STORAGE_KEYS.LIBRARIES, JSON.stringify(libraries));
  return newLibrary;
};

export const updateLibrary = async (libraryId, updates) => {
  const libraries = await getLibraries();
  const index = libraries.findIndex((lib) => lib.id === libraryId);

  if (index !== -1) {
    libraries[index] = { ...libraries[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.LIBRARIES, JSON.stringify(libraries));
    return libraries[index];
  }
  return null;
};

export const deleteLibrary = async (libraryId) => {
  const libraries = await getLibraries();
  const updatedLibraries = libraries.filter((lib) => lib.id !== libraryId);
  await AsyncStorage.setItem(STORAGE_KEYS.LIBRARIES, JSON.stringify(updatedLibraries));
  return updatedLibraries;
};

// CRUD operations for books
export const getBooks = async (libraryId = null) => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
  const books = JSON.parse(data) || [];

  if (libraryId) {
    return books.filter((book) => book.libraryId === libraryId);
  }
  return books;
};

export const getBook = async (bookId) => {
  const books = await getBooks();
  return books.find((book) => book.id === bookId);
};

export const addBook = async (book) => {
  const books = await getBooks();
  const newBook = {
    id: book.id || Date.now().toString(),
    ...book,
  };
  books.push(newBook);
  await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  return newBook;
};

export const updateBook = async (bookId, updates) => {
  const books = await getBooks();
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = { ...books[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    return books[index];
  }
  return null;
};

export const deleteBook = async (bookId) => {
  const books = await getBooks();
  const updatedBooks = books.filter((book) => book.id !== bookId);
  await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updatedBooks));
  return updatedBooks;
};

// CRUD operations for users
export const getUsers = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
  return JSON.parse(data) || [];
};

export const getUser = async (userId) => {
  const users = await getUsers();
  return users.find((user) => user.id === userId);
};

export const addUser = async (user) => {
  const users = await getUsers();
  const newUser = {
    id: user.id || Date.now().toString(),
    ...user,
  };
  users.push(newUser);
  await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return newUser;
};

export const updateUser = async (userId, updates) => {
  const users = await getUsers();
  const index = users.findIndex((user) => user.id === userId);

  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[index];
  }
  return null;
};

// CRUD operations for transactions
export const getTransactions = async (filters = {}) => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  let transactions = JSON.parse(data) || [];

  // Apply filters if provided
  if (filters.userId) {
    transactions = transactions.filter((tx) => tx.userId === filters.userId);
  }

  if (filters.bookId) {
    transactions = transactions.filter((tx) => tx.bookId === filters.bookId);
  }

  if (filters.libraryId) {
    // We need to join with books to filter by libraryId
    const books = await getBooks();
    const libraryBookIds = books.filter((book) => book.libraryId === filters.libraryId).map((book) => book.id);

    transactions = transactions.filter((tx) => libraryBookIds.includes(tx.bookId));
  }

  if (filters.type) {
    transactions = transactions.filter((tx) => tx.type === filters.type);
  }

  if (filters.status) {
    transactions = transactions.filter((tx) => tx.status === filters.status);
  }

  // Sort by date (newest first) by default
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  return transactions;
};

export const addTransaction = async (transaction) => {
  const transactions = await getTransactions();
  const newTransaction = {
    id: transaction.id || `txn${Date.now()}`,
    date: transaction.date || new Date().toISOString(),
    ...transaction,
  };
  transactions.push(newTransaction);
  await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  return newTransaction;
};

export const updateTransaction = async (transactionId, updates) => {
  const transactions = await getTransactions();
  const index = transactions.findIndex((tx) => tx.id === transactionId);

  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return transactions[index];
  }
  return null;
};

// Function to get fine transactions (just filter transactions by type)
export const getFines = async (filters = {}) => {
  // Combine the passed filters with the type filter for fines
  const fineFilters = { ...filters, type: "fine" };
  return getTransactions(fineFilters);
};

// Function to get fines by user ID
export const getUserFines = async (userId) => {
  return getFines({ userId });
};

// Function to get fines by library (uses the book's libraryId)
export const getLibraryFines = async (libraryId) => {
  return getFines({ libraryId });
};

// Function to add a fine
export const addFine = async (fine) => {
  // Ensure it has the correct type
  const fineTransaction = {
    ...fine,
    type: "fine",
    date: fine.date || new Date().toISOString(),
  };
  return addTransaction(fineTransaction);
};

// Function to update a fine
export const updateFine = async (fineId, updates) => {
  return updateTransaction(fineId, updates);
};

// Function to mark a fine as paid
export const payFine = async (fineId) => {
  return updateTransaction(fineId, { status: "paid" });
};

// Helper functions for book operations
export const borrowBook = async (bookId, userId, copyId) => {
  const book = await getBook(bookId);
  if (!book) throw new Error("Book not found");

  const copyIndex = book.copies.findIndex((copy) => copy.id === copyId && !copy.borrowedBy);
  if (copyIndex === -1) throw new Error("No available copy found");

  // Update the book copy
  const borrowDate = new Date().toISOString();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan period

  book.copies[copyIndex] = {
    ...book.copies[copyIndex],
    borrowedBy: userId,
    borrowDate: borrowDate,
    dueDate: dueDate.toISOString(),
  };

  // Update the book
  await updateBook(bookId, { copies: book.copies });

  // Create a transaction record
  const transaction = {
    userId,
    bookId,
    copyId,
    type: "borrow",
    date: borrowDate,
    amount: 0, // Could be a fee for borrowing
    status: "completed",
  };

  await addTransaction(transaction);

  return { book, transaction };
};

export const returnBook = async (bookId, userId, copyId) => {
  const book = await getBook(bookId);
  if (!book) throw new Error("Book not found");

  const copyIndex = book.copies.findIndex((copy) => copy.id === copyId && copy.borrowedBy === userId);
  if (copyIndex === -1) throw new Error("Book copy not found or not borrowed by this user");

  // Check if overdue and create a fine if necessary
  const now = new Date();
  const dueDate = new Date(book.copies[copyIndex].dueDate);
  let fine = null;

  if (now > dueDate) {
    const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
    const fineAmount = daysOverdue * 0.5; // $0.50 per day overdue

    fine = {
      userId,
      bookId,
      copyId,
      type: "fine",
      date: now.toISOString(),
      amount: fineAmount,
      status: "pending",
      reason: "overdue",
    };

    await addTransaction(fine);
  }

  // Update the book copy
  book.copies[copyIndex] = {
    ...book.copies[copyIndex],
    borrowedBy: null,
    borrowDate: null,
    dueDate: null,
  };

  // Update the book
  await updateBook(bookId, { copies: book.copies });

  // Create a return transaction record
  const transaction = {
    userId,
    bookId,
    copyId,
    type: "return",
    date: now.toISOString(),
    amount: 0,
    status: "completed",
  };

  await addTransaction(transaction);

  return { book, transaction, fine };
};

export const reserveBook = async (bookId, userId) => {
  const book = await getBook(bookId);
  if (!book) throw new Error("Book not found");

  // Check if user already has a reservation
  if (book.reservedBy && book.reservedBy.includes(userId)) {
    throw new Error("User already has a reservation for this book");
  }

  // Add user to reservation list
  const reservedBy = book.reservedBy || [];
  reservedBy.push(userId);

  // Update the book
  await updateBook(bookId, { reservedBy });

  // Create a reservation transaction
  const transaction = {
    userId,
    bookId,
    copyId: 0, // Reservation doesn't target a specific copy
    type: "reservation",
    date: new Date().toISOString(),
    amount: 1.0, // Reservation fee
    status: "active",
  };

  await addTransaction(transaction);

  return { book: await getBook(bookId), transaction };
};

export default {
  initializeDemoData,
  getLibraries,
  getLibrary,
  addLibrary,
  updateLibrary,
  deleteLibrary,
  getBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  getUsers,
  getUser,
  addUser,
  updateUser,
  getTransactions,
  addTransaction,
  updateTransaction,
  borrowBook,
  returnBook,
  reserveBook,
  STORAGE_KEYS,
  getFines,
  getUserFines,
  getLibraryFines,
  addFine,
  updateFine,
  payFine,
};
