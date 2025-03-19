"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, Text, Dimensions } from "react-native"
import { Appbar, Button, ActivityIndicator, Card, Title, Paragraph, useTheme, Surface } from "react-native-paper"
import { Camera } from "expo-camera"
import { BarCodeScanner } from "expo-barcode-scanner"
import { useNavigation } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated"

const { width } = Dimensions.get("window")

const AddBookScanScreen = () => {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(true)
  const [bookData, setBookData] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation()
  const theme = useTheme()

  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanning) {
      setScanned(true)
      setScanning(false)
      fetchBookData(data)
    }
  }

  const fetchBookData = (isbn) => {
    setLoading(true)

    // Simulate API call to fetch book data by ISBN
    setTimeout(() => {
      // Mock data - in a real app, you would fetch this from an API
      if (isbn === "9786045161753") {
        setBookData({
          title: "Đắc Nhân Tâm",
          author: "Dale Carnegie",
          isbn: "9786045161753",
          publisher: "NXB Tổng hợp TP.HCM",
          publishYear: "2016",
          pages: "320",
          category: "Kỹ năng sống",
          description:
            "Đắc nhân tâm là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại.",
          coverUrl: "https://m.media-amazon.com/images/I/61OgD1VnRxL._AC_UF1000,1000_QL80_.jpg",
        })
      } else {
        setBookData({
          title: "Sách không xác định",
          author: "Không xác định",
          isbn: isbn,
          publisher: "",
          publishYear: "",
          pages: "",
          category: "",
          description: "Không tìm thấy thông tin sách với mã ISBN này.",
          coverUrl: "https://via.placeholder.com/150",
        })
      }

      setLoading(false)
    }, 1500)
  }

  const handleAddBook = () => {
    navigation.navigate("AddBookManual", { book: bookData })
  }

  const resetScanner = () => {
    setScanned(false)
    setScanning(true)
    setBookData(null)
  }

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
        <StatusBar style={theme.dark ? "light" : "dark"} />
        <View style={styles.messageContainer}>
          <Text style={[styles.messageText, { color: theme.colors.text }]}>Đang yêu cầu quyền truy cập camera...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
        <StatusBar style={theme.dark ? "light" : "dark"} />
        <View style={styles.messageContainer}>
          <MaterialCommunityIcons name="camera-off" size={60} color={theme.colors.error} />
          <Text style={[styles.messageText, { color: theme.colors.text }]}>Không có quyền truy cập camera.</Text>
          <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
            Quay lại
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <StatusBar style={theme.dark ? "light" : "dark"} />

      <Appbar.Header style={[styles.header, { backgroundColor: theme.colors.surface }]} elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quét mã sách" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {scanning && (
        <View style={styles.cameraContainer}>
          <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={styles.camera} />
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
            <Text style={styles.overlayText}>Đặt mã vạch vào khung hình</Text>
          </View>
        </View>
      )}

      {!scanning && (
        <View style={styles.resultContainer}>
          {loading ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>Đang tìm kiếm thông tin sách...</Text>
            </Animated.View>
          ) : (
            <>
              {bookData && (
                <Animated.View entering={SlideInUp.duration(500)}>
                  <Surface style={[styles.bookCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
                    <Card.Cover source={{ uri: bookData.coverUrl }} style={styles.bookCover} />
                    <View style={styles.bookContent}>
                      <Title style={[styles.bookTitle, { color: theme.colors.text }]}>{bookData.title}</Title>
                      <Paragraph style={[styles.bookInfo, { color: theme.colors.text }]}>
                        <Text style={styles.infoLabel}>Tác giả:</Text> {bookData.author}
                      </Paragraph>
                      <Paragraph style={[styles.bookInfo, { color: theme.colors.text }]}>
                        <Text style={styles.infoLabel}>ISBN:</Text> {bookData.isbn}
                      </Paragraph>
                      {bookData.publisher && (
                        <Paragraph style={[styles.bookInfo, { color: theme.colors.text }]}>
                          <Text style={styles.infoLabel}>Nhà xuất bản:</Text> {bookData.publisher}
                        </Paragraph>
                      )}
                      {bookData.publishYear && (
                        <Paragraph style={[styles.bookInfo, { color: theme.colors.text }]}>
                          <Text style={styles.infoLabel}>Năm xuất bản:</Text> {bookData.publishYear}
                        </Paragraph>
                      )}
                      {bookData.description && (
                        <Paragraph style={[styles.bookDescription, { color: theme.colors.text }]}>
                          {bookData.description}
                        </Paragraph>
                      )}
                    </View>
                    <View style={styles.actionButtons}>
                      <Button onPress={resetScanner} style={styles.actionButton} mode="outlined">
                        Quét lại
                      </Button>
                      <Button mode="contained" onPress={handleAddBook} style={styles.actionButton}>
                        Thêm sách này
                      </Button>
                    </View>
                  </Surface>
                </Animated.View>
              )}
            </>
          )}
        </View>
      )}
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
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  backButton: {
    marginTop: 20,
    borderRadius: 12,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: "relative",
    marginBottom: 40,
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "white",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "white",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
  },
  overlayText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    borderRadius: 8,
  },
  resultContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  bookCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  bookCover: {
    height: 200,
  },
  bookContent: {
    padding: 16,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  bookInfo: {
    marginBottom: 8,
    fontSize: 14,
  },
  infoLabel: {
    fontWeight: "bold",
  },
  bookDescription: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 12,
  },
})

export default AddBookScanScreen


