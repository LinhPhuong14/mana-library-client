import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, FlatList, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import storageService from "../../services/demo/dataService";
import { Platform } from "react-native";

const StorageManagerScreen = ({ navigation }) => {
  const [storageKeys, setStorageKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);
  const [keyData, setKeyData] = useState(null);
  const [editData, setEditData] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load all AsyncStorage keys
  useEffect(() => {
    loadStorageKeys();
  }, []);

  const loadStorageKeys = async () => {
    try {
      setLoading(true);
      const keys = await AsyncStorage.getAllKeys();
      setStorageKeys(keys.sort());
    } catch (error) {
      console.error("Failed to load AsyncStorage keys:", error);
      Alert.alert("Error", "Failed to load storage keys");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStorageKeys().then(() => setRefreshing(false));
  };

  const loadKeyData = async (key) => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem(key);
      setSelectedKey(key);
      setKeyData(data);
      setEditData(data);
    } catch (error) {
      console.error(`Failed to load data for key ${key}:`, error);
      Alert.alert("Error", `Failed to load data for key ${key}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveData = async () => {
    try {
      setLoading(true);
      // Validate JSON
      JSON.parse(editData);

      // Save to AsyncStorage
      await AsyncStorage.setItem(selectedKey, editData);

      // Update current view
      setKeyData(editData);
      setEditModalVisible(false);

      Alert.alert("Success", `Data for key ${selectedKey} updated successfully`);
    } catch (error) {
      console.error("Failed to save data:", error);
      if (error instanceof SyntaxError) {
        Alert.alert("Invalid JSON", "Please check your JSON format");
      } else {
        Alert.alert("Error", "Failed to save data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (key) => {
    Alert.alert("Delete Storage Key", `Are you sure you want to delete the key ${key}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await AsyncStorage.removeItem(key);
            if (selectedKey === key) {
              setSelectedKey(null);
              setKeyData(null);
            }
            await loadStorageKeys();
            Alert.alert("Success", `Key ${key} deleted successfully`);
          } catch (error) {
            console.error(`Failed to delete key ${key}:`, error);
            Alert.alert("Error", `Failed to delete key ${key}`);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const resetAllData = () => {
    Alert.alert("Reset All Data", "Are you sure you want to reset ALL storage data? This will reinitialize the demo data.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await AsyncStorage.clear();
            await storageService.initializeDemoData();
            await loadStorageKeys();
            setSelectedKey(null);
            setKeyData(null);
            Alert.alert("Success", "All data has been reset to demo defaults");
          } catch (error) {
            console.error("Failed to reset data:", error);
            Alert.alert("Error", "Failed to reset data");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderKeyItem = ({ item }) => {
    const isSelected = selectedKey === item;
    const isSystemKey = item.startsWith("mana_");

    return (
      <TouchableOpacity
        style={[styles.keyItem, isSelected && styles.selectedKeyItem]}
        onPress={() => loadKeyData(item)}
      >
        <View style={styles.keyItemContent}>
          <MaterialIcons
            name={isSystemKey ? "storage" : "data-usage"}
            size={24}
            color={isSystemKey ? "#4568DC" : "#B06AB3"}
          />
          <Text style={styles.keyText}>{item}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteKey(item)}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color="#ef4444"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>Storage Manager</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons
            name="refresh"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* Storage Keys List */}
        <View style={styles.keysContainer}>
          <Text style={styles.sectionTitle}>Storage Keys</Text>
          {loading && !keyData ? (
            <ActivityIndicator
              size="large"
              color="#B06AB3"
            />
          ) : (
            <FlatList
              data={storageKeys}
              renderItem={renderKeyItem}
              keyExtractor={(item) => item}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              ListEmptyComponent={<Text style={styles.emptyText}>No storage keys found</Text>}
            />
          )}
        </View>

        {/* Key Data View */}
        <View style={styles.dataContainer}>
          <View style={styles.dataHeader}>
            <Text style={styles.sectionTitle}>{selectedKey ? `Data: ${selectedKey}` : "Select a key to view data"}</Text>
            {selectedKey && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditModalVisible(true)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading && selectedKey ? (
            <ActivityIndicator
              size="large"
              color="#B06AB3"
            />
          ) : keyData ? (
            <ScrollView style={styles.dataScrollView}>
              <Text style={styles.dataText}>{JSON.stringify(JSON.parse(keyData), null, 2)}</Text>
            </ScrollView>
          ) : (
            <View style={styles.noDataContainer}>
              <MaterialIcons
                name="storage"
                size={60}
                color="#2A2A2A"
              />
              <Text style={styles.noDataText}>Select a storage key to view its data</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bottom Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetAllData}
        >
          <Text style={styles.resetButtonText}>Reset All Data</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>Edit Data</Text>
            <Text style={styles.modalSubtitle}>{selectedKey}</Text>

            <TextInput
              style={styles.jsonEditor}
              value={editData}
              onChangeText={setEditData}
              multiline
              autoCorrect={false}
              textAlignVertical="top"
              placeholder="Enter JSON data"
              placeholderTextColor="#757575"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveData}
              >
                <LinearGradient
                  colors={["#4568DC", "#B06AB3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveGradient}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
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
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  keysContainer: {
    width: "35%",
    borderRightWidth: 1,
    borderRightColor: "#2A2A2A",
    padding: 12,
  },
  dataContainer: {
    flex: 1,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#B06AB3",
    marginBottom: 12,
  },
  keyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedKeyItem: {
    backgroundColor: "#2A2A2A",
    borderLeftWidth: 3,
    borderLeftColor: "#4568DC",
  },
  keyItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  keyText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  dataHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  editButtonText: {
    color: "#4568DC",
    fontWeight: "bold",
  },
  dataScrollView: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 12,
  },
  dataText: {
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "#757575",
    marginTop: 12,
    textAlign: "center",
  },
  emptyText: {
    color: "#757575",
    textAlign: "center",
    marginTop: 20,
  },
  actionButtonsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  resetButton: {
    backgroundColor: "#2A2A2A",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#ef4444",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#B06AB3",
    marginBottom: 16,
  },
  jsonEditor: {
    backgroundColor: "#121212",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    height: 300,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  cancelButton: {
    backgroundColor: "#2A2A2A",
    padding: 12,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#FFFFFF",
  },
  saveButton: {
    marginLeft: 8,
  },
  saveGradient: {
    padding: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StorageManagerScreen;
