import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Button, IconButton, ActivityIndicator } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import bookService from "../../services/bookService";

const BarcodeScanScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();

  // Mode can be: "isbn", "search", "checkout", "return"
  const { mode = "isbn", onScan } = route.params || {};

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");

      if (status !== "granted") {
        Alert.alert("Camera Permission", "We need camera permission to scan barcodes", [{ text: "OK", onPress: () => navigation.goBack() }]);
      }
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);
    setScanResult(data);

    try {
      switch (mode) {
        case "isbn":
          handleISBNScan(data);
          break;
        case "search":
          await handleBookSearch(data);
          break;
        case "checkout":
          await handleBookCheckout(data);
          break;
        case "return":
          await handleBookReturn(data);
          break;
        default:
          // Default just returns the scanned data
          if (onScan && typeof onScan === "function") {
            onScan(data);
            navigation.goBack();
          } else {
            navigation.navigate("BookDetail", { barcode: data });
          }
      }
    } catch (error) {
      console.error("Error processing barcode:", error);
      Alert.alert("Scan Error", `Failed to process the barcode: ${error.message || "Unknown error"}`, [
        { text: "Cancel", onPress: () => navigation.goBack() },
        {
          text: "Try Again",
          onPress: () => {
            setScanned(false);
            setProcessing(false);
          },
        },
      ]);
    } finally {
      setProcessing(false);
    }
  };

  const handleISBNScan = (isbn) => {
    // Just return the ISBN to the caller
    if (onScan && typeof onScan === "function") {
      onScan(isbn);
      navigation.goBack();
    } else {
      // If no callback, just show the result
      Alert.alert("ISBN Scanned", `ISBN: ${isbn}`, [
        {
          text: "Scan Again",
          onPress: () => {
            setScanned(false);
          },
        },
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleBookSearch = async (barcode) => {
    const book = await bookService.getBookByBarcode(barcode);

    if (book) {
      navigation.replace("BookDetail", { bookId: book.id });
    } else {
      Alert.alert("Book Not Found", `No book found with barcode: ${barcode}`, [
        {
          text: "Scan Again",
          onPress: () => {
            setScanned(false);
          },
        },
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleBookCheckout = async (barcode) => {
    try {
      // First get book by barcode
      const book = await bookService.getBookByBarcode(barcode);

      if (!book) {
        throw new Error(`No book found with barcode: ${barcode}`);
      }

      if (book.status !== "available") {
        throw new Error(`This book is currently ${book.status}`);
      }

      // Navigate to checkout confirmation screen with book ID
      navigation.replace("CheckoutConfirm", { bookId: book.id, barcode });
    } catch (error) {
      Alert.alert("Checkout Error", error.message || "Failed to process checkout", [
        {
          text: "Scan Again",
          onPress: () => {
            setScanned(false);
          },
        },
        { text: "Cancel", onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleBookReturn = async (barcode) => {
    try {
      // First get book by barcode
      const book = await bookService.getBookByBarcode(barcode);

      if (!book) {
        throw new Error(`No book found with barcode: ${barcode}`);
      }

      if (book.status !== "borrowed") {
        throw new Error(`This book is not checked out (status: ${book.status})`);
      }

      // Navigate to return confirmation screen with book ID
      navigation.replace("ReturnConfirm", { bookId: book.id, barcode });
    } catch (error) {
      Alert.alert("Return Error", error.message || "Failed to process return", [
        {
          text: "Scan Again",
          onPress: () => {
            setScanned(false);
          },
        },
        { text: "Cancel", onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanResult(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#4568DC"
        />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.noPermissionContainer}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.ean13, BarCodeScanner.Constants.BarCodeType.ean8]}
        flashMode={torchOn ? BarCodeScanner.Constants.FlashMode.torch : BarCodeScanner.Constants.FlashMode.off}
      />

      <View style={styles.overlay}>
        <View style={styles.unfilled} />
        <View style={styles.row}>
          <View style={styles.unfilled} />
          <View style={styles.scanWindow} />
          <View style={styles.unfilled} />
        </View>
        <View style={styles.unfilled} />
      </View>

      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          color="white"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>
          {mode === "isbn" ? "Scan ISBN" : mode === "search" ? "Scan to Search" : mode === "checkout" ? "Scan to Check Out" : mode === "return" ? "Scan to Return" : "Scan Barcode"}
        </Text>
        <IconButton
          icon={torchOn ? "flashlight-off" : "flashlight"}
          color="white"
          size={24}
          onPress={() => setTorchOn(!torchOn)}
        />
      </View>

      <View style={styles.footer}>
        {processing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator
              size="large"
              color="white"
            />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        ) : scanResult ? (
          <View style={styles.resultContainer}>
            <Text style={styles.scanResultText}>Barcode: {scanResult}</Text>
            <Button
              mode="contained"
              onPress={handleScanAgain}
              style={styles.scanAgainButton}
            >
              Scan Again
            </Button>
          </View>
        ) : (
          <Text style={styles.instructions}>Position a barcode within the scan area</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    marginTop: 16,
    fontSize: 16,
  },
  backButton: {
    marginTop: 16,
  },
  overlay: {
    flex: 1,
  },
  unfilled: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  row: {
    flexDirection: "row",
    height: "25%",
  },
  scanWindow: {
    width: 250,
    height: "100%",
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "transparent",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 16,
    alignItems: "center",
  },
  instructions: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  processingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  processingText: {
    color: "white",
    fontSize: 16,
    marginTop: 16,
  },
  resultContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 16,
    width: "100%",
    alignItems: "center",
  },
  scanResultText: {
    color: "white",
    fontSize: 16,
    marginBottom: 16,
  },
  scanAgainButton: {
    width: "80%",
  },
});

export default BarcodeScanScreen;
