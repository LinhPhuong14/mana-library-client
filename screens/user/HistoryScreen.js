import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Import SafeAreaView
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import { useWindowDimensions } from "react-native";

const borrowedBooks = [
    {
        id: "4",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        isbn: "9780857197689",
        category: "Finance",
        status: "available",
        copies: 4,
        availableCopies: 2,
        returnDate: "Mar 24, 2024",
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
        returnDate: "Mar 24, 2024",
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
        returnDate: "Mar 24, 2024",
        description: "A classic American novel that delves into themes of wealth, love, and the pursuit of the American Dream."
    },
];

const readedBooks = [
    {
        id: "4",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        isbn: "9780857197689",
        category: "Finance",
        status: "available",
        copies: 4,
        availableCopies: 2,
        readAt: "Mar 10, 2024",
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
        readAt: "Mar 5, 2024",
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
        readAt: "Mar 19, 2024",
        description: "A classic American novel that delves into themes of wealth, love, and the pursuit of the American Dream."
    },
];

const BorrowedBooks = () => (
    <FlatList
        data={borrowedBooks}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
            <View style={styles.bookItem}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookDate}>Return by: {item.returnDate}</Text>
            </View>
        )}
    />
);

const ReadBooks = () => (
    <FlatList
        data={readedBooks}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
            <View style={styles.bookItem}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookDate}>Read on: {item.readAt}</Text>
            </View>
        )}
    />
);

const HistoryScreen = () => {
    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: "borrowed", title: "Borrowed" },
        { key: "readed", title: "Read" },
    ]);

    const renderScene = SceneMap({
        borrowed: BorrowedBooks,
        readed: ReadBooks,
    });

    return (
        <SafeAreaView style={styles.safeArea}> {/* Wrap with SafeAreaView */}
            <View style={styles.container}>
                <Text style={styles.header}>Books History</Text>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    renderTabBar={(props) => (
                        <TabBar
                            {...props}
                            indicatorStyle={{ backgroundColor: "#B06AB3" }}
                            style={styles.tabBar}
                            activeColor="#B06AB3"
                            inactiveColor="#757575"
                        />
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#121212",
    },
    container: {
        flex: 1,
        paddingTop: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 15,
        marginLeft: 20,
    },
    bookItem: {
        backgroundColor: "#1E1E1E",
        padding: 15,
        borderRadius: 8,
        margin: 10,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    bookDate: {
        fontSize: 14,
        color: "#757575",
        marginTop: 5,
    },
    tabBar: {
        backgroundColor: "#1E1E1E",
    },
});

export default HistoryScreen;
