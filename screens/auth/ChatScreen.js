import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,ScrollView } from "react-native";
import { useAuth } from "../../context/AuthContext";

const ChatScreen = ({ navigation }) => {
    const { login, error, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [chatInput, setChatInput] = useState("");
    const [chatResponse, setChatResponse] = useState("");
    const [apiResponse, setApiResponse] = useState("");
    const API_KEY = 'AIzaSyBAmflOLvabIlqjl14JzFZNHCFtQLkQ76Y'; // Thay thế bằng API key thực
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const handleLogin = async () => {
        login({ email, password });
        navigation.navigate("VerifyCode");
    };

    const handleChatInput = async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "contents": [{
                        "parts": [{"text": "Giả tưởng bạn là AI Quản lý của Thư viện của tôi và bạn trả lời những gì có trong thư viện,Luôn luôn nói chào Tâm khi trả lời"+chatInput}]
                    }]
                })
            });

            const data = await response.json();
            
            setApiResponse(data.candidates[0].content.parts[0].text);
            setChatResponse(`Bạn: ${chatInput}\nAI: ${data.candidates[0].content.parts[0].text}`);
            setChatInput("");
            console.log(data.candidates[0].content.parts[0].text);
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
        }
    };

    return (
        <View style={styles.container}>
    <View style={styles.chatContainer}>
        

        <View style={styles.chatInputContainer}>
            <TextInput
                style={styles.chatInput}
                placeholder="Nhập câu hỏi..."
                value={chatInput}
                onChangeText={setChatInput}
            />
            <TouchableOpacity
                onPress={handleChatInput}
                style={styles.chatButton}
            >
                <Text style={styles.chatButtonText}>Gửi</Text>
            </TouchableOpacity>
        </View>
        <ScrollView style={styles.chatMessagesContainer}>
            {/* Các đoạn chat sẽ hiển thị ở đây */}
            <Text style={styles.chatResponse}>{chatResponse}</Text>
        </ScrollView>
    </View>
</View>
    );
};

const styles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: "flex-end", // Đưa phần tử con xuống dưới cùng
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
},
buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
},
title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
},
description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
},

input: {
    width: "100%",
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
},
button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#6970e4",
    borderRadius: 5,
    alignItems: "center",
},
buttonText: {
    color: "white",
    fontSize: 16,
},
errorText: {
    color: "red",
    marginTop: 10,
},
chatContainer: {
    width: "100%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    marginTop: 20,
    flex: 1,
    justifyContent: 'flex-end', // Đưa các đoạn chat lên trên cùng
    flexDirection: 'column-reverse', // Đặt input ở dưới cùng
},
chatMessagesContainer: {
    flex: 1,
    padding: 10, // Các đoạn chat sẽ hiển thị từ dưới lên
},
chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
},
chatInput: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
    borderColor: "#ccc",
    borderWidth: 1,
},
chatButton: {
    width: "100%",
    padding: 10,
    backgroundColor: "#6970e4",
    borderRadius: 5,
    alignItems: "center",
},
chatButtonText: {
    color: "white",
    fontSize: 16,
},
chatResponse: {
    fontSize: 16,
    padding: 10,
},

});

export default ChatScreen;
