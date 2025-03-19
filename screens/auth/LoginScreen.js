import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";

const LoginScreen = ({ navigation }) => {
    const { login, error, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        login({ email, password });
        navigation.navigate("Chat");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.description}>
                Login member account to keep track of your books and receive the benefits
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Your email address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                onPress={handleLogin}
                style={styles.button}
            >
                <Text style={styles.buttonText}>Login</Text>

            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.buttonContainer}>
                <Text style={styles}>
                    Don't have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                    <Text style={{ color: "#6970e4" }}>
                        Sign up now
                    </Text>
                </TouchableOpacity>
            </View>
      // Thêm Forgot Password
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={{ color: "#6970e4", marginTop: 10 }}>
                    Forgot password?
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
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
});

export default LoginScreen;