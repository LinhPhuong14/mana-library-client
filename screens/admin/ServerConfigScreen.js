import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

const ServerConfigScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Server configurations
  const [serverConfig, setServerConfig] = useState({
    apiEndpoint: "https://api.manalibrary.com/v1",
    databaseHost: "db.manalibrary.com",
    databasePort: "5432",
    databaseName: "manalibrary_prod",
    useSSL: true,
    enableAutoBackup: true,
    backupFrequency: "daily",
    backupTime: "03:00",
    loggingLevel: "info",
    maxConnections: "100",
    timeout: "30",
    enableCaching: true,
  });

  // Log entries
  const [logs] = useState([
    { timestamp: "2024-07-15 14:32:15", level: "info", message: "Database backup completed successfully" },
    { timestamp: "2024-07-15 12:15:03", level: "warn", message: "High memory usage detected (85%)" },
    { timestamp: "2024-07-15 08:45:22", level: "info", message: "System started successfully" },
    { timestamp: "2024-07-14 23:12:05", level: "error", message: "Failed to connect to backup service" },
    { timestamp: "2024-07-14 18:30:47", level: "info", message: "Configuration updated by admin" },
  ]);

  const handleInputChange = (field, value) => {
    setServerConfig({ ...serverConfig, [field]: value });
  };

  const handleToggleChange = (field) => {
    setServerConfig({ ...serverConfig, [field]: !serverConfig[field] });
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      Alert.alert("Success", "Server configuration saved successfully");
    }, 1500);
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    // Simulate testing connection
    setTimeout(() => {
      setTestingConnection(false);
      Alert.alert("Connection Test", "Successfully connected to database server");
    }, 2000);
  };

  const handleRestart = () => {
    Alert.alert("Restart Server", "Are you sure you want to restart the server? This will temporarily interrupt service.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Restart",
        style: "destructive",
        onPress: () => {
          setLoading(true);
          // Simulate restart
          setTimeout(() => {
            setLoading(false);
            Alert.alert("Success", "Server restarted successfully");
          }, 3000);
        },
      },
    ]);
  };

  const getLogIcon = (level) => {
    switch (level) {
      case "error":
        return (
          <Ionicons
            name="alert-circle"
            size={18}
            color="#ef4444"
          />
        );
      case "warn":
        return (
          <Ionicons
            name="warning"
            size={18}
            color="#f97316"
          />
        );
      case "info":
        return (
          <Ionicons
            name="information-circle"
            size={18}
            color="#22c55e"
          />
        );
      default:
        return (
          <Ionicons
            name="ellipse"
            size={18}
            color="#4568DC"
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Server Configuration</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>

          <Text style={styles.label}>API Endpoint</Text>
          <TextInput
            style={styles.input}
            value={serverConfig.apiEndpoint}
            onChangeText={(text) => handleInputChange("apiEndpoint", text)}
            placeholder="Enter API endpoint"
            placeholderTextColor="#757575"
          />

          <Text style={styles.label}>Request Timeout (seconds)</Text>
          <TextInput
            style={styles.input}
            value={serverConfig.timeout}
            onChangeText={(text) => handleInputChange("timeout", text)}
            placeholder="Enter timeout in seconds"
            placeholderTextColor="#757575"
            keyboardType="number-pad"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable Response Caching</Text>
            <Switch
              value={serverConfig.enableCaching}
              onValueChange={() => handleToggleChange("enableCaching")}
              trackColor={{ false: "#2A2A2A", true: "#4568DC" }}
              thumbColor={serverConfig.enableCaching ? "#B06AB3" : "#FFFFFF"}
            />
          </View>
        </View>

        {/* Database Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Configuration</Text>

          <Text style={styles.label}>Database Host</Text>
          <TextInput
            style={styles.input}
            value={serverConfig.databaseHost}
            onChangeText={(text) => handleInputChange("databaseHost", text)}
            placeholder="Enter database host"
            placeholderTextColor="#757575"
          />

          <Text style={styles.label}>Database Port</Text>
          <TextInput
            style={styles.input}
            value={serverConfig.databasePort}
            onChangeText={(text) => handleInputChange("databasePort", text)}
            placeholder="Enter database port"
            placeholderTextColor="#757575"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Database Name</Text>
          <TextInput
            style={styles.input}
            value={serverConfig.databaseName}
            onChangeText={(text) => handleInputChange("databaseName", text)}
            placeholder="Enter database name"
            placeholderTextColor="#757575"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Use SSL Connection</Text>
            <Switch
              value={serverConfig.useSSL}
              onValueChange={() => handleToggleChange("useSSL")}
              trackColor={{ false: "#2A2A2A", true: "#4568DC" }}
              thumbColor={serverConfig.useSSL ? "#B06AB3" : "#FFFFFF"}
            />
          </View>

          <Text style={styles.label}>Max Connections</Text>
          <TextInput
            style={styles.input}
            value={serverConfig.maxConnections}
            onChangeText={(text) => handleInputChange("maxConnections", text)}
            placeholder="Enter max connections"
            placeholderTextColor="#757575"
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestConnection}
            disabled={testingConnection}
          >
            {testingConnection ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.testButtonText}>Test Connection</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Backup Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup Configuration</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable Automatic Backups</Text>
            <Switch
              value={serverConfig.enableAutoBackup}
              onValueChange={() => handleToggleChange("enableAutoBackup")}
              trackColor={{ false: "#2A2A2A", true: "#4568DC" }}
              thumbColor={serverConfig.enableAutoBackup ? "#B06AB3" : "#FFFFFF"}
            />
          </View>

          {serverConfig.enableAutoBackup && (
            <>
              <Text style={styles.label}>Backup Frequency</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[styles.pickerOption, serverConfig.backupFrequency === "daily" && styles.selectedOption]}
                  onPress={() => handleInputChange("backupFrequency", "daily")}
                >
                  <Text style={serverConfig.backupFrequency === "daily" ? styles.selectedOptionText : styles.optionText}>Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerOption, serverConfig.backupFrequency === "weekly" && styles.selectedOption]}
                  onPress={() => handleInputChange("backupFrequency", "weekly")}
                >
                  <Text style={serverConfig.backupFrequency === "weekly" ? styles.selectedOptionText : styles.optionText}>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerOption, serverConfig.backupFrequency === "monthly" && styles.selectedOption]}
                  onPress={() => handleInputChange("backupFrequency", "monthly")}
                >
                  <Text style={serverConfig.backupFrequency === "monthly" ? styles.selectedOptionText : styles.optionText}>Monthly</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Backup Time</Text>
              <TextInput
                style={styles.input}
                value={serverConfig.backupTime}
                onChangeText={(text) => handleInputChange("backupTime", text)}
                placeholder="HH:MM (24-hour format)"
                placeholderTextColor="#757575"
              />
            </>
          )}
        </View>

        {/* System Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Logs</Text>

          <Text style={styles.label}>Logging Level</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={[styles.pickerOption, serverConfig.loggingLevel === "error" && styles.selectedOption]}
              onPress={() => handleInputChange("loggingLevel", "error")}
            >
              <Text style={serverConfig.loggingLevel === "error" ? styles.selectedOptionText : styles.optionText}>Error</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickerOption, serverConfig.loggingLevel === "warn" && styles.selectedOption]}
              onPress={() => handleInputChange("loggingLevel", "warn")}
            >
              <Text style={serverConfig.loggingLevel === "warn" ? styles.selectedOptionText : styles.optionText}>Warn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickerOption, serverConfig.loggingLevel === "info" && styles.selectedOption]}
              onPress={() => handleInputChange("loggingLevel", "info")}
            >
              <Text style={serverConfig.loggingLevel === "info" ? styles.selectedOptionText : styles.optionText}>Info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickerOption, serverConfig.loggingLevel === "debug" && styles.selectedOption]}
              onPress={() => handleInputChange("loggingLevel", "debug")}
            >
              <Text style={serverConfig.loggingLevel === "debug" ? styles.selectedOptionText : styles.optionText}>Debug</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Recent Logs</Text>
          <View style={styles.logsContainer}>
            {logs.map((log, index) => (
              <View
                key={index}
                style={styles.logEntry}
              >
                <View style={styles.logIconContainer}>{getLogIcon(log.level)}</View>
                <View style={styles.logContent}>
                  <Text style={styles.logMessage}>{log.message}</Text>
                  <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.viewLogsButton}>
            <Text style={styles.viewLogsText}>View All Logs</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient
              colors={["#4568DC", "#B06AB3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.saveButtonText}>Save Configuration</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restartButton}
            onPress={handleRestart}
          >
            <Text style={styles.restartButtonText}>
              <Ionicons
                name="refresh"
                size={16}
                color="#f97316"
              />{" "}
              Restart Server
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
          <Text style={styles.loadingText}>Restarting server...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B06AB3",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    marginBottom: 16,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  pickerContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  pickerOption: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 4,
    marginRight: 8,
  },
  selectedOption: {
    backgroundColor: "#4568DC",
  },
  optionText: {
    color: "#FFFFFF",
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  testButton: {
    backgroundColor: "#4568DC",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  testButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  logsContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  logEntry: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  logIconContainer: {
    marginRight: 8,
    justifyContent: "center",
  },
  logContent: {
    flex: 1,
  },
  logMessage: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  logTimestamp: {
    color: "#757575",
    fontSize: 12,
    marginTop: 2,
  },
  viewLogsButton: {
    alignItems: "center",
    padding: 8,
  },
  viewLogsText: {
    color: "#4568DC",
    textDecorationLine: "underline",
  },
  actionButtonsContainer: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  saveButton: {
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 16,
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  restartButton: {
    padding: 12,
    alignItems: "center",
  },
  restartButtonText: {
    color: "#f97316",
    fontSize: 16,
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 16,
  },
});

export default ServerConfigScreen;
