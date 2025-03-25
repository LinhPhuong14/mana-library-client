import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, Camera } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import storageService from "../../services/demo/dataService";

const DiscoveryScreen = ({ navigation }) => {
  const [libraries, setLibraries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLibraries, setFilteredLibraries] = useState([]);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const { initializeDemoData, getLibraries, getLibrary } = storageService;

  useEffect(() => {
    requestCameraPermission();
    loadLibraries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLibraries(libraries);
    } else {
      const filtered = libraries.filter((lib) =>
        lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLibraries(filtered);
    }
  }, [searchQuery, libraries]);

  const loadLibraries = async () => {
    try {
      await initializeDemoData();
      const data = await storageService.getLibraries();
      setLibraries(data);
      setFilteredLibraries(data);
    } catch (error) {
      console.error("Failed to load libraries:", error);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === "granted");
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (!scanned) {
      setScanned(true);

      // Add a delay to reset the scanned state to allow for multiple scans
      setTimeout(() => {
        setScanned(false);
      }, 500);

      setScannerVisible(false);
      if (getLibrary(data) === null) {
        Alert.alert("Library Not Found", "The scanned library does not exist.");
        return;
      }
      // Navigate to the LibraryDetails screen with the scanned libraryId
      navigation.navigate("LibraryDetails", { libraryId: data });
    }
  };

  const toggleScanner = () => {
    if (cameraPermission) {
      setScannerVisible(!isScannerVisible);
      // Reset the scanned state when the scanner is toggled
      setScanned(false);
    } else {
      Alert.alert("Camera Permission", "Please grant camera access in settings.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Libraries</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search libraries..."
            placeholderTextColor="#AAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.scanButton} onPress={toggleScanner}>
            <Ionicons name="qr-code" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredLibraries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.libraryItem}
          >
            <TouchableOpacity
              style={styles.libraryContent}
              onPress={() => navigation.navigate("LibraryDetails", { libraryId: item.id })}
            >
              <Text style={styles.libraryName}>{item.name}</Text>
              <Text style={styles.libraryDescription}>{item.description}</Text>
              <Text style={styles.libraryMeta}>
                {item.isPublic ? "Public" : "Private"} • {item.location}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("LibraryDetails", { libraryId: item.id })}>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        )}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("AddLibrary")}
      >
        <LinearGradient
          colors={["#4568DC", "#B06AB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createButtonGradient}
        >
          <Text style={styles.createButtonText}>Lend Some Books</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={isScannerVisible} animationType="slide" onRequestClose={toggleScanner}>
        <View style={styles.scannerContainer}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
          >
            <View style={styles.scannerOverlay}>
              <TouchableOpacity style={styles.closeScannerButton} onPress={toggleScanner}>
                <Text style={styles.closeScannerButtonText}>Close Scanner</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: "#8A2BE2",
    borderRadius: 10,
    padding: 8,
  },
  listContainer: {
    marginTop: 10,
    paddingBottom: 20,
  },
  libraryItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  libraryContent: {
    flex: 1,
  },
  libraryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  libraryDescription: {
    fontSize: 14,
    color: "#E0E0E0",
    marginVertical: 5,
  },
  libraryMeta: {
    fontSize: 12,
    color: "#BBBBBB",
  },
  createButton: {
    alignSelf: "center",
    marginVertical: 20,
    width: "80%",
    borderRadius: 20,
  },
  createButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 20,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraView: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
    overflow: "hidden",
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  closeScannerButton: {
    backgroundColor: "#8A2BE2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 40,
    alignSelf: "center",
  },
  closeScannerButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

});

export default DiscoveryScreen;
