import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { Avatar, Card, Divider } from "react-native-paper";

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
        <ScrollView contentContainerStyle={styles.container}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <Avatar.Image size={100} source={{ uri: user.avatar }} />
                <Text style={styles.username}>{user.username}</Text>
            </View>

            {/* User Information */}
            <Card style={styles.card}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Date of Birth:</Text>
                    <Text style={styles.value}>{user.dob}</Text>
                </View>
                <Divider />
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{user.email}</Text>
                </View>
                <Divider />
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{user.address}</Text>
                </View>
            </Card>

            {/* Book Statistics */}
            <Card style={styles.card}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Books Borrowed:</Text>
                    <Text style={styles.value}>{user.booksBorrowed}</Text>
                </View>
                <Divider />
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Books Read:</Text>
                    <Text style={styles.value}>{user.booksRead}</Text>
                </View>
            </Card>

            {/* Currently Borrowing */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Books Borrowing</Text>
                {user.booksBorrowing.map((book, index) => (
                    <Text key={index} style={styles.bookItem}>
                        • {book}
                    </Text>
                ))}
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#f5f5f5",
        flexGrow: 1,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    username: {
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 10,
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
    },
    value: {
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    bookItem: {
        fontSize: 16,
        paddingVertical: 2,
    },
});

export default ProfileScreen;
