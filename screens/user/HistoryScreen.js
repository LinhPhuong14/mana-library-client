import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { TabView, TabBar, SceneMap } from "react-native-tab-view"; // Ensure this is installed
import { useWindowDimensions } from "react-native";

const borrowedBooks = [
    { title: "The Alchemist", returnDate: "Mar 24, 2024" },
    { title: "Moby-Dick", returnDate: "Apr 10, 2024" },
    { title: "War and Peace", returnDate: "May 05, 2024" },
];

const readedBooks = [
    { title: "The Great Gatsby", readAt: "Mar 24, 2024" },
    { title: "To Kill a Mockingbird", readAt: "Apr 10, 2024" },
    { title: "1984", readAt: "May 05, 2024" },
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
                        indicatorStyle={{ backgroundColor: "blue" }}
                        style={{ backgroundColor: "white" }}
                        activeColor="blue"
                        inactiveColor="gray"
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        marginLeft: 20,
    },
    bookItem: {
        backgroundColor: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        margin: 10,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    bookDate: {
        fontSize: 14,
        color: "#555",
        marginTop: 5,
    },
});

export default HistoryScreen;
