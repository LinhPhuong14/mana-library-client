import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const BookDetailScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>The 48 Laws of Power</Text>
            <Text style={styles.author}>Robert Greene</Text>

            <Text style={styles.description}>
                Amoral, cunning, ruthless, and instructive, "The 48 Laws of Power" has
                become the bible for those who seek to gain and maintain power. With a
                perspective drawn from the wisdom of the ages and the perspicacity of
                the present, Greene reveals the principles behind the strategies of
                history's greatest figures, from Sun Tzu to Bismarck and beyond. Each
                law is illustrated with examples from across history and literature, and
                explained with a clarity that is as compelling as it is shocking.
            </Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.borrowedButton}>
                    <Text style={styles.buttonText}>Borrowed</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.heartButton}>
                    <FontAwesome name="heart-o" size={20} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.returnContainer}>
                <TouchableOpacity style={styles.returnButton}>
                    <Text style={styles.buttonText}>Return</Text>
                </TouchableOpacity>
                <Text style={styles.dueDate}>Due: Mar 12, 2025</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
    },
    author: {
        fontSize: 16,
        color: "gray",
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
    },
    borrowedButton: {
        backgroundColor: "#555",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    heartButton: {
        marginLeft: 10,
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    returnContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    returnButton: {
        backgroundColor: "black",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    dueDate: {
        marginLeft: 10,
        fontSize: 14,
        color: "gray",
    },
});

export default BookDetailScreen;
