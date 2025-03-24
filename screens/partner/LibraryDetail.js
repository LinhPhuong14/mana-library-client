import React from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const sampleLibraryDetails = {
    name: "City Central Library",
    description: "A vibrant community library with a diverse collection of books and resources.",
    location: "Downtown",
    isPublic: true,
    books: [
        { title: "The Catcher in the Rye", author: "J.D. Salinger" },
        { title: "Brave New World", author: "Aldous Huxley" },
        { title: "Pride and Prejudice", author: "Jane Austen" },
        { title: "Moby-Dick", author: "Herman Melville" },
    ],
};

const LibraryDetailScreen = () => {
    const { name, description, location, isPublic, books } = sampleLibraryDetails;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.libraryName}>{name}</Text>
                <Text style={styles.libraryDescription}>{description}</Text>
                <Text style={styles.libraryInfo}>Location: {location}</Text>
                <Text style={styles.libraryInfo}>
                    Status: {isPublic ? "Public" : "Private"}
                </Text>

                {/* Books List */}
                <View style={styles.booksSection}>
                    <Text style={styles.sectionTitle}>Available Books</Text>
                    <FlatList
                        data={books}
                        keyExtractor={(item) => item.title}
                        nestedScrollEnabled
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <LinearGradient
                                colors={["#4568DC", "#B06AB3"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.bookCard}
                            >
                                <View style={styles.bookInfo}>
                                    <Text style={styles.bookTitle}>{item.title}</Text>
                                    <Text style={styles.bookAuthor}>by {item.author}</Text>
                                </View>
                            </LinearGradient>
                        )}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#121212",
    },
    container: {
        padding: 20,
    },
    libraryName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#B06AB3",
        marginBottom: 10,
    },
    libraryDescription: {
        fontSize: 16,
        color: "#FFFFFF",
        marginBottom: 10,
    },
    libraryInfo: {
        fontSize: 14,
        color: "#E0E0E0",
        marginBottom: 5,
    },
    booksSection: {
        marginTop: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 10,
    },
    bookCard: {
        flexDirection: "row",
        borderRadius: 15,
        padding: 15,
        marginVertical: 8,
        alignItems: "center",
    },
    bookInfo: {
        flex: 1,
        marginLeft: 5,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    bookAuthor: {
        fontSize: 14,
        color: "#E0E0E0",
        marginTop: 4,
    },
});

export default LibraryDetailScreen;
