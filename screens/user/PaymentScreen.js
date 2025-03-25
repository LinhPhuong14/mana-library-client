// user/PaymentScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "react-native-paper";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import dataService from "../../services/demo/dataService";

const PaymentScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [borrowTotal, setBorrowTotal] = useState(0);
  const [fineTotal, setFineTotal] = useState(0);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);

  const userId = "456"; // ví dụ cố định

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      await dataService.initializeDemoData();

      const books = await dataService.getBooks();
      const now = new Date();
      let borrowSum = 0;
      let fineSum = 0;
      let overdueList = [];

      books.forEach((book) => {
        book.copies.forEach((copy) => {
          if (copy.borrowedBy === userId) {
            const due = new Date(copy.dueDate);
            const overdueDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));
            if (overdueDays > 0) {
              overdueList.push({
                ...book,
                dueDate: copy.dueDate,
                copyId: copy.id,
                overdueDays,
              });
              fineSum += Math.min(overdueDays * 5, 100); // ví dụ: 5đ/ngày, max 100đ
            }
            borrowSum += 50; // giả định mỗi lượt mượn tốn 50đ
          }
        });
      });

      setBorrowTotal(borrowSum);
      setFineTotal(fineSum);
      setOverdueBooks(overdueList);

      const accounts = await dataService.getLinkedAccounts(userId);
      setLinkedAccounts(accounts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentData();
    setRefreshing(false);
  };

  const renderBookStatus = (days) => {
    if (days > 7) {
      return (
        <Text style={[styles.statusText, { color: "#ef4444" }]}>
          Cảnh báo: Quá hạn {days} ngày
        </Text>
      );
    } else {
      return (
        <Text style={[styles.statusText, { color: "#facc15" }]}>
          Nhắc nhở: Quá hạn {days} ngày
        </Text>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Thanh toán</Text>
          <TouchableOpacity onPress={() => navigation.navigate("ManagePayments")}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#B06AB3" />
          </TouchableOpacity>
        </View>

        {/* Tổng tiền */}
        <View style={styles.statsContainer}>
          <StatsCard title="Tiền mượn" value={`${borrowTotal}đ`} icon="book" colors={["#4568DC", "#B06AB3"]} />
          <StatsCard title="Tiền phạt" value={`${fineTotal}đ`} icon="money-off" colors={["#ef4444", "#f97316"]} />
        </View>

        {/* TK liên kết */}
        <Card style={styles.card}>
          <Card.Title title="Tài khoản đã liên kết" titleStyle={styles.cardTitle} />
          <Card.Content>
            {linkedAccounts.map((acc, idx) => (
              <View key={idx} style={styles.accountItem}>
                <Text style={styles.accountText}>{acc.type} - {acc.number}</Text>
                <TouchableOpacity>
                  <MaterialIcons name="remove-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.linkBtn}>
              <MaterialIcons name="add-circle" size={20} color="#10b981" />
              <Text style={styles.linkText}>Thêm tài khoản / thẻ</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Nút trả nhanh */}
        <TouchableOpacity style={styles.payAllButton}>
          <LinearGradient colors={["#B06AB3", "#4568DC"]} style={styles.gradientButton}>
            <MaterialIcons name="payment" size={22} color="#fff" />
            <Text style={styles.buttonText}>Thanh toán toàn bộ</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Danh sách sách */}
        <Card style={styles.card}>
          <Card.Title title="Sách quá hạn" titleStyle={styles.cardTitle} />
          <Card.Content>
            {overdueBooks.length === 0 ? (
              <Text style={styles.emptyText}>Không có sách quá hạn</Text>
            ) : (
              overdueBooks.map((book, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.bookItem}
                  onPress={() => navigation.navigate("BookDetailScreen", { bookId: book.id })}
                >
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{book.title}</Text>
                    <Text style={styles.bookAuthor}>{book.author}</Text>
                    {renderBookStatus(book.overdueDays)}
                  </View>
                  <View style={styles.bookActions}>
                    <TouchableOpacity>
                      <MaterialIcons name="payment" size={20} color="#22c55e" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <MaterialIcons name="report" size={20} color="#f97316" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatsCard = ({ title, value, icon, colors }) => (
  <Card style={styles.statsCard}>
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientBackground}>
      <MaterialIcons name={icon} size={30} color="#fff" />
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </LinearGradient>
  </Card>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  statsCard: {
    width: "45%",
    borderRadius: 10,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  gradientBackground: {
    padding: 16,
    alignItems: "center",
    height: 110,
    justifyContent: "center",
  },
  statsTitle: {
    color: "#FFFFFF",
    fontWeight: "500",
    marginTop: 5,
  },
  statsValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 8,
  },
  card: {
    backgroundColor: "#1E1E1E",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
  },
  cardTitle: {
    color: "#FFFFFF",
  },
  accountItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  accountText: {
    color: "#FFFFFF",
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  linkText: {
    color: "#10b981",
    marginLeft: 6,
  },
  payAllButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  gradientButton: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  bookItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  bookAuthor: {
    color: "#A1A1AA",
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
  },
  bookActions: {
    flexDirection: "row",
    gap: 12,
  },
  emptyText: {
    color: "#757575",
    paddingVertical: 8,
    textAlign: "center",
  },
});

export default PaymentScreen;
