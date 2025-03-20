import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import storageService from "../../services/demo/dataService";

const DiscoveryScreen = ({ navigation }) => {
  const [libraries, setLibraries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLibraries, setFilteredLibraries] = useState([]);

  useEffect(() => {
    loadLibraries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLibraries(libraries);
    } else {
      const filtered = libraries.filter((lib) => lib.name.toLowerCase().includes(searchQuery.toLowerCase()) || lib.description.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredLibraries(filtered);
    }
  }, [searchQuery, libraries]);

  const loadLibraries = async () => {
    try {
      const data = await storageService.getLibraries();
      setLibraries(data);
      setFilteredLibraries(data);
    } catch (error) {
      console.error("Failed to load libraries:", error);
    }
  };

  const renderLibraryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.libraryItem}
      onPress={() => navigation.navigate("LibraryDetails", { libraryId: item.id })}
    >
      <View style={styles.libraryContent}>
        <Text style={styles.libraryName}>{item.name}</Text>
        <Text style={styles.libraryDescription}>{item.description}</Text>
        <Text style={styles.libraryMeta}>
          {item.isPublic ? "Public" : "Private"} • {item.location}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={24}
        color="#666"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Libraries</Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search libraries..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.scanButton}>
            <Ionicons
              name="qr-code"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredLibraries}
        keyExtractor={(item) => item.id}
        renderItem={renderLibraryItem}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("AddLibrary")}
      >
        <Text style={styles.createButtonText}>Wanna lend some books? Click here</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
  },
  searchIcon: {
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
  },
  scanButton: {
    backgroundColor: "#4a6fa5",
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  libraryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  libraryContent: {
    flex: 1,
  },
  libraryName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  libraryDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  libraryMeta: {
    fontSize: 12,
    color: "#999",
  },
  createButton: {
    margin: 16,
    padding: 16,
    backgroundColor: "#4a6fa5",
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default DiscoveryScreen;
