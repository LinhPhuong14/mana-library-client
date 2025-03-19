"use client"

import { useState } from "react"
import { View, StyleSheet, KeyboardAvoidingView, Platform, Dimensions } from "react-native"
import { TextInput, Button, Text, Snackbar, useTheme, Surface } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { MaterialCommunityIcons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

const AdminLoginScreen = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const navigation = useNavigation()
  const theme = useTheme()

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage("Vui lòng nhập tên đăng nhập và mật khẩu")
      setVisible(true)
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)

      // Mock authentication 
      if (username === "admin" && password === "password") {
        navigation.navigate("ManageBooks")
      } else {
        setErrorMessage("Tên đăng nhập hoặc mật khẩu không đúng")
        setVisible(true)
      }
    }, 1500)
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={"dark"} />

      <LinearGradient colors={theme.dark ? ["#121212", "#1e1e1e"] : ["#f5f5f5", "#ffffff"]} style={styles.background} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.logoContainer}>
          <Surface style={[styles.logoSurface, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <MaterialCommunityIcons name="book-open-page-variant" size={60} color={theme.colors.primary} />
          </Surface>
          <Text style={[styles.title, { color: theme.colors.text }]}>Quản lý thư viện</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text + "CC" }]}>
            Đăng nhập với tư cách quản trị viên
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(400)} style={styles.formContainer}>
          <Surface style={[styles.formSurface, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <TextInput
              label="Tên đăng nhập"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 12 }}
            />

            <TextInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? "eye" : "eye-off"}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 12 }}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              loading={loading}
              disabled={loading}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Đăng nhập
            </Button>

            <Button
              mode="text"
              onPress={() => {
                setErrorMessage("Vui lòng liên hệ quản trị viên hệ thống")
                setVisible(true)
              }}
              style={styles.forgotButton}
            >
              Quên mật khẩu?
            </Button>
          </Surface>
        </Animated.View>
      </KeyboardAvoidingView>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={styles.snackbar}
        action={{
          label: "Đóng",
          onPress: () => setVisible(false),
        }}
      >
        {errorMessage}
      </Snackbar>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoSurface: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  formSurface: {
    padding: 24,
    borderRadius: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  inputOutline: {
    borderRadius: 12,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  snackbar: {
    marginBottom: 20,
  },
})

export default AdminLoginScreen

