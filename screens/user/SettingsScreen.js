import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";

const SettingsScreen = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState(16);
    const [language, setLanguage] = useState("English");

    const handleLogout = () => {
        console.log("Logging out...");
        // Add your logout logic here
    };

    return (
        <View style={[styles.container, darkMode ? styles.darkBackground : styles.lightBackground]}>
            <Text style={[styles.header, darkMode ? styles.darkText : styles.lightText]}>Settings</Text>

            {/* Language Selection */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, darkMode ? styles.darkText : styles.lightText]}>Language</Text>
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
                            <Text style={language === lang ? styles.selectedLanguageText : styles.languageText}>
                                {lang}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Dark/Light Mode */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, darkMode ? styles.darkText : styles.lightText]}>Mode</Text>
                <View style={styles.switchContainer}>
                    <Text style={darkMode ? styles.darkText : styles.lightText}>Light</Text>
                    <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        trackColor={{ false: "#ccc", true: "#636ae8" }}
                        thumbColor={darkMode ? "#fff" : "#636ae8"}
                    />
                    <Text style={darkMode ? styles.darkText : styles.lightText}>Dark</Text>
                </View>
            </View>

            {/* Font Size Adjustment */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, darkMode ? styles.darkText : styles.lightText]}>Font Size</Text>
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
                    <Text style={[styles.fontSizeText, darkMode ? styles.darkText : styles.lightText]}>
                        {fontSize}px
                    </Text>
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    lightBackground: {
        backgroundColor: "#fff",
    },
    darkBackground: {
        backgroundColor: "#121212",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    section: {
        backgroundColor: "#f8f9fa",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    darkText: {
        color: "#fff",
    },
    lightText: {
        color: "#333",
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
        color: "#fff",
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
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default SettingsScreen;
