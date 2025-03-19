import React, { useState } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const initialBooks = [
    { title: "1984", description: "Dystopian novel set in a totalitarian society.", borrowed: false },
    { title: "To Kill a Mockingbird", description: "A story of racial injustice in the American South.", borrowed: false },
    { title: "Pride and Prejudice", description: "Classic novel of manners and marriage.", borrowed: false },
    { title: "The Great Gatsby", description: "A critique of the American Dream.", borrowed: false },
    { title: "Moby Dick", description: "A whaling adventure with deep symbolism.", borrowed: false },
    { title: "War and Peace", description: "Historical novel set during Napoleon's invasion of Russia.", borrowed: false },
    { title: "The Catcher in the Rye", description: "A young man's struggles with society.", borrowed: false },
    { title: "The Hobbit", description: "A fantasy adventure story.", borrowed: false },
    { title: "Brave New World", description: "A dystopian future controlled by technology and conditioning.", borrowed: false },
    { title: "Crime and Punishment", description: "A psychological novel about guilt and redemption.", borrowed: false }
];

const BookListScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [books, setBooks] = useState(initialBooks);
    const [showAll, setShowAll] = useState(false);

    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    const toggleBorrowStatus = (title) => {
        setBooks((prevBooks) =>
            prevBooks.map((book) =>
                book.title === title ? { ...book, borrowed: !book.borrowed } : book
            )
        );
    };

    const handleNavigateToBookDetail = (book) => {
        navigation.navigate("BookDetail", { book });
    };

    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayedBooks = showAll ? filteredBooks : filteredBooks.slice(0, 3);

    return (
        <SafeAreaView style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search books..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={handleSearch}
            />

            <FlatList
                data={displayedBooks}
                keyExtractor={(item) => item.title}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.bookCard}
                        onPress={() => handleNavigateToBookDetail(item)}
                    >
                        <View style={styles.bookInfo}>
                            <Text style={styles.bookTitle}>{item.title}</Text>
                            <Text style={styles.bookDescription}>{item.description}</Text>
                            <TouchableOpacity
                                style={[styles.borrowButton, item.borrowed && styles.borrowedButton]}
                                onPress={() => toggleBorrowStatus(item.title)}
                            >
                                <Text style={[styles.borrowText, item.borrowed && styles.borrowedText]}>
                                    {item.borrowed ? "Borrowed" : "Borrow"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {filteredBooks.length > 3 && (
                <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setShowAll(!showAll)}
                >
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
    borrowButton: {
        borderWidth: 1,
        borderColor: "#6200ea",
        padding: 5,
        borderRadius: 5,
        width: 100,
        alignItems: "center",
        marginTop: 10,
    },
    borrowedButton: {
        backgroundColor: "#6200ea",
    },
    borrowText: {
        color: "#6200ea",
    },
    borrowedText: {
        color: "#FFFFFF",
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
});

export default BookListScreen;
