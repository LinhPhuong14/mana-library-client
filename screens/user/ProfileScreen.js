import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const ProfileScreen = () => {
    const [user, setUser] = useState({
        avatar: "https://i.pravatar.cc/150", // Dummy avatar
        username: "John Doe",
        dob: "1995-08-15",
        email: "johndoe@example.com",
        address: "123 Main St, New York, USA",
        booksBorrowed: 20,
        booksRead: 15,
        booksBorrowing: ["Atomic Habits", "The Alchemist", "Clean Code"],
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <Avatar.Image size={100} source={{ uri: user.avatar }} />
                    <Text style={styles.username}>{user.username}</Text>
                </View>

                {/* User Information */}
                <LinearGradient
                    colors={["#4568DC", "#B06AB3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.card}
                >
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Date of Birth:</Text>
                        <Text style={styles.value}>{user.dob}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{user.email}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Address:</Text>
                        <Text style={styles.value}>{user.address}</Text>
                    </View>
                </LinearGradient>

                {/* Book Statistics */}
                <LinearGradient
                    colors={["#FF512F", "#DD2476"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.card}
                >
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Books Borrowed:</Text>
                        <Text style={styles.value}>{user.booksBorrowed}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Books Read:</Text>
                        <Text style={styles.value}>{user.booksRead}</Text>
                    </View>
                </LinearGradient>

                {/* Currently Borrowing */}
                <LinearGradient
                    colors={["#8E2DE2", "#4A00E0"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.card}
                >
                    <Text style={styles.sectionTitle}>Books Borrowing</Text>
                    {user.booksBorrowing.map((book, index) => (
                        <Text key={index} style={styles.bookItem}>
                            • {book}
                        </Text>
                    ))}
                </LinearGradient>
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
        flexGrow: 1,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    username: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginTop: 10,
    },
    card: {
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3, // For Android shadows
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    value: {
        fontSize: 16,
        color: "#FFFFFF",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        marginVertical: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 10,
    },
    bookItem: {
        fontSize: 16,
        color: "#FFFFFF",
        paddingVertical: 2,
    },
});

export default ProfileScreen;
