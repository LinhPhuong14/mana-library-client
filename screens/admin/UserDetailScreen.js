"use client"

import React, { useState } from "react"
import { View, StyleSheet, FlatList } from "react-native"
import { Appbar, Searchbar, Chip, FAB, useTheme, Text } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated"
import UserListItem from "../../components/admin/UserListItem"

// Mock data
const mockUsers = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    borrowedBooks: 3,
    isActive: true,
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    borrowedBooks: 0,
    isActive: true,
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "levanc@example.com",
    borrowedBooks: 1,
    isActive: false,
    avatarUrl: "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    borrowedBooks: 2,
    isActive: true,
    avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: "5",
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    borrowedBooks: 0,
    isActive: false,
    avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
  },
]

const UserDetailsScreen = () => {
  const [users, setUsers] = useState(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all") // 'all', 'active', 'inactive', 'borrowing'
  const navigation = useNavigation()
  const theme = useTheme()

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "active") return matchesSearch && user.isActive
    if (filter === "inactive") return matchesSearch && !user.isActive
    if (filter === "borrowing") return matchesSearch && user.borrowedBooks > 0

    return matchesSearch
  })

  const handleUserPress = (user) => {
    // Navigate to user detail or show modal with user details
    console.log("User pressed:", user)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <StatusBar style={theme.dark ? "light" : "dark"} />

      <Appbar.Header style={[styles.header, { backgroundColor: theme.colors.surface }]} elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quản lý người dùng" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <Animated.View entering={FadeIn.duration(500)} style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm người dùng..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
          iconColor={theme.colors.primary}
          clearIcon="close-circle"
        />
      </Animated.View>

      <Animated.View entering={SlideInRight.duration(500)} style={styles.filterContainer}>
        <ScrollableChips
          items={[
            { id: "all", label: "Tất cả" },
            { id: "active", label: "Đang hoạt động" },
            { id: "inactive", label: "Không hoạt động" },
            { id: "borrowing", label: "Đang mượn sách" },
          ]}
          selectedId={filter}
          onSelect={setFilter}
        />
      </Animated.View>

      {filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <UserListItem user={item} onPress={handleUserPress} index={index} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
        </View>
      )}

      <FAB
        icon="account-plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          // Navigate to add user screen
          console.log("Add user")
        }}
      />
    </SafeAreaView>
  )
}

// ScrollableChips component for horizontal scrolling chips
const ScrollableChips = ({ items, selectedId, onSelect }) => {
  const theme = useTheme()
  const scrollViewRef = React.useRef(null)

  return (
    <View style={styles.chipsScrollContainer}>
      <FlatList
        ref={scrollViewRef}
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Chip
            selected={selectedId === item.id}
            onPress={() => onSelect(item.id)}
            style={[
              styles.chip,
              selectedId === item.id
                ? { backgroundColor: theme.colors.primary + "20" }
                : { backgroundColor: theme.colors.surface },
            ]}
            textStyle={[
              styles.chipText,
              selectedId === item.id
                ? { color: theme.colors.primary, fontWeight: "bold" }
                : { color: theme.colors.text },
            ]}
            showSelectedCheck={false}
            elevated
          >
            {item.label}
          </Chip>
        )}
        contentContainerStyle={styles.chipsList}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 2,
    borderRadius: 12,
    height: 50,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chipsScrollContainer: {
    flexDirection: "row",
  },
  chipsList: {
    paddingRight: 16,
  },
  chip: {
    marginRight: 8,
    height: 36,
    borderRadius: 18,
  },
  chipText: {
    fontSize: 14,
  },
  list: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
})

export default UserDetailsScreen


