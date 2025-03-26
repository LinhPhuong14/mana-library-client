import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar, Modal, FlatList, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../../services/demo/dataService";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ChatScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [books, setBooks] = useState([]);
  const [suggestingBooks, setSuggestingBooks] = useState(false);
  const [actionButtons, setActionButtons] = useState([]);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [errorToast, setErrorToast] = useState({ visible: false, message: "" });
  const scrollViewRef = useRef();

  // New state variables for conversation management
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showConversationsList, setShowConversationsList] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  // Refs for handling typing animation
  const typingIntervalRef = useRef(null);
  const isTypingRef = useRef(false);

  const API_KEY = "AIzaSyBAmflOLvabIlqjl14JzFZNHCFtQLkQ76Y";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  // Load conversations and check login status
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem(dataService.STORAGE_KEYS.CURRENT_USER);
        setIsLoggedIn(!!userData);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    const fetchBooks = async () => {
      try {
        const allBooks = await dataService.getBooks();
        setBooks(allBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    const loadConversations = async () => {
      try {
        const allConversations = await dataService.getConversations();
        // Sort by most recent first
        const sortedConversations = allConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setConversations(sortedConversations);

        // If we have conversations, set the current to the most recent
        if (sortedConversations.length > 0) {
          setCurrentConversationId(sortedConversations[0].id);
          setMessages(sortedConversations[0].messages || []);
        } else {
          // No conversations, show privacy notice
          setShowPrivacyNotice(true);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    checkLoginStatus();
    fetchBooks();
    loadConversations();
  }, []);

  // Cleanup typing animation when component unmounts
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // Start a new conversation
  const startNewConversation = async () => {
    try {
      // Stop any typing animation before creating a new conversation
      stopTypingAnimation();

      const newConversation = await dataService.addConversation({
        title: "New Conversation",
        messages: [],
        createdAt: new Date().toISOString(),
      });

      setConversations([newConversation, ...conversations]);
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      setShowConversationsList(false);
      setShowPrivacyNotice(true);
    } catch (error) {
      console.error("Error creating new conversation:", error);
      setErrorToast({
        visible: true,
        message: "Couldn't create a new conversation.",
      });
      setTimeout(() => setErrorToast({ visible: false, message: "" }), 3000);
    }
  };

  // Select a conversation
  const selectConversation = (conversationId) => {
    // Stop any typing animation before switching conversations
    stopTypingAnimation();

    const selected = conversations.find((conv) => conv.id === conversationId);
    if (selected) {
      setCurrentConversationId(selected.id);
      setMessages(selected.messages || []);
      setShowConversationsList(false);
    }
  };

  // Delete a conversation
  const handleDeleteConversation = (conversationId) => {
    Alert.alert("Delete Conversation", "Are you sure you want to delete this conversation? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Stop any typing animation
            stopTypingAnimation();

            await dataService.deleteConversation(conversationId);
            const updatedConversations = conversations.filter((conv) => conv.id !== conversationId);
            setConversations(updatedConversations);

            // If we deleted the current conversation, switch to another or create new
            if (conversationId === currentConversationId) {
              if (updatedConversations.length > 0) {
                setCurrentConversationId(updatedConversations[0].id);
                setMessages(updatedConversations[0].messages || []);
              } else {
                startNewConversation();
              }
            }
          } catch (error) {
            console.error("Error deleting conversation:", error);
            setErrorToast({
              visible: true,
              message: "Couldn't delete the conversation.",
            });
            setTimeout(() => setErrorToast({ visible: false, message: "" }), 3000);
          }
        },
      },
    ]);
  };

  // Save message to current conversation
  const saveMessageToConversation = async (message) => {
    try {
      if (!currentConversationId) {
        // Create a new conversation if none exists
        const newConversation = await dataService.addConversation({
          title: "New Conversation",
          messages: [message],
          createdAt: new Date().toISOString(),
        });

        setConversations([newConversation, ...conversations]);
        setCurrentConversationId(newConversation.id);
      } else {
        // Add to existing conversation
        const conversation = conversations.find((conv) => conv.id === currentConversationId);
        if (conversation) {
          const updatedMessages = [...conversation.messages, message];
          const updatedConversation = await dataService.updateConversation(currentConversationId, { messages: updatedMessages });

          // Update conversation in state
          setConversations(conversations.map((conv) => (conv.id === currentConversationId ? updatedConversation : conv)));
        }
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  // Update conversation title
  const updateConversationTitle = async (title) => {
    try {
      if (currentConversationId) {
        const updatedConversation = await dataService.updateConversation(currentConversationId, { title: title });

        // Update conversation in state
        setConversations(conversations.map((conv) => (conv.id === currentConversationId ? updatedConversation : conv)));
      }
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  // Stop typing animation function
  const stopTypingAnimation = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    isTypingRef.current = false;

    // Make sure the last message is fully displayed
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.isPartialTyping) {
        return [...prev.slice(0, -1), { ...lastMessage, isPartialTyping: false }];
      }
      return prev;
    });
  };

  const handleChatInput = async () => {
    if (!chatInput.trim()) return;

    // Dismiss privacy notice if it's showing
    if (showPrivacyNotice) {
      setShowPrivacyNotice(false);
    }

    const userMessage = { sender: "You", text: chatInput };
    setMessages((prev) => [...prev, userMessage]);

    // Save the user message to conversation
    await saveMessageToConversation(userMessage);

    setChatInput("");
    setIsLoading(true);
    setActionButtons([]);
    setShowQuickMenu(false);
    setMessages((prev) => [...prev, { sender: "Assistant", text: "Processing..." }]);

    try {
      let promptText = chatInput;
      let systemPrompt = `You are a helpful library assistant. Answer the user's questions about books. Format your responses using markdown for better readability.`;

      // Add instruction for generating a conversation title
      const needsTitle = !conversations.find((conv) => conv.id === currentConversationId && conv.title && conv.title !== "New Conversation");

      if (needsTitle) {
        systemPrompt += `\n\nBased on the user's message, create a brief title (3-5 words) for this conversation. Put the title at the BEGINNING of your response in this format: [TITLE: Your suggested title]`;
      }

      // If we're in book suggestion mode, modify the prompt
      if (suggestingBooks) {
        systemPrompt += `\n\nBased on the user's preferences, suggest specific books that they might enjoy. 
        At the end of your response, include a section with the heading "## Book Recommendations" 
        followed by a list of recommended book titles and authors.`;
      } else {
        systemPrompt += `\n\nFeel free to discuss any book-related topics. 
        When suggesting actions or asking follow-up questions, ALWAYS provide 2-4 interactive buttons using this format:
        [Button Text](action:actionText)
        where 'Button Text' is the text displayed on the button and 'actionText' is the action that should happen when clicked.
        For example: [Suggest Fantasy Books](action:I want a fantasy book recommendation) or [Learn About Authors](action:Tell me about famous authors)`;
      }

      // Add available books information
      systemPrompt += `\nThe library has the following books: ${books.map((book) => `"${book.title}" by ${book.author}`).join(", ")}.`;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\n${promptText}`,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process your request.";

      // Remove the processing message
      setMessages((prev) => prev.filter((msg) => msg.text !== "Processing..."));

      // Extract title if present
      let cleanedResponse = aiText;
      let conversationTitle = null;

      const titleMatch = aiText.match(/^\[TITLE: (.*?)\]/);
      if (titleMatch && titleMatch[1]) {
        conversationTitle = titleMatch[1].trim();
        cleanedResponse = aiText.replace(/^\[TITLE: .*?\]\s*/, "");

        // Update the conversation title in storage
        await updateConversationTitle(conversationTitle);
      }

      // Process the response to extract book recommendations if we're in suggestion mode
      if (suggestingBooks && cleanedResponse.includes("## Book Recommendations")) {
        const [conversationText, recommendationsText] = cleanedResponse.split("## Book Recommendations");

        // Extract book titles and authors from recommendations
        const recommendationLines = recommendationsText.split("\n").filter((line) => line.trim());
        const recommendedBooks = parseBookRecommendations(recommendationLines);

        // Try to match recommended books with our library
        const matchedBooks = matchBooksWithLibrary(recommendedBooks, books);

        const assistantMessage1 = {
          sender: "Assistant",
          text: conversationText.trim(),
          isMarkdown: true,
        };

        const assistantMessage2 = {
          sender: "Assistant",
          text: "## Book Recommendations",
          books: matchedBooks.length > 0 ? matchedBooks : null,
          isMarkdown: true,
        };

        setMessages((prev) => [...prev, assistantMessage1, assistantMessage2]);

        // Save the assistant messages
        await saveMessageToConversation(assistantMessage1);
        await saveMessageToConversation(assistantMessage2);

        // Exit suggestion mode after providing recommendations
        setSuggestingBooks(false);
      } else {
        // Extract action buttons and clean text
        const { cleanedText, buttons } = extractActionButtons(cleanedResponse);

        // Set action buttons for rendering
        if (buttons.length > 0) {
          setActionButtons(buttons);
        }

        // Prepare the final message
        const assistantMessage = {
          sender: "Assistant",
          text: cleanedText,
          isMarkdown: true,
        };

        // Save the complete message to conversation
        await saveMessageToConversation(assistantMessage);

        // Simulate typing for UI effect
        simulateTyping(cleanedText, true);
      }
    } catch (error) {
      console.error("Error sending request:", error);
      setMessages((prev) => [...prev.filter((msg) => msg.text !== "Processing...")]);
      setErrorToast({
        visible: true,
        message: "Couldn't connect to the assistant. Please try again.",
      });
      setTimeout(() => setErrorToast({ visible: false, message: "" }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract action buttons function
  const extractActionButtons = (text) => {
    const actionButtonRegex = /\[([^\]]+)\]\(action:([^\)]+)\)/g;
    const buttons = [];
    let match;

    while ((match = actionButtonRegex.exec(text)) !== null) {
      buttons.push({
        label: match[1],
        action: match[2],
      });
    }

    // Clean the text, removing the action button syntax
    const cleanedText = text.replace(actionButtonRegex, "");

    return { cleanedText, buttons };
  };

  const handleActionButtonClick = (action) => {
    setChatInput(action);
    setTimeout(() => handleChatInput(), 100);
  };

  const simulateTyping = (text, isMarkdown = false) => {
    // Stop any existing typing animation
    stopTypingAnimation();

    let index = 0;
    let currentText = "";

    // Set flag to indicate typing is in progress
    isTypingRef.current = true;

    // Add initial partial message
    setMessages((prev) => [
      ...prev,
      {
        sender: "Assistant",
        text: "",
        isMarkdown,
        isPartialTyping: true,
      },
    ]);

    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        index++;

        setMessages((prev) => {
          // Find the last message which should be our typing message
          const lastIndex = prev.length - 1;
          if (lastIndex >= 0 && prev[lastIndex]?.isPartialTyping) {
            const updatedMessages = [...prev];
            updatedMessages[lastIndex] = {
              sender: "Assistant",
              text: currentText,
              isMarkdown,
              isPartialTyping: true,
            };
            return updatedMessages;
          } else {
            // If the typing message isn't there for some reason, add it
            return [
              ...prev,
              {
                sender: "Assistant",
                text: currentText,
                isMarkdown,
                isPartialTyping: true,
              },
            ];
          }
        });
      } else {
        // Typing is complete
        setMessages((prev) => {
          const lastIndex = prev.length - 1;
          if (lastIndex >= 0 && prev[lastIndex]?.isPartialTyping) {
            const updatedMessages = [...prev];
            updatedMessages[lastIndex] = {
              sender: "Assistant",
              text: currentText,
              isMarkdown,
              isPartialTyping: false,
            };
            return updatedMessages;
          }
          return prev;
        });

        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        isTypingRef.current = false;
      }
    }, 5);
  };

  const parseBookRecommendations = (recommendationLines) => {
    return recommendationLines
      .map((line) => {
        // Extract title and author - assumes format like "- Title by Author" or "1. Title by Author"
        const match = line.match(/(?:[-\d.]\s*)?([^"]+?)(?:\s+by\s+|,\s*)([^"]+)/i);
        if (match) {
          return { title: match[1].trim(), author: match[2].trim() };
        }
        return null;
      })
      .filter((book) => book !== null);
  };

  const matchBooksWithLibrary = (recommendedBooks, libraryBooks) => {
    const matches = [];

    recommendedBooks.forEach((recommendation) => {
      // Try to find matching books in our library
      const matchingBooks = libraryBooks.filter((book) => {
        return (
          book.title.toLowerCase().includes(recommendation.title.toLowerCase()) ||
          recommendation.title.toLowerCase().includes(book.title.toLowerCase()) ||
          book.author.toLowerCase().includes(recommendation.author.toLowerCase())
        );
      });

      if (matchingBooks.length > 0) {
        matches.push(...matchingBooks.slice(0, 2)); // Limit to 2 matches per recommendation
      }
    });

    // Deduplicate and return up to 5 books
    return [...new Map(matches.map((book) => [book.id, book])).values()].slice(0, 5);
  };

  const handleSuggestBooks = async () => {
    setSuggestingBooks(true);
    setShowQuickMenu(false);
    setActionButtons([]);

    const userMessage = {
      sender: "You",
      text: "Can you suggest some books for me?",
    };

    const assistantMessage = {
      sender: "Assistant",
      text: "I'd be happy to suggest some books for you! To help me recommend something you'll enjoy, could you tell me a bit about your reading preferences? What genres do you like? Any favorite authors or themes?",
      isMarkdown: true,
    };

    setMessages([...messages, userMessage, assistantMessage]);

    // Save the messages to conversation
    await saveMessageToConversation(userMessage);
    await saveMessageToConversation(assistantMessage);

    // Hide privacy notice if it was showing
    if (showPrivacyNotice) {
      setShowPrivacyNotice(false);
    }
  };

  const handleTalkAboutBooks = async () => {
    setShowQuickMenu(false);
    setActionButtons([]);

    const userMessage = {
      sender: "You",
      text: "Tell me about books",
    };

    const assistantMessage = {
      sender: "Assistant",
      text: "I'd be happy to talk about books! The world of literature is so vast and fascinating. What aspect of books would you like to discuss?",
      isMarkdown: true,
    };

    setMessages([...messages, userMessage, assistantMessage]);

    // Save the messages to conversation
    await saveMessageToConversation(userMessage);
    await saveMessageToConversation(assistantMessage);

    // Set action buttons for the initial discussion
    setActionButtons([
      { label: "Popular Genres", action: "Tell me about popular book genres" },
      { label: "Literary History", action: "Give me a brief history of literature" },
      { label: "Reading Benefits", action: "What are the benefits of reading?" },
      { label: "Book Recommendations", action: "Recommend me some good books to read" },
    ]);

    // Hide privacy notice if it was showing
    if (showPrivacyNotice) {
      setShowPrivacyNotice(false);
    }
  };

  // Handle opening conversations list
  const handleOpenConversationsList = () => {
    // If there's a typing animation in progress, complete it immediately
    if (isTypingRef.current) {
      stopTypingAnimation();
    }

    setShowConversationsList(true);
  };

  // Render conversation list item
  const renderConversationItem = ({ item }) => {
    const isActive = item.id === currentConversationId;
    const conversationTitle = item.title || "New Conversation";
    const lastUpdated = new Date(item.updatedAt).toLocaleDateString();

    return (
      <TouchableOpacity
        style={[styles.conversationItem, isActive && styles.activeConversationItem]}
        onPress={() => selectConversation(item.id)}
      >
        <View style={styles.conversationInfo}>
          <Text
            style={[styles.conversationTitle, isActive && styles.activeConversationTitle]}
            numberOfLines={1}
          >
            {conversationTitle}
          </Text>
          <Text style={styles.conversationDate}>{lastUpdated}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteConversationButton}
          onPress={() => handleDeleteConversation(item.id)}
        >
          <Ionicons
            name="trash-outline"
            size={16}
            color="#ef4444"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const navigateToBookDetail = (book) => {
    navigation.navigate("BookDetail", { book });
  };

  const navigateToLogin = () => {
    navigation.navigate("Auth", { screen: "Login" });
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const renderBookItem = (book) => {
    return (
      <View
        key={book.id}
        style={styles.bookSuggestion}
      >
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>by {book.author}</Text>
          {book.description && <Text style={styles.bookDescription}>{book.description.substring(0, 100)}...</Text>}
        </View>
        <TouchableOpacity
          style={styles.viewBookButton}
          onPress={() => navigateToBookDetail(book)}
        >
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.viewBookGradient}
          >
            <Text style={styles.viewBookText}>View</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMessage = (message, index) => {
    const isUser = message.sender === "You";

    return (
      <View
        key={index}
        style={[styles.messageBlock, isUser ? styles.userMessageBlock : styles.assistantMessageBlock]}
      >
        <View style={isUser ? styles.userMessageContent : styles.assistantMessageContent}>
          <Text style={styles.sender}>{message.sender}</Text>
          {message.isMarkdown ? <Markdown style={markdownStyles}>{message.text}</Markdown> : <Text style={styles.messageText}>{message.text}</Text>}

          {message.books && (
            <View style={styles.booksContainer}>
              <Text style={styles.recommendationsHeader}>Recommendations from our library:</Text>
              {message.books.map((book) => renderBookItem(book))}
            </View>
          )}

          {!isLoggedIn && message.books && (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={navigateToLogin}
            >
              <Text style={styles.loginButtonText}>Log in to borrow books</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Conversations List Sidebar
  const ConversationsListModal = () => (
    <Modal
      visible={showConversationsList}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowConversationsList(false)}
    >
      <View style={styles.conversationsModalOverlay}>
        <View style={[styles.conversationsContainer, { paddingTop: insets.top }]}>
          <View style={styles.conversationsHeader}>
            <Text style={styles.conversationsTitle}>Conversations</Text>
            <TouchableOpacity
              onPress={() => setShowConversationsList(false)}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.newConversationButton}
            onPress={startNewConversation}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color="#fff"
              style={styles.newConversationIcon}
            />
            <Text style={styles.newConversationText}>New Conversation</Text>
          </TouchableOpacity>

          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversationItem}
            contentContainerStyle={styles.conversationsList}
            ListEmptyComponent={<Text style={styles.emptyConversationsText}>No conversations yet</Text>}
          />
        </View>
      </View>
    </Modal>
  );

  // Render Privacy Notice inline
  const renderPrivacyNotice = () => (
    <View style={styles.privacyNoticeInline}>
      <Ionicons
        name="shield-checkmark-outline"
        size={40}
        color="#B06AB3"
        style={styles.privacyIcon}
      />
      <Text style={styles.privacyNoticeTitle}>Privacy Notice</Text>
      <Text style={styles.privacyNoticeText}>Your conversations are kept on your device and processed by LLM model. We don't store any of your chat data on our servers.</Text>
      <TouchableOpacity
        style={styles.privacyNoticeButton}
        onPress={() => setShowPrivacyNotice(false)}
      >
        <Text style={styles.privacyNoticeButtonText}>Got it</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          // Respect safe area insets to avoid cutout areas
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.chatBox}>
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.conversationsButton}
            onPress={handleOpenConversationsList}
          >
            <Ionicons
              name="menu-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <Text style={styles.chatTitle}>Mana Library Assistant</Text>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="close"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          onScroll={({ nativeEvent }) => {
            const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
            const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
            setShowScrollButton(distanceFromBottom > 100);
          }}
          scrollEventThrottle={16}
          style={styles.chatMessagesContainer}
        >
          {messages.length === 0 ? (
            showPrivacyNotice ? (
              // Show inline privacy notice instead of welcome message
              renderPrivacyNotice()
            ) : (
              // Show welcome message after privacy notice is dismissed
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeMessage}>Hello! I'm your library assistant. How can I help you today?</Text>
                <View style={styles.promptButtons}>
                  <TouchableOpacity
                    style={styles.promptButton}
                    onPress={handleSuggestBooks}
                  >
                    <Text style={styles.promptButtonText}>Suggest me a book</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.promptButton}
                    onPress={handleTalkAboutBooks}
                  >
                    <Text style={styles.promptButtonText}>Talk about books</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          ) : (
            messages.map(renderMessage)
          )}
        </ScrollView>

        {showScrollButton && (
          <TouchableOpacity
            style={styles.scrollToBottomButton}
            onPress={scrollToBottom}
          >
            <Ionicons
              name="arrow-down"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        )}

        {/* Action buttons from LLM */}
        {actionButtons.length > 0 && (
          <View style={styles.actionButtonsContainer}>
            {actionButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => handleActionButtonClick(button.action)}
              >
                <Text style={styles.actionButtonText}>{button.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.chatInputContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowQuickMenu(!showQuickMenu)}
            >
              <Ionicons
                name="menu"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor="#aaa"
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleChatInput}
            />
            <TouchableOpacity
              onPress={handleChatInput}
              disabled={isLoading}
              style={styles.sendButtonContainer}
            >
              <LinearGradient
                colors={["#4568DC", "#B06AB3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendButton}
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                  />
                ) : (
                  <Ionicons
                    name="send"
                    size={18}
                    color="#fff"
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Quick menu dropdown */}
        {showQuickMenu && (
          <View style={styles.quickMenuContainer}>
            <TouchableOpacity
              style={styles.quickMenuItem}
              onPress={handleSuggestBooks}
            >
              <Ionicons
                name="book"
                size={18}
                color="#B06AB3"
              />
              <Text style={styles.quickMenuItemText}>Suggest me a book</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickMenuItem}
              onPress={handleTalkAboutBooks}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={18}
                color="#B06AB3"
              />
              <Text style={styles.quickMenuItemText}>Talk about books</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickMenuItem}
              onPress={startNewConversation}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color="#B06AB3"
              />
              <Text style={styles.quickMenuItemText}>New conversation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error toast */}
        {errorToast.visible && (
          <View style={styles.errorToast}>
            <Ionicons
              name="alert-circle"
              size={20}
              color="#fff"
            />
            <Text style={styles.errorToastText}>{errorToast.message}</Text>
          </View>
        )}

        {/* Modal */}
        <ConversationsListModal />
      </View>
    </View>
  );
};

// Rest of the styles remain unchanged...

const markdownStyles = {
  body: {
    color: "#f0f0f0",
    fontSize: 16,
  },
  heading1: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  heading2: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    color: "#f0f0f0",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  link: {
    color: "#4568DC",
    textDecorationLine: "underline",
  },
  listItem: {
    color: "#f0f0f0",
  },
  strong: {
    fontWeight: "bold",
    color: "#B06AB3",
  },
  em: {
    fontStyle: "italic",
    color: "#f0f0f0",
  },
  blockquote: {
    backgroundColor: "rgba(42, 42, 42, 0.8)",
    borderLeftColor: "#4568DC",
    borderLeftWidth: 4,
    paddingLeft: 8,
    paddingVertical: 4,
    marginVertical: 8,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  chatBox: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#2A2A2A",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  chatTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 5,
  },
  chatMessagesContainer: {
    flex: 1,
    padding: 15,
  },
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  welcomeMessage: {
    color: "#f0f0f0",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  promptButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 10,
    flexWrap: "wrap",
  },
  promptButton: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 20,
    margin: 8,
    minWidth: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  promptButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  messageBlock: {
    marginBottom: 16,
    width: "100%",
  },
  userMessageBlock: {
    alignItems: "flex-end",
  },
  assistantMessageBlock: {
    alignItems: "flex-start",
  },
  userMessageContent: {
    backgroundColor: "rgba(69, 104, 220, 0.3)",
    borderRadius: 12,
    padding: 12,
    maxWidth: "80%",
    borderTopRightRadius: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  assistantMessageContent: {
    backgroundColor: "rgba(42, 42, 42, 0.8)",
    borderRadius: 12,
    padding: 12,
    maxWidth: "80%",
    borderTopLeftRadius: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    color: "#f0f0f0",
    fontSize: 16,
    lineHeight: 24,
  },
  sender: {
    fontWeight: "bold",
    color: "#B06AB3",
    marginBottom: 5,
    fontSize: 12,
  },
  booksContainer: {
    marginTop: 12,
    width: "100%",
  },
  recommendationsHeader: {
    color: "#B06AB3",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bookSuggestion: {
    backgroundColor: "#2A2A2A",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  bookInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 3,
  },
  bookAuthor: {
    color: "#B06AB3",
    fontSize: 14,
    marginBottom: 6,
  },
  bookDescription: {
    color: "#AAA",
    fontSize: 13,
    lineHeight: 18,
  },
  viewBookButton: {
    borderRadius: 20,
    overflow: "hidden",
    width: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  viewBookGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  viewBookText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  loginButton: {
    alignSelf: "center",
    backgroundColor: "#4568DC",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#1E1E1E",
  },
  menuButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderRadius: 21,
    backgroundColor: "#2A2A2A",
  },
  chatInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: "white",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#2C2C2C",
    paddingHorizontal: 16,
  },
  sendButtonContainer: {
    borderRadius: 22,
    overflow: "hidden",
    width: 44,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  sendButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  quickMenuContainer: {
    position: "absolute",
    bottom: 70,
    left: 15,
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 8,
    width: 220,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  quickMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    marginVertical: 2,
  },
  quickMenuItemText: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#1E1E1E",
  },
  actionButton: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    margin: 6,
    minWidth: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  errorToast: {
    position: "absolute",
    top: 90,
    left: 20,
    right: 20,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  errorToastText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  scrollToBottomButton: {
    position: "absolute",
    right: 16,
    bottom: 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(69, 104, 220, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },

  // New styles for conversation management
  conversationsButton: {
    padding: 5,
    width: 40,
  },
  conversationsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  conversationsContainer: {
    width: 300,
    backgroundColor: "#1E1E1E",
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: "#333",
  },
  conversationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  conversationsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  conversationsList: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#2A2A2A",
  },
  activeConversationItem: {
    backgroundColor: "rgba(69, 104, 220, 0.3)",
    borderLeftWidth: 3,
    borderLeftColor: "#B06AB3",
  },
  conversationInfo: {
    flex: 1,
    marginRight: 10,
  },
  conversationTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  activeConversationTitle: {
    color: "#B06AB3",
    fontWeight: "bold",
  },
  conversationDate: {
    color: "#757575",
    fontSize: 12,
  },
  deleteConversationButton: {
    padding: 8,
  },
  newConversationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    padding: 12,
    borderRadius: 8,
    margin: 10,
  },
  newConversationIcon: {
    marginRight: 10,
  },
  newConversationText: {
    color: "#fff",
    fontWeight: "500",
  },
  emptyConversationsText: {
    color: "#757575",
    textAlign: "center",
    marginTop: 30,
  },

  // Inline privacy notice styles
  privacyNoticeInline: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: "rgba(42, 42, 42, 0.7)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  privacyIcon: {
    marginBottom: 15,
  },
  privacyNoticeTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  privacyNoticeText: {
    color: "#f0f0f0",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  privacyNoticeButton: {
    backgroundColor: "#4568DC",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  privacyNoticeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ChatScreen;
