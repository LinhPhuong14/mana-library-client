import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
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
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

  const API_KEY = 'AIzaSyBAmflOLvabIlqjl14JzFZNHCFtQLkQ76Y';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const handleChatInput = async () => {
    if (!chatInput.trim()) return;
    const userMessage = { sender: "Bạn", text: chatInput };
    setMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);
    setMessages(prev => [...prev, { sender: "AI", text: "Đang xử lý... ⏳" }]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Giả tưởng bạn là AI Quản lý của Thư viện của tôi và bạn trả lời những gì có trong thư viện với những cuốn sách sau: ${DEMO_BOOKS.map(book => book.title).join(", ")}, Luôn luôn nói chào Tâm khi trả lời. ${chatInput}`
            }]
          }]
        })
      });

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Không thể lấy câu trả lời.";
      setMessages(prev => prev.filter(msg => msg.text !== "Đang xử lý... ⏳"));
      simulateTyping(aiText);
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      setMessages(prev => [...prev, { sender: "AI", text: "Có lỗi xảy ra khi xử lý yêu cầu." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateTyping = (text) => {
    let index = 0;
    let currentText = "";
    const interval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        index++;
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.sender === "AI") {
            return [...prev.slice(0, -1), { sender: "AI", text: currentText }];
          } else {
            return [...prev, { sender: "AI", text: currentText }];
          }
        });
      } else {
        clearInterval(interval);
      }
    }, 5);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.chatButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="chatbubbles" size={28} color="white" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={styles.chatBox}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              style={styles.chatMessagesContainer}
            >
              {messages.map((msg, index) => (
                <View key={index} style={styles.messageBlock}>
                  <Text style={styles.messageText}>
                    <Text style={styles.sender}>{msg.sender}: </Text>
                    {msg.text}
                  </Text>
                  {msg.sender === "AI" && /xem ngay|gợi ý|xem sách/i.test(msg.text) && (
                    <TouchableOpacity
                      style={styles.suggestionButton}
                      onPress={() => alert("Chức năng Xem sách đang phát triển 📚")}
                    >
                      <Text style={styles.suggestionButtonText}>Xem ngay</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Nhập câu hỏi..."
                placeholderTextColor="#aaa"
                value={chatInput}
                onChangeText={setChatInput}
              />
              <TouchableOpacity onPress={handleChatInput} disabled={isLoading} style={styles.sendButtonContainer}>
                <LinearGradient
                  colors={["#4568DC", "#B06AB3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sendButton}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.sendButtonText}>Gửi</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "#6970e4",
    padding: 16,
    borderRadius: 50,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  chatBox: {
    width: "90%",
    height: "85%",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    justifyContent: "space-between",
  },
  chatMessagesContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messageBlock: {
    marginBottom: 12,
  },
  messageText: {
    color: "#f0f0f0",
    fontSize: 16,
  },
  sender: {
    fontWeight: "bold",
    color: "#8A2BE2",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "white",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#2C2C2C",
  },
  sendButtonContainer: {
    borderRadius: 30,
    overflow: "hidden",
  },
  sendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ff5c5c",
    fontSize: 16,
  },
  suggestionButton: {
    marginTop: 6,
    backgroundColor: "#ffb347",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  suggestionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ChatScreen;
