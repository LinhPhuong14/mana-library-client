import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";

const VerifyCodeScreen = ({ navigation, route }) => {
    const { verifyAccount, error, loading } = useAuth();
    const [code, setCode] = useState("");
    const { email } = route.params;

    const handleVerifyCode = async () => {
        // Kiểm tra tính hợp lệ
        if (!code) {
            alert("Vui lòng điền mã xác minh.");
            return;
        }

        const response = await verifyAccount(email, code);

        if (response.success) {
            // Hiển thị thông báo thành công
            alert("Tài khoản đã được xác minh thành công.");
            navigation.navigate("Login");
        } else {
            // Hiển thị lỗi nếu thất bại
            alert(error || "Xác minh tài khoản thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Xác minh tài khoản</Text>

            <Text style={styles.description}>
                Mã xác minh đã được gửi đến địa chỉ email {email}. Vui lòng điền mã xác minh dưới đây.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Mã xác minh"
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
            />

            <TouchableOpacity onPress={handleVerifyCode} style={styles.button}>
                {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.buttonText}>Xác minh</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.backButton}>
                <Text style={styles.backButtonText}>Trở lại đăng ký</Text>
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
    description: {
        fontSize: 16,
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
        backgroundColor: "#4CAF50",
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
        color: "#4CAF50",
        fontSize: 16,
    },
    errorText: {
        color: "red",
        marginTop: 10,
    },
});

export default VerifyCodeScreen;