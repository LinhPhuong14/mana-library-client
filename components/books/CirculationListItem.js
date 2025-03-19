import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text, Button, Chip, Avatar, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Component to display a circulation item (checkout/return/reservation) in a list
 *
 * @param {string} title - Title of the book
 * @param {string} subtitle - Subtitle (author) of the book
 * @param {string} imageUrl - URL to book cover image
 * @param {string} primaryLabel - Label for primary date/info
 * @param {string} primaryValue - Value for primary date/info
 * @param {string} secondaryLabel - Label for secondary info (user)
 * @param {string} secondaryValue - Value for secondary info (user name)
 * @param {string} status - Optional status text
 * @param {string} statusColor - Optional color for status
 * @param {string} actionIcon - Icon name for action button
 * @param {string} actionLabel - Label for action button
 * @param {Function} onPress - Function when pressing the item
 * @param {Function} onUserPress - Function when pressing the user info
 * @param {Function} onAction - Function when pressing action button
 */
const CirculationListItem = ({
  title,
  subtitle,
  imageUrl,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  status,
  statusColor,
  actionIcon,
  actionLabel,
  onPress,
  onUserPress,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={onPress}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.cover}
          />
        ) : (
          <View style={styles.placeholderCover}>
            <MaterialIcons
              name="book"
              size={32}
              color="#CCCCCC"
            />
          </View>
        )}

        <View style={styles.details}>
          <View>
            <Text
              style={styles.title}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              style={styles.subtitle}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>{primaryLabel}</Text>
                <Text style={styles.metaValue}>{primaryValue}</Text>
              </View>

              <TouchableOpacity onPress={onUserPress}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>{secondaryLabel}</Text>
                  <View style={styles.userRow}>
                    <Avatar.Icon
                      icon="account"
                      size={16}
                      style={styles.userIcon}
                    />
                    <Text style={[styles.metaValue, styles.userName]}>{secondaryValue}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {status && (
              <Chip
                style={[styles.statusChip, statusColor && { backgroundColor: statusColor }]}
                textStyle={{ color: "white", fontSize: 12 }}
              >
                {status}
              </Chip>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {actionIcon && actionLabel && onAction && (
        <>
          <Divider style={styles.divider} />
          <View style={styles.actionContainer}>
            <Button
              icon={actionIcon}
              mode="outlined"
              onPress={onAction}
              compact
              style={styles.actionButton}
            >
              {actionLabel}
            </Button>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingTop: 12,
  },
  contentContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  cover: {
    width: 60,
    height: 85,
    borderRadius: 4,
  },
  placeholderCover: {
    width: 60,
    height: 85,
    borderRadius: 4,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
  metaContainer: {
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    marginRight: 12,
  },
  metaLabel: {
    fontSize: 12,
    color: "#757575",
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userIcon: {
    backgroundColor: "#4568DC",
    marginRight: 4,
  },
  userName: {
    color: "#4568DC",
    textDecorationLine: "underline",
  },
  statusChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#757575",
    height: 22,
  },
  divider: {
    marginHorizontal: 12,
  },
  actionContainer: {
    padding: 8,
    alignItems: "flex-end",
  },
  actionButton: {
    borderColor: "#4568DC",
  },
});

export default CirculationListItem;
