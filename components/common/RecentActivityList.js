import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Avatar, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * A list component to display recent activities
 *
 * @param {Array} activities - Array of activity objects
 * @param {number} maxItems - Maximum number of items to display
 */
const RecentActivityList = ({ activities = [], maxItems = 5 }) => {
  const getActivityIcon = (type) => {
    switch (type.toLowerCase()) {
      case "checkout":
      case "borrow":
        return { name: "book-arrow-right", color: "#4CAF50" };
      case "return":
        return { name: "book-arrow-left", color: "#FF9800" };
      case "reserve":
        return { name: "book-clock", color: "#2196F3" };
      case "cancel":
        return { name: "book-remove", color: "#F44336" };
      case "add":
      case "create":
        return { name: "add-circle", color: "#4568DC" };
      case "edit":
      case "update":
        return { name: "edit", color: "#9C27B0" };
      case "delete":
        return { name: "delete", color: "#F44336" };
      case "user":
      case "member":
        return { name: "person", color: "#607D8B" };
      default:
        return { name: "info", color: "#757575" };
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }) => {
    const { type, title, user, timestamp } = item;
    const { name, color } = getActivityIcon(type);

    return (
      <View style={styles.activityItem}>
        <Avatar.Icon
          icon={(props) => (
            <MaterialIcons
              name={name}
              {...props}
            />
          )}
          size={40}
          color="white"
          style={[styles.activityIcon, { backgroundColor: color }]}
        />
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{title}</Text>
          <View style={styles.activityMeta}>
            {user && (
              <View style={styles.userContainer}>
                <MaterialIcons
                  name="person"
                  size={12}
                  color="#757575"
                />
                <Text style={styles.username}>{user}</Text>
              </View>
            )}
            <Text style={styles.timestamp}>{formatDateTime(timestamp)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const displayActivities = activities.slice(0, maxItems);

  return displayActivities.length > 0 ? (
    <FlatList
      data={displayActivities}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.id?.toString() || `activity-${index}`}
      ItemSeparatorComponent={() => <Divider style={styles.divider} />}
      scrollEnabled={false}
      contentContainerStyle={styles.listContainer}
    />
  ) : (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No recent activity</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  activityItem: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    justifyContent: "center",
  },
  activityTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 12,
    color: "#757575",
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#757575",
  },
  divider: {
    marginHorizontal: 8,
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    color: "#757575",
    fontSize: 14,
  },
});

export default RecentActivityList;
