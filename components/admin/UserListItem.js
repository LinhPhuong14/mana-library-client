"use client"
import { StyleSheet, View, Pressable } from "react-native"
import { Surface, Text, Avatar, Badge, useTheme } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Animated, { FadeInRight } from "react-native-reanimated"

const UserListItem = ({ user, onPress, index = 0 }) => {
  const theme = useTheme()

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(400)} style={styles.container}>
      <Pressable
        onPress={() => onPress(user)}
        android_ripple={{ color: theme.colors.ripple }}
        style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <View style={styles.avatarContainer}>
            <Avatar.Image size={50} source={{ uri: user.avatarUrl || "https://via.placeholder.com/50" }} />
            {user.borrowedBooks > 0 && (
              <Badge style={[styles.badge, { backgroundColor: theme.colors.notification }]} size={20}>
                {user.borrowedBooks}
              </Badge>
            )}
          </View>

          <View style={styles.contentContainer}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{user.name}</Text>
            <Text style={[styles.email, { color: theme.colors.text + "CC" }]}>{user.email}</Text>
          </View>

          <View style={styles.statusContainer}>
            <MaterialCommunityIcons
              name={user.isActive ? "account-check" : "account-cancel"}
              size={24}
              color={user.isActive ? theme.colors.success : theme.colors.error}
            />
            <Text style={[styles.statusText, { color: user.isActive ? theme.colors.success : theme.colors.error }]}>
              {user.isActive ? "Hoạt động" : "Không hoạt động"}
            </Text>
          </View>
        </Surface>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  pressable: {
    borderRadius: 16,
    overflow: "hidden",
  },
  surface: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  statusContainer: {
    alignItems: "center",
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
  },
})

export default UserListItem

