import Reac, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";

const BookDetailScreen = ({ route }) => {
    const { book } = route.params;
    const [isBorrowed, setIsBorrowed] = useState(book.borrowed || false);

    const toggleBorrowStatus = () => {
        setIsBorrowed((prev) => !prev);
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>by {book.author}</Text>

            <Text style={styles.description}>
                {book.description}
            </Text>

            <View style={styles.buttonContainer}>
                {isBorrowed ? (
                    <>
                        <TouchableOpacity style={[styles.button, styles.borrowedButton]} disabled>
                            <Text style={[styles.buttonText, styles.borrowedText]}>Borrowed</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={toggleBorrowStatus}>
                            <LinearGradient
                                colors={["#DC143C", "#FF6347"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>Return</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={styles.button} onPress={toggleBorrowStatus}>
                        <LinearGradient
                            colors={["#4568DC", "#B06AB3"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.buttonText}>Borrow</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 5,
    },
    author: {
        fontSize: 18,
        color: "#B06AB3",
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: "#E0E0E0",
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
    },
    borrowedButton: {
        width: "48%",
        marginRight: 5,
        borderRadius: 6,
        overflow: "hidden",
    },
    heartButton: {
        marginLeft: 10,
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#B06AB3",
        justifyContent: "center",
        alignItems: "center",
    },
    gradientButton: {
        alignItems: "center",
        paddingVertical: 10,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    returnContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
    },
    returnButton: {
        width: "48%",
        marginRight: 5,
        borderRadius: 6,
        overflow: "hidden",
    },
    dueDate: {
        marginLeft: 10,
        fontSize: 14,
        color: "#757575",
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    button: {
        width: "80%",
        borderRadius: 30,
        overflow: "hidden",
        marginBottom: 10,
    },
    gradientButton: {
        paddingVertical: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    borrowedButton: {
        backgroundColor: "#4568DC",
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 30,
        width: "80%",
    },
    borrowedText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default BookDetailScreen;
