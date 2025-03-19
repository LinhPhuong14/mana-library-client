import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";

const ForgotPasswordScreen = ({ navigation }) => {
    const { requestPasswordReset, error, loading } = useAuth();
    const [email, setEmail] = useState("");

    const handleForgotPassword = async () => {
        // Kiểm tra tính hợp lệ
        if (!email) {
            alert("Vui lòng điền email.");
            return;
        }

        const response = await requestPasswordReset(email);

        if (response.success) {
            // Hiển thị thông báo thành công
            alert("Email khôi phục mật khẩu đã được gửi đến địa chỉ email của bạn.");
            navigation.navigate("Login");
        } else {
            // Hiển thị lỗi nếu thất bại
            alert(error || "Khôi phục mật khẩu thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recovery Password</Text>

            <Text style={styles.description}>
                Enter your email address and we will send you a link to reset your password.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />

            <TouchableOpacity onPress={() => {
                if (!email) {
                    alert("Vui lòng nhập email");
                } else {
                    handleForgotPassword();
                }
            }} style={styles.button}>
                {loading ? (
                    <ActivityIndicator size="small" color="#6970e4" />
                ) : (
                    <Text style={styles.buttonText}>Send Code</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
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
        color: "#fff",
        fontSize: 16,
    },
    backButton: {
        width: "100%",
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 5,
        alignItems: "center",
        borderColor: "#ccc",
        borderWidth: 1,
        marginTop: 10,
    },
    backButtonText: {
        color: "#6970e4",
        fontSize: 16,
    },
    errorText: {
        color: "red",
        marginTop: 10,
    },
});

export default ForgotPasswordScreen;