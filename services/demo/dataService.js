import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const STORAGE_KEYS = {
  LIBRARIES: "mana_libraries",
  BOOKS: "mana_books",
  USERS: "mana_users",
  TRANSACTIONS: "mana_transactions",
  CURRENT_USER: "mana_current_user",
};

// Initialize with demo data if empty
export const initializeStorage = async () => {
  const libraries = await AsyncStorage.getItem(STORAGE_KEYS.LIBRARIES);
  const books = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
  const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);

  if (!libraries) {
    await AsyncStorage.setItem(STORAGE_KEYS.LIBRARIES, JSON.stringify(DEMO_LIBRARIES));
  }

  if (!books) {
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(DEMO_BOOKS));
  }

  if (!users) {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
  }

  if (!(await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS))) {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
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

// More CRUD operations for users, transactions, borrowing logic...

// Sample demo data
const DEMO_LIBRARIES = [
  {
    id: "lib1",
    name: "Community Library",
    owner: "user1",
    description: "A collection of books for everyone",
    isPublic: true,
    location: "123 Main Street",
    contact: "library@example.com",
  },
  {
    id: "lib2",
    name: "Science Fiction Collection",
    owner: "user2",
    description: "Sci-fi books for enthusiasts",
    isPublic: true,
    location: "456 Park Avenue",
    contact: "scifi@example.com",
  },
];

const DEMO_BOOKS = [
  {
    id: "book1",
    libraryId: "lib1",
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9781847941831",
    description: "Tiny Changes, Remarkable Results",
    copies: [
      {
        id: 1,
        borrowedBy: "user3",
        borrowDate: new Date(2025, 2, 10).toISOString(),
        dueDate: new Date(2025, 2, 24).toISOString(),
      },
      {
        id: 2,
        borrowedBy: null,
      },
    ],
    reservedBy: ["user4", "user5"],
  },
  {
    id: "book2",
    libraryId: "lib1",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    isbn: "9780857197689",
    description: "Timeless lessons on wealth, greed, and happiness",
    copies: [
      {
        id: 1,
        borrowedBy: null,
      },
    ],
    reservedBy: [],
  },
];

const DEMO_USERS = [
  {
    id: "user1",
    name: "Library Admin",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "user2",
    name: "Book Collector",
    email: "collector@example.com",
    role: "partner",
  },
  {
    id: "user3",
    name: "Regular Reader",
    email: "reader@example.com",
    role: "user",
  },
];

export default {
  initializeStorage,
  getLibraries,
  addLibrary,
  getBooks,
  addBook,
  STORAGE_KEYS,
};
