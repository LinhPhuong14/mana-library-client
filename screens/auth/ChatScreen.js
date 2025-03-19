import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";

// Demo book data
const DEMO_BOOKS = [
    {
        id: "1",
        title: "Atomic Habits",
        author: "James Clear",
        isbn: "9781847941831",
        category: "Self-Help",
        status: "available",
        copies: 5,
        availableCopies: 3,
    },
    {
        id: "2",
        title: "Designing Data-Intensive Applications",
        author: "Martin Kleppmann",
/*************  ✨ Codeium Command ⭐  *************/
/******  e22a2e6e-6903-403f-a401-9c5fd0a50e81  *******/        isbn: "9781449373320",
        category: "Technology",
        status: "available",
        copies: 2,
        availableCopies: 0,
    },
    {
        id: "3",
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "9780132350884",
        category: "Technology",
        status: "available",
        copies: 3,
        availableCopies: 1,
    },
    {
        id: "4",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        isbn: "9780857197689",
        category: "Finance",
        status: "available",
        copies: 4,
        availableCopies: 2,
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
    },
    {
        id: "7",
        title: "Educated",
        author: "Tara Westover",
        isbn: "9780399590504",
        category: "Memoir",
        status: "available",
        copies: 2,
        availableCopies: 1,
    },
    {
        id: "8",
        title: "The Alchemist",
        author: "Paulo Coelho",
        isbn: "9780062315007",
        category: "Fiction",
        status: "available",
        copies: 8,
        availableCopies: 5,
    },
];

const ChatScreen = () => {
    const [chatInput, setChatInput] = useState("");
    const [chatResponse, setChatResponse] = useState("");
    const [modalVisible, setModalVisible] = useState(false);


    const API_KEY = 'AIzaSyBAmflOLvabIlqjl14JzFZNHCFtQLkQ76Y'; // Thay thế bằng API key thực
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;


    const handleChatInput = async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "contents": [{
                        "parts": [{ "text": "Giả tưởng bạn là AI Quản lý của Thư viện của tôi và bạn trả lời những gì có trong thư viện với những cuốn sách sau: " + DEMO_BOOKS.map(book => book.title).join(", ") + ",Luôn luôn nói chào Tâm khi trả lời" + chatInput }]
                    }]
                })
            });

            const data = await response.json();

            setChatResponse(`Bạn: ${chatInput}\nAI: ${data.candidates[0].content.parts[0].text}`);
            setChatInput("");
            console.log(data.candidates[0].content.parts[0].text);
        } catch (error) {
            console.error(`Lỗi khi gửi yêu cầu:`, error);
        }
    };

    const handleSendMessage = () => {
        // Simulate a response
        setChatResponse(`AI: You said '${chatInput}'`);
        setChatInput("");
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    return (
        <View style={styles.container}>
            {/* Floating Chat Button */}
            <TouchableOpacity style={styles.chatButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.chatButtonText}>💬</Text>
            </TouchableOpacity>

            {/* Chat Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={styles.modalContainer}>
                    <View style={styles.chatBox}>
                        <ScrollView style={styles.chatMessagesContainer}>
                            <Text style={styles.chatResponse}>{chatResponse}</Text>
                        </ScrollView>

                        <View style={styles.chatInputContainer}>
                            <TextInput
                                style={styles.chatInput}
                                placeholder="Nhập câu hỏi..."
                                value={chatInput}
                                onChangeText={setChatInput}
                            />
                            <TouchableOpacity onPress={handleChatInput} style={styles.sendButton}>
                                <Text style={styles.sendButtonText}>Gửi</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chatButton: {
        position: "absolute",
        bottom: 20,
        left: 20,
        backgroundColor: "#6970e4",
        padding: 15,
        borderRadius: 30,
        elevation: 5,
        zIndex: 9999,
    },
    chatButtonText: {
        color: "white",
        fontSize: 20,
        textAlign: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    chatBox: {
        width: "90%",
        height: "80%",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
    },
    chatMessagesContainer: {
        height: 200,
        marginBottom: 10,
    },
    chatResponse: {
        fontSize: 16,
        padding: 10,
    },
    chatInputContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    chatInput: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        backgroundColor: "#f5f5f5",
    },
    sendButton: {
        backgroundColor: "#6970e4",
        padding: 10,
        marginLeft: 10,
        borderRadius: 5,
    },
    sendButtonText: {
        color: "white",
    },
    closeButton: {
        marginTop: 10,
        alignItems: "center",
    },
    closeButtonText: {
        color: "red",
        fontSize: 16,
    },
});

export default ChatScreen;