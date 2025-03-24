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

export const addLibrary = async (library) => {
  const libraries = await getLibraries();
  libraries.push({
    id: Date.now().toString(),
    ...library,
  });
  await AsyncStorage.setItem(STORAGE_KEYS.LIBRARIES, JSON.stringify(libraries));
  return libraries;
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

export const addBook = async (book) => {
  const books = await getBooks();
  books.push({
    id: Date.now().toString(),
    ...book,
  });
  await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  return books;
};

export default {
  initializeDemoData,
  getLibraries,
  addLibrary,
  getBooks,
  addBook,
  STORAGE_KEYS,
};
