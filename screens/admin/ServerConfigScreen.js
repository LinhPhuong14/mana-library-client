"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, Alert } from "react-native"
import { Appbar, TextInput, Button, Switch, Text, Title, Paragraph, useTheme, Surface } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated"

const ServerConfigScreen = () => {
  const navigation = useNavigation()
  const theme = useTheme()

  // Mock server configuration
  const [serverConfig, setServerConfig] = useState({
    serverUrl: "https://api.library.example.com",
    apiKey: "api_key_12345",
    databaseName: "library_db",
    maxBorrowDays: "14",
    maxBooksPerUser: "5",
    enableNotifications: true,
    enableAutoRenewal: false,
    enableOverdueReminders: true,
    backupFrequency: "daily",
    logLevel: "info",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editedConfig, setEditedConfig] = useState({ ...serverConfig })
  const [loading, setLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const handleSave = () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setServerConfig({ ...editedConfig })
      setIsEditing(false)
      setLoading(false)
        //Call api here
      Alert.alert("Thành công", "Cấu hình máy chủ đã được cập nhật", [{ text: "OK" }])
    }, 1000)
  }

  const handleCancel = () => {
    setEditedConfig({ ...serverConfig })
    setIsEditing(false)
  }

  const handleBackupNow = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn sao lưu dữ liệu ngay bây giờ?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Sao lưu",
        onPress: () => {
          // Simulate backup
          Alert.alert("Thành công", "Dữ liệu đã được sao lưu thành công")
        },
      },
    ])
  }

  const handleRestoreBackup = () => {
    Alert.alert("Cảnh báo", "Khôi phục dữ liệu sẽ ghi đè lên dữ liệu hiện tại. Bạn có chắc chắn muốn tiếp tục?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Khôi phục",
        style: "destructive",
        onPress: () => {
          // Simulate restore
          Alert.alert("Thành công", "Dữ liệu đã được khôi phục thành công")
        },
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <StatusBar style={""} />

      <Appbar.Header style={[styles.header, { backgroundColor: theme.colors.surface }]} elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Cấu hình máy chủ" titleStyle={styles.headerTitle} />
        {!isEditing ? (
          <Appbar.Action icon="pencil" onPress={() => setIsEditing(true)} size={24} />
        ) : (
          <>
            <Appbar.Action icon="close" onPress={handleCancel} size={24} />
            <Appbar.Action icon="content-save" onPress={handleSave} disabled={loading} size={24} />
          </>
        )}
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="server" size={24} color={theme.colors.primary} />
              <Title style={styles.cardTitle}>Cấu hình kết nối</Title>
            </View>

            <TextInput
              label="URL máy chủ"
              value={isEditing ? editedConfig.serverUrl : serverConfig.serverUrl}
              onChangeText={(text) => setEditedConfig({ ...editedConfig, serverUrl: text })}
              mode="outlined"
              style={styles.input}
              disabled={!isEditing}
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="web" />}
            />

            <TextInput
              label="Khóa API"
              value={isEditing ? editedConfig.apiKey : serverConfig.apiKey}
              onChangeText={(text) => setEditedConfig({ ...editedConfig, apiKey: text })}
              mode="outlined"
              style={styles.input}
              disabled={!isEditing}
              secureTextEntry={!showApiKey && !isEditing}
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="key" />}
              right={
                <TextInput.Icon icon={showApiKey ? "eye-off" : "eye"} onPress={() => setShowApiKey(!showApiKey)} />
              }
            />

            <TextInput
              label="Tên cơ sở dữ liệu"
              value={isEditing ? editedConfig.databaseName : serverConfig.databaseName}
              onChangeText={(text) => setEditedConfig({ ...editedConfig, databaseName: text })}
              mode="outlined"
              style={styles.input}
              disabled={!isEditing}
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="database" />}
            />
          </Surface>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="cog" size={24} color={theme.colors.primary} />
              <Title style={styles.cardTitle}>Cấu hình hệ thống</Title>
            </View>

            <TextInput
              label="Số ngày mượn tối đa"
              value={isEditing ? editedConfig.maxBorrowDays : serverConfig.maxBorrowDays}
              onChangeText={(text) => setEditedConfig({ ...editedConfig, maxBorrowDays: text })}
              mode="outlined"
              style={styles.input}
              disabled={!isEditing}
              keyboardType="numeric"
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="calendar-range" />}
            />

            <TextInput
              label="Số sách tối đa mỗi người dùng"
              value={isEditing ? editedConfig.maxBooksPerUser : serverConfig.maxBooksPerUser}
              onChangeText={(text) => setEditedConfig({ ...editedConfig, maxBooksPerUser: text })}
              mode="outlined"
              style={styles.input}
              disabled={!isEditing}
              keyboardType="numeric"
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="book-multiple" />}
            />

            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <MaterialCommunityIcons name="bell" size={20} color={theme.colors.primary} style={styles.switchIcon} />
                <Text style={{ color: theme.colors.text }}>Bật thông báo</Text>
              </View>
              <Switch
                value={isEditing ? editedConfig.enableNotifications : serverConfig.enableNotifications}
                onValueChange={(value) => setEditedConfig({ ...editedConfig, enableNotifications: value })}
                disabled={!isEditing}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <MaterialCommunityIcons
                  name="autorenew"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.switchIcon}
                />
                <Text style={{ color: theme.colors.text }}>Bật tự động gia hạn</Text>
              </View>
              <Switch
                value={isEditing ? editedConfig.enableAutoRenewal : serverConfig.enableAutoRenewal}
                onValueChange={(value) => setEditedConfig({ ...editedConfig, enableAutoRenewal: value })}
                disabled={!isEditing}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.switchIcon}
                />
                <Text style={{ color: theme.colors.text }}>Bật nhắc nhở quá hạn</Text>
              </View>
              <Switch
                value={isEditing ? editedConfig.enableOverdueReminders : serverConfig.enableOverdueReminders}
                onValueChange={(value) => setEditedConfig({ ...editedConfig, enableOverdueReminders: value })}
                disabled={!isEditing}
                color={theme.colors.primary}
              />
            </View>
          </Surface>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="backup-restore" size={24} color={theme.colors.primary} />
              <Title style={styles.cardTitle}>Sao lưu & Khôi phục</Title>
            </View>

            <Paragraph style={styles.backupInfo}>Tần suất sao lưu hiện tại: {serverConfig.backupFrequency}</Paragraph>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleBackupNow}
                style={styles.button}
                icon="backup-restore"
                contentStyle={styles.buttonContent}
              >
                Sao lưu ngay
              </Button>

              <Button
                mode="outlined"
                onPress={handleRestoreBackup}
                style={styles.button}
                icon="database-import"
                contentStyle={styles.buttonContent}
              >
                Khôi phục
              </Button>
            </View>
          </Surface>
        </Animated.View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  inputOutline: {
    borderRadius: 12,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchIcon: {
    marginRight: 8,
  },
  backupInfo: {
    marginVertical: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  buttonContent: {
    height: 44,
  },
  footer: {
    height: 20,
  },
})

export default ServerConfigScreen


