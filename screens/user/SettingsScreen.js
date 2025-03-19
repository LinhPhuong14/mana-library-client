import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsScreen = ({ navigation }) => {
    const [fontSize, setFontSize] = useState(16);
    const [language, setLanguage] = useState("English");

    const handleLogout = () => {
        navigation.navigate("Splash");
        // Add your logout logic here
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.header}>Settings</Text>

                {/* Language Selection */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Language</Text>
                    <View style={styles.languageContainer}>
                        {["English", "Spanish", "French", "German"].map((lang) => (
                            <TouchableOpacity
                                key={lang}
                                style={[
                                    styles.languageButton,
                                    language === lang ? styles.selectedLanguage : {},
                                ]}
                                onPress={() => setLanguage(lang)}
                            >
                                <Text
                                    style={
                                        language === lang
                                            ? styles.selectedLanguageText
                                            : styles.languageText
                                    }
                                >
                                    {lang}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Font Size Adjustment */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Font Size</Text>
                    <View style={styles.sliderContainer}>
                        <Slider
                            style={styles.slider}
                            minimumValue={12}
                            maximumValue={24}
                            step={1}
                            value={fontSize}
                            onValueChange={setFontSize}
                            minimumTrackTintColor="#636ae8"
                            maximumTrackTintColor="#ccc"
                            thumbTintColor="#636ae8"
                        />
                        <Text style={styles.fontSizeText}>{fontSize}px</Text>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#121212",
    },
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#1E1E1E",
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 10,
    },
    languageContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 10,
    },
    languageButton: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#636ae8",
        marginBottom: 5,
        width: "48%",
        alignItems: "center",
    },
    selectedLanguage: {
        backgroundColor: "#636ae8",
    },
    languageText: {
        color: "#636ae8",
        fontWeight: "bold",
    },
    selectedLanguageText: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    sliderContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    slider: {
        flex: 1,
        height: 40,
    },
    fontSizeText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginLeft: 10,
    },
    logoutButton: {
        backgroundColor: "#e63946",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    logoutText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default SettingsScreen;
