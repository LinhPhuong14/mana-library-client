import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ScrollView } from "react-native";
import { Searchbar, FAB, Chip, Divider, Text, ActivityIndicator, Menu, Button } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import bookService from "../../services/bookService";
import BookListItem from "../../components/staff/BookListItem";
import EmptyState from "../../components/common/EmptyState";
import ErrorDisplay from "../../components/common/ErrorDisplay";

const BooksScreen = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [menuVisible, setMenuVisible] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  // Load books whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadBooks();
    }, [])
  );

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using bookService to fetch books with filters
      const booksData = await bookService.getBooks({
        status: selectedFilter !== "all" ? selectedFilter : undefined,
        sort: sortBy,
        search: searchQuery || undefined,
      });

      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (error) {
      console.error("Failed to load books:", error);
      setError("Failed to load books. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Use this when search or filters change
  const applyFiltersLocally = () => {
    loadBooks();
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBooks();
  };

  const onSearch = (query) => {
    setSearchQuery(query);
    // If query is empty, apply filters immediately
    if (!query) {
      applyFiltersLocally();
    }
  };

  const onSubmitSearch = () => {
    applyFiltersLocally();
  };

  const onFilterSelect = (filter) => {
    setSelectedFilter(filter);
    // Need to reload books with new filter
    setLoading(true);
    setTimeout(() => {
      loadBooks();
    }, 100);
  };

  const onSortSelect = (sort) => {
    setSortBy(sort);
    setMenuVisible(false);
    // Need to reload books with new sort
    setLoading(true);
    setTimeout(() => {
      loadBooks();
    }, 100);
  };

  const navigateToBookDetail = (bookId) => {
    navigation.navigate("BookDetail", { bookId });
  };

  const navigateToAddBook = () => {
    navigation.navigate("AddEditBook", { editing: false });
  };

  const handleScanBarcode = () => {
    navigation.navigate("BarcodeScanner", { mode: "search" });
  };

  const renderItem = ({ item }) => (
    <BookListItem
      book={item}
      onPress={() => navigateToBookDetail(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by title, author, or ISBN"
          onChangeText={onSearch}
          onSubmitEditing={onSubmitSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <Button
          icon="barcode-scan"
          mode="text"
          onPress={handleScanBarcode}
          style={styles.scanButton}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Chip
            selected={selectedFilter === "all"}
            onPress={() => onFilterSelect("all")}
            style={styles.filterChip}
          >
            All Books
          </Chip>
          <Chip
            selected={selectedFilter === "available"}
            onPress={() => onFilterSelect("available")}
            style={styles.filterChip}
          >
            Available
          </Chip>
          <Chip
            selected={selectedFilter === "borrowed"}
            onPress={() => onFilterSelect("borrowed")}
            style={styles.filterChip}
          >
            Borrowed
          </Chip>
          <Chip
            selected={selectedFilter === "reserved"}
            onPress={() => onFilterSelect("reserved")}
            style={styles.filterChip}
          >
            Reserved
          </Chip>
        </ScrollView>

        <View>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                icon="sort"
                mode="text"
                onPress={() => setMenuVisible(true)}
              >
                Sort
              </Button>
            }
          >
            <Menu.Item
              onPress={() => onSortSelect("title")}
              title="Title"
            />
            <Menu.Item
              onPress={() => onSortSelect("author")}
              title="Author"
            />
            <Menu.Item
              onPress={() => onSortSelect("published_date")}
              title="Publication Date"
            />
            <Menu.Item
              onPress={() => onSortSelect("added_date")}
              title="Date Added"
            />
          </Menu>
        </View>
      </View>

      <Divider />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#4568DC"
          />
          <Text style={styles.loadingText}>Loading books...</Text>
        </View>
      ) : error ? (
        <ErrorDisplay
          error={error}
          onRetry={loadBooks}
        />
      ) : filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ItemSeparatorComponent={() => <Divider />}
        />
      ) : (
        <EmptyState
          icon="library-books"
          message="No books found"
          description={searchQuery ? "Try a different search term or filter" : "Add some books to get started"}
          actionText="Add Book"
          onAction={navigateToAddBook}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={navigateToAddBook}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 8,
  },
  searchBar: {
    flex: 1,
    elevation: 2,
  },
  scanButton: {
    marginLeft: 8,
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#4568DC",
  },
});

export default BooksScreen;
