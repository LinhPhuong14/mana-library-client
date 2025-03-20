import React, { useState } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const DEMO_BOOKS = [
    {
        id: "1",
        title: "Atomic Habits",
        author: "James Clear",
        isbn: "9781847941831",
        category: "Self-Help",
        status: "available",
        copies: 5,
        availableCopies: 3,
        description: "A guide to building good habits and breaking bad ones using small, incremental changes."
    },
    {
        id: "2",
        title: "Designing Data-Intensive Applications",
        author: "Martin Kleppmann",
        isbn: "9781449373320",
        category: "Technology",
        status: "available",
        copies: 2,
        availableCopies: 0,
        description: "An in-depth look at the design and architecture of modern data systems, ideal for tech enthusiasts."
    },
    {
        id: "3",
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "9780132350884",
        category: "Technology",
        status: "available",
        copies: 3,
        availableCopies: 1,
        description: "A handbook for software developers on writing clean, maintainable, and efficient code."
    },
    {
        id: "4",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        isbn: "9780857197689",
        category: "Finance",
        status: "available",
        copies: 4,
        availableCopies: 2,
        description: "Explores how people think about money and how emotions influence financial decisions."
    },
    {
        id: "5",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "9780061120084",
        category: "Fiction",
        status: "available",
        copies: 6,
        availableCopies: 4,
        description: "A Pulitzer Prize-winning novel that addresses serious social issues through a young girl's perspective."
    },
    {
        id: "6",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "9780743273565",
        category: "Fiction",
        status: "available",
        copies: 3,
        availableCopies: 3,
        description: "A classic American novel that delves into themes of wealth, love, and the pursuit of the American Dream."
    },
    {
        id: "7",
        title: "Educated",
        author: "Tara Westover",
        isbn: "9780399590504",
        category: "Memoir",
        status: "available",
        copies: 2,
        availableCopies: 1,
        description: "A memoir recounting the author’s journey from a survivalist family to earning a PhD at Cambridge."
    },
    {
        id: "8",
        title: "The Alchemist",
        author: "Paulo Coelho",
        isbn: "9780062315007",
        category: "Fiction",
        status: "available",
        copies: 8,
        availableCopies: 5,
        description: "An inspiring story of a shepherd's quest for treasure and personal legend."
    },
];

const CATEGORIES = ["All", "Fiction", "Technology", "Self-Help", "Finance", "Memoir"];

const BookListScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showAll, setShowAll] = useState(false);

    const [books, setBooks] = useState(DEMO_BOOKS); // Manage borrow status dynamically

    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setShowAll(false); // Reset the book list when the category changes
    };

    const toggleBorrowStatus = (id) => {
        setBooks((prevBooks) =>
            prevBooks.map((book) =>
                book.id === id ? { ...book, borrowed: !book.borrowed } : book
            )
        );
    };

    const filteredBooks = books.filter((book) => {
        const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const displayedBooks = showAll ? filteredBooks : filteredBooks.slice(0, 3);

    return (
        <SafeAreaView style={styles.container}>
            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search books..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={handleSearch}
            />

            {/* Category Pills */}
            <View style={styles.categoriesContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryPill,
                                selectedCategory === item && styles.selectedCategoryPill,
                            ]}
                            onPress={() => handleCategorySelect(item)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategory === item && styles.selectedCategoryText,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Book List */}
            <FlatList
                data={displayedBooks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.bookCard}
                        onPress={() => navigation.navigate("BookDetail", { book: item })}
                    >
                        <View style={styles.bookInfo}>
                            <Text style={styles.bookTitle}>{item.title}</Text>
                            <Text style={styles.bookDescription}>{item.description}</Text>
                            <TouchableOpacity
                                style={[styles.borrowButton, item.borrowed && styles.borrowedButton]}
                                onPress={() => toggleBorrowStatus(item.id)}
                            >
                                <Text style={[styles.borrowText, item.borrowed && styles.borrowedText]}>
                                    {item.borrowed ? "Borrowed" : "Borrow"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {/* Show More Button */}
            {filteredBooks.length > 3 && (
                <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAll(!showAll)}>
                    <LinearGradient
                        colors={["#4568DC", "#B06AB3"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.showMoreText}>{showAll ? "Show Less" : "Show More"}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        alignItems: "center",
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
    },
    searchBar: {
        backgroundColor: "#1E1E1E",
        padding: 10,
        borderRadius: 10,
        fontSize: 16,
        color: "#fff",
        width: "100%",
        marginBottom: 20,
    },
    categoriesContainer: {
        paddingHorizontal: 12,
        marginBottom: 8,
        height: 40,
    },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#2A2A2A",
        marginRight: 8,
        marginBottom: 8,
    },
    selectedCategoryPill: {
        backgroundColor: "#4568DC",
    },
    categoryText: {
        color: "#FFFFFF",
        fontSize: 14,
    },
    selectedCategoryText: {
        fontWeight: "bold",
    },
    bookCard: {
        backgroundColor: "#1E1E1E",
        borderRadius: 10,
        padding: 15,
        width: "100%",
        marginBottom: 10,
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    bookDescription: {
        fontSize: 14,
        color: "#AAAAAA",
        marginVertical: 5,
    },
    showMoreButton: {
        width: "100%",
        marginTop: 20,
        borderRadius: 30,
        overflow: "hidden",
    },
    gradientButton: {
        paddingVertical: 15,
        alignItems: "center",
    },
    showMoreText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    borrowButton: {
        borderWidth: 1,
        borderColor: "#4568DC",
        padding: 6,
        borderRadius: 10,
        width: 100,
        alignItems: "center",
        marginTop: 10,
    },
    borrowedButton: {
        backgroundColor: "#4568DC", // Highlight borrowed books
    },
    borrowText: {
        color: "#4568DC",
        fontSize: 14,
        fontWeight: "600",
    },
    borrowedText: {
        color: "#FFFFFF", // Change text color for borrowed state
    },
});

export default BookListScreen;
