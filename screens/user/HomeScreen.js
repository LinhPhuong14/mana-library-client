import React from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Import SafeAreaView
import { LinearGradient } from "expo-linear-gradient";
import ChatScreen from "../auth/ChatScreen";

const recommendedBooks = [
    {
        title: "The Great Gatsby",
        description: "A classic novel set in the Roaring Twenties.",
    },
    {
        title: "To Kill a Mockingbird",
        description: "A profound novel about racial injustice.",
    },
    {
        title: "1984",
        description: "A dystopian novel about totalitarianism.",
    },
];

const borrowedBooks = [
    { title: "The Great Gatsby", returnDate: "Mar 24, 2024" },
    { title: "To Kill a Mockingbird", returnDate: "Apr 10, 2024" },
    { title: "1984", returnDate: "May 05, 2024" },
];

const HomeScreen = () => {
    return (
        <SafeAreaView style={styles.safeArea}> {/* Wrap everything in SafeAreaView */}
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
                                    <Text style={styles.bookDescription}>{item.description}</Text>
                                </View>
                            </LinearGradient>
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
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <View style={styles.borrowedBook}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.returnDate}>Return by {item.returnDate}</Text>
                            </View>
                        )}
                    />
                </View>
                <ChatScreen></ChatScreen>
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
    greeting: {
        fontSize: 20,
        color: "#FFFFFF",
    },
    username: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#B06AB3",
        marginBottom: 5,
    },
    stat: {
        fontSize: 16,
        color: "#FFFFFF",
        marginTop: 5,
    },
    bold: {
        fontWeight: "bold",
        color: "#B06AB3",
    },
    recommendedBooks: {
        marginTop: 50,
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
    bookDescription: {
        fontSize: 14,
        color: "#E0E0E0",
        marginTop: 4,
    },
    borrowedBooks: {
        marginTop: 30,
    },
    borrowedBook: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#1E1E1E",
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        color: "#B06AB3",
        fontWeight: "bold",
    },
    returnDate: {
        fontSize: 14,
        color: "#757575",
        marginTop: 2,
    },
});

export default HomeScreen;
