import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import CheckBox from "react-native-checkbox";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const RegisterScreen = ({ navigation }) => {
    const { register, error, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [isChecked, setIsChecked] = useState(false); // Trạng thái checkbox

    const handleRegister = async () => {
        register({ email, password, fullName });
        alert("Đăng ký thành công!");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.description}>
                Create your account to manage your library effortlessly
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
            <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
            />

            {/* Checkbox điều khoản */}
            <View style={styles.checkboxContainer}>
                <CheckBox
                    label="I agree with Terms & Conditions"
                    checked={isChecked}
                    onChange={() => setIsChecked(!isChecked)}
                />
            </View>

            <TouchableOpacity
                onPress={handleRegister}
                style={[styles.button, !isChecked && styles.buttonDisabled]} // Vô hiệu hóa nút nếu chưa tích
                disabled={!isChecked}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text
                        onPress={handleRegister} style={styles.buttonText}>Sign Up</Text>
                )}
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.buttonContainer}>
                <Text style={styles}>
                    Already registered?{" "}

                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={{ color: "#6970e4" }}>
                        Login now
                    </Text>
                </TouchableOpacity>
            </View>
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
    checkboxContainer: {
        flexDirection: "row",
        justifyContent: "flex-start", // Đẩy checkbox và "I agree" về phía bên trái
        marginBottom: 15,
    },
    button: {
        width: "100%",
        padding: 15,
        backgroundColor: "#6970e4",
        borderRadius: 5,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
    errorText: {
        color: "red",
        marginTop: 10,
    },
});

export default RegisterScreen;