import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { List, Switch, Divider, Button, Card, Title, Text, Avatar, IconButton, Paragraph, Dialog, Portal, ActivityIndicator, Snackbar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useAdmin } from "../../context/AdminContext";
import ErrorDisplay from "../../components/common/ErrorDisplay";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { userRole, userInfo, signOut, updateUserProfile } = useAuth();
  const { loading: adminLoading } = useAdmin();

  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  // Settings states
  const [settings, setSettings] = useState({
    notifications: {
      newBorrowings: true,
      newReservations: true,
      overdueReminders: true,
      systemAnnouncements: true,
    },
    display: {
      darkMode: false,
      largeText: false,
      compactView: false,
    },
    privacy: {
      shareAnalytics: true,
      storeSearchHistory: true,
    },
    system: {
      autoBackup: true,
      autoUpdate: true,
      debugLogs: false,
    },
  });

  // Handle setting toggle
  const handleToggleSetting = (category, setting) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: !settings[category][setting],
      },
    });

    // Show snackbar for placeholder feedback
    setSnackbarMessage(`${setting} has been ${!settings[category][setting] ? "enabled" : "disabled"} (placeholder)`);
    setSnackbarVisible(true);
  };

  // Navigate to server configuration
  const handleNavigateToServerConfig = () => {
    navigation.navigate("ServerConfig");
  };

  // Handle password change
  const handleChangePassword = () => {
    Alert.alert("Change Password", "This is a placeholder. Password change functionality is not implemented.");
  };

  // Handle profile edit
  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "This is a placeholder. Profile editing functionality is not implemented.");
  };

  // Handle backup data
  const handleBackupData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock backup operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSnackbarMessage("This is a placeholder. Backup functionality is not implemented.");
      setSnackbarVisible(true);
    } catch (err) {
      setError("This is a placeholder. An error occurred during the simulated backup.");
    } finally {
      setLoading(false);
    }
  };

  // Handle export data
  const handleExportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock export operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSnackbarMessage("This is a placeholder. Export functionality is not implemented.");
      setSnackbarVisible(true);
    } catch (err) {
      setError("This is a placeholder. An error occurred during the simulated export.");
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setLogoutDialogVisible(true);
  };

  // Confirm logout
  const confirmLogout = () => {
    setLogoutDialogVisible(false);
    signOut();
  };

  // Handle view activity logs
  const handleViewLogs = () => {
    Alert.alert("Activity Logs", "This is a placeholder. Activity logs functionality is not implemented.");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Avatar.Icon
                icon="account"
                size={60}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Title>{userInfo?.name || "Library Staff"}</Title>
                <Paragraph style={styles.roleBadge}>{userRole?.toUpperCase()}</Paragraph>
                <Paragraph>{userInfo?.email || "staff@library.com"}</Paragraph>
              </View>
            </View>
            <IconButton
              icon="account-edit"
              size={24}
              onPress={handleEditProfile}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Account Settings */}
      <Card style={styles.card}>
        <Card.Title title="Account Settings" />
        <Card.Content>
          <List.Section>
            <List.Item
              title="Change Password"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="key"
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon="chevron-right"
                />
              )}
              onPress={handleChangePassword}
            />
            <Divider />
            <List.Item
              title="Email Preferences"
              description="Manage email communication settings"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="email"
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon="chevron-right"
                />
              )}
              onPress={() => {
                setSnackbarMessage("This is a placeholder. Email preferences functionality is not implemented.");
                setSnackbarVisible(true);
              }}
            />
            <Divider />
            <List.Item
              title="Two-Factor Authentication"
              description="Off"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="shield-account"
                />
              )}
              right={(props) => <Switch value={false} />}
              onPress={() => {
                setSnackbarMessage("This is a placeholder. Two-factor authentication is not implemented.");
                setSnackbarVisible(true);
              }}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* Notification Settings */}
      <Card style={styles.card}>
        <Card.Title title="Notification Settings" />
        <Card.Content>
          <List.Section>
            <List.Item
              title="New Borrowings"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="book-arrow-right"
                />
              )}
              right={(props) => (
                <Switch
                  value={settings.notifications.newBorrowings}
                  onValueChange={() => handleToggleSetting("notifications", "newBorrowings")}
                />
              )}
            />
            <Divider />
            <List.Item
              title="New Reservations"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="book-clock"
                />
              )}
              right={(props) => (
                <Switch
                  value={settings.notifications.newReservations}
                  onValueChange={() => handleToggleSetting("notifications", "newReservations")}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Overdue Book Reminders"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="alert"
                />
              )}
              right={(props) => (
                <Switch
                  value={settings.notifications.overdueReminders}
                  onValueChange={() => handleToggleSetting("notifications", "overdueReminders")}
                />
              )}
            />
            <Divider />
            <List.Item
              title="System Announcements"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="bullhorn"
                />
              )}
              right={(props) => (
                <Switch
                  value={settings.notifications.systemAnnouncements}
                  onValueChange={() => handleToggleSetting("notifications", "systemAnnouncements")}
                />
              )}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* Display Settings */}
      <Card style={styles.card}>
        <Card.Title title="Display Settings" />
        <Card.Content>
          <List.Section>
            <List.Item
              title="Dark Mode"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="brightness-6"
                />
              )}
              right={(props) => (
                <Switch
                  value={settings.display.darkMode}
                  onValueChange={() => handleToggleSetting("display", "darkMode")}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Large Text"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="format-size"
                />
              )}
              right={(props) => (
                <Switch
                  value={settings.display.largeText}
                  onValueChange={() => handleToggleSetting("display", "largeText")}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Compact View"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="view-compact"
                />
              )}
              right={(props) => (
                <Switch
                  value={settings.display.compactView}
                  onValueChange={() => handleToggleSetting("display", "compactView")}
                />
              )}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* System Settings (Admin Only) */}
      {userRole === "admin" && (
        <Card style={styles.card}>
          <Card.Title
            title="System Settings"
            subtitle="Administrator only"
          />
          <Card.Content>
            <List.Section>
              <List.Item
                title="Server Configuration"
                description="Configure server connection settings"
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="server"
                  />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                  />
                )}
                onPress={handleNavigateToServerConfig}
              />
              <Divider />
              <List.Item
                title="Backup System Data"
                description="Last backup: Today at 08:00"
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="backup-restore"
                  />
                )}
                right={() => (
                  <Button
                    mode="outlined"
                    onPress={handleBackupData}
                    loading={loading}
                    disabled={loading}
                  >
                    Backup
                  </Button>
                )}
              />
              <Divider />
              <List.Item
                title="Activity Logs"
                description="View system and user activities"
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="note-text"
                  />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                  />
                )}
                onPress={handleViewLogs}
              />
              <Divider />
              <List.Item
                title="Export Library Data"
                description="Export data to CSV or Excel"
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="export"
                  />
                )}
                right={() => (
                  <Button
                    mode="outlined"
                    onPress={handleExportData}
                    loading={loading}
                    disabled={loading}
                  >
                    Export
                  </Button>
                )}
              />
            </List.Section>
          </Card.Content>
        </Card>
      )}

      {/* Privacy Settings */}
      <Card style={styles.card}>
        <Card.Title title="Privacy Settings" />
        <Card.Content>
          <List.Section>
            <List.Item
              title="Share Usage Analytics"
              description="Help improve the library system"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="chart-bar"
                />
              )}
              right={(props) => (
                <Switch
                  value={settings.privacy.shareAnalytics}
                  onValueChange={() => handleToggleSetting("privacy", "shareAnalytics")}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Store Search History"
              description="Save recent searches for quicker access"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="history"
                />
              )}
              right={(props) => (
                <Switch
                  value={settings.privacy.storeSearchHistory}
                  onValueChange={() => handleToggleSetting("privacy", "storeSearchHistory")}
                />
              )}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* About Section */}
      <Card style={styles.card}>
        <Card.Title title="About" />
        <Card.Content>
          <List.Section>
            <List.Item
              title="App Version"
              description="1.0.0"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="information"
                />
              )}
            />
            <Divider />
            <List.Item
              title="Terms of Service"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="file-document"
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon="chevron-right"
                />
              )}
              onPress={() => {
                setSnackbarMessage("This is a placeholder. Terms of Service functionality is not implemented.");
                setSnackbarVisible(true);
              }}
            />
            <Divider />
            <List.Item
              title="Privacy Policy"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="shield-lock"
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon="chevron-right"
                />
              )}
              onPress={() => {
                setSnackbarMessage("This is a placeholder. Privacy Policy functionality is not implemented.");
                setSnackbarVisible(true);
              }}
            />
            <Divider />
            <List.Item
              title="Help & Support"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="help-circle"
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon="chevron-right"
                />
              )}
              onPress={() => {
                setSnackbarMessage("This is a placeholder. Help & Support functionality is not implemented.");
                setSnackbarVisible(true);
              }}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            icon="logout"
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            contentStyle={styles.logoutContent}
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>

      {/* Logout Dialog */}
      <Portal>
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
        >
          <Dialog.Title>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to sign out from your account?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={confirmLogout}
              color="#F44336"
            >
              Sign Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar for messages */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  profileCard: {
    marginBottom: 16,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#4568DC",
  },
  userInfo: {
    marginLeft: 16,
  },
  roleBadge: {
    color: "#4568DC",
    fontWeight: "bold",
    marginBottom: 4,
  },
  logoutButton: {
    borderColor: "#F44336",
    borderWidth: 1,
  },
  logoutContent: {
    paddingVertical: 8,
  },
  snackbar: {
    bottom: 16,
  },
});

export default SettingsScreen;
