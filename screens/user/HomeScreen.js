import React from "react";
import { View, Text, FlatList, Image, StyleSheet, ScrollView } from "react-native";

const recommendedBooks = [
    {
        title: "The Great Gatsby",
        description: "A classic novel set in the Roaring Twenties.",
        image: { uri: "https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    },
    {
        title: "To Kill a Mockingbird",
        description: "A profound novel about racial injustice.",
        image: { uri: "https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    },
    {
        title: "1984",
        description: "A dystopian novel about totalitarianism.",
        image: { uri: "https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    },
];

const borrowedBooks = [
    { title: "The Great Gatsby", returnDate: "Mar 24, 2024" },
    { title: "To Kill a Mockingbird", returnDate: "Apr 10, 2024" },
    { title: "1984", returnDate: "May 05, 2024" },
];

const HomeScreen = () => {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.username}>User!</Text>
            <Text style={styles.stat}>You have completed <Text style={styles.bold}>32</Text> books so far.</Text>
            <Text style={styles.stat}>You are lending <Text style={styles.bold}>2</Text> books.</Text>

            {/* Recommended Books */}
            <View style={styles.recommendedBooks}>
                <Text style={styles.sectionTitle}>We think you'll also like these</Text>
                <FlatList
                    data={recommendedBooks}
                    keyExtractor={(item) => item.title}
                    nestedScrollEnabled
                    scrollEnabled={false} // Prevent FlatList from scrolling inside ScrollView
                    renderItem={({ item }) => (
                        <View style={styles.bookCard}>
                            <View style={styles.bookInfo}>
                                <Text style={styles.bookTitle}>{item.title}</Text>
                                <Text style={styles.bookDescription}>{item.description}</Text>
                            </View>
                            <Image source={item.image} style={styles.bookImage} />
                        </View>
                    )}
                />
            </View>

            {/* Borrowed Books */}
            <View style={styles.borrowedBooks}>
                <Text style={styles.sectionTitle}>Recent Borrowed Books</Text>
                <FlatList
                    data={borrowedBooks}
                    keyExtractor={(item) => item.title}
                    nestedScrollEnabled
                    scrollEnabled={false} // Prevent FlatList from scrolling inside ScrollView
                    renderItem={({ item }) => (
                        <View style={styles.borrowedBook}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.returnDate}>Return by {item.returnDate}</Text>
                        </View>
                    )}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
    },
    greeting: {
        fontSize: 20,
    },
    username: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 5,
    },
    stat: {
        fontSize: 16,
        marginTop: 5,
    },
    bold: {
        fontWeight: "bold",
    },
    recommendedBooks: {
        marginTop: 50,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    bookCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 10,
        marginVertical: 8,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3, // For Android shadow
    },
    bookImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginLeft: 5,
    },
    bookInfo: {
        flex: 1,
        marginLeft: 5,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    bookDescription: {
        fontSize: 14,
        color: "#555",
        marginTop: 4,
    },
    borrowedBooks: {
        marginTop: 30,
    },
    borrowedBook: {
        marginTop: 10,
        padding: 10,
    },
    title: {
        fontSize: 18,
        color: "#636ae8",
        fontWeight: "bold",
    },
    returnDate: {
        fontSize: 14,
        color: "#555",
        marginTop: 2,
    },
});

export default HomeScreen;
