import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
                    <LinearGradient
                        colors={["#4568DC", "#B06AB3"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.buttonText}>Borrowed</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.heartButton}>
                    <FontAwesome name="heart" size={20} color="#B06AB3" />
                </TouchableOpacity>
            </View>

            <View style={styles.returnContainer}>
                <TouchableOpacity style={styles.returnButton}>
                    <LinearGradient
                        colors={["#FF512F", "#DD2476"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.buttonText}>Return</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.dueDate}>Due: Mar 12, 2025</Text>
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
});

export default BookDetailScreen;
