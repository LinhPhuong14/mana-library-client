import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { Text, Searchbar, Chip, Divider, ActivityIndicator, Button, FAB, Badge, Card, Title, Paragraph, IconButton, TabView, TabBar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import bookService from "../../services/bookService";
import userService from "../../services/userService";
import CirculationListItem from "../../components/books/CirculationListItem";
import EmptyState from "../../components/common/EmptyState";
import ErrorDisplay from "../../components/common/ErrorDisplay";

const CirculationScreen = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "checkouts", title: "Checkouts" },
    { key: "returns", title: "Returns" },
    { key: "reservations", title: "Reservations" },
    { key: "overdue", title: "Overdue" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutData, setCheckoutData] = useState([]);
  const [reservationData, setReservationData] = useState([]);
  const [overdueData, setOverdueData] = useState([]);
  const [recentReturns, setRecentReturns] = useState([]);

  const navigation = useNavigation();
  const route = useRoute();

  // Set initial tab if provided in navigation params
  useEffect(() => {
    if (route.params?.tab) {
      const tabIndex = routes.findIndex((route) => route.key === route.params.tab);
      if (tabIndex !== -1) {
        setIndex(tabIndex);
      }
    }
  }, [route.params]);

  // Load circulation data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCirculationData();
    }, [])
  );

  const loadCirculationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [checkouts, reservations, overdue, returns] = await Promise.all([
        bookService.getBorrowedBooks(),
        bookService.getReservedBooks(),
        bookService.getOverdueBooks(),
        bookService.getRecentReturns(),
      ]);

      setCheckoutData(checkouts);
      setReservationData(reservations);
      setOverdueData(overdue);
      setRecentReturns(returns);
    } catch (error) {
      console.error("Failed to load circulation data:", error);
      setError("Failed to load circulation data. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCirculationData();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCheckout = () => {
    navigation.navigate("BarcodeScanner", { mode: "checkout" });
  };

  const handleReturn = () => {
    navigation.navigate("BarcodeScanner", { mode: "return" });
  };

  const handleBookPress = (bookId) => {
    navigation.navigate("BookDetail", { bookId });
  };

  const handleUserPress = (userId) => {
    navigation.navigate("UserDetail", { userId });
  };

  const handleViewReservation = (reservationId) => {
    navigation.navigate("ReservationDetail", { reservationId });
  };

  const filterData = (data) => {
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.book.title.toLowerCase().includes(query) ||
        item.book.author.toLowerCase().includes(query) ||
        item.user.name.toLowerCase().includes(query) ||
        (item.book.isbn && item.book.isbn.includes(query))
    );
  };

  const renderCheckoutsTab = () => {
    const filteredCheckouts = filterData(checkoutData);

    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#4568DC"
          />
          <Text style={styles.loadingText}>Loading checkouts...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <ErrorDisplay
          error={error}
          onRetry={loadCirculationData}
        />
      );
    }

    if (filteredCheckouts.length === 0) {
      return (
        <EmptyState
          icon="book-arrow-right"
          message="No books checked out"
          description="All books are currently in the library"
          actionText="Check Out Book"
          onAction={handleCheckout}
        />
      );
    }

    return (
      <FlatList
        data={filteredCheckouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CirculationListItem
            title={item.book.title}
            subtitle={item.book.author}
            imageUrl={item.book.coverImage}
            primaryLabel="Due Date"
            primaryValue={new Date(item.dueDate).toLocaleDateString()}
            secondaryLabel="Borrowed By"
            secondaryValue={item.user.name}
            onPress={() => handleBookPress(item.book.id)}
            onUserPress={() => handleUserPress(item.user.id)}
            actionIcon="book-arrow-left"
            actionLabel="Return"
            onAction={() => handleReturn(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );
  };

  const renderReturnsTab = () => {
    const filteredReturns = filterData(recentReturns);

    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#4568DC"
          />
          <Text style={styles.loadingText}>Loading returns...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <ErrorDisplay
          error={error}
          onRetry={loadCirculationData}
        />
      );
    }

    if (filteredReturns.length === 0) {
      return (
        <EmptyState
          icon="book-arrow-left"
          message="No recent returns"
          description="No books have been returned recently"
        />
      );
    }

    return (
      <FlatList
        data={filteredReturns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CirculationListItem
            title={item.book.title}
            subtitle={item.book.author}
            imageUrl={item.book.coverImage}
            primaryLabel="Return Date"
            primaryValue={new Date(item.returnDate).toLocaleDateString()}
            secondaryLabel="Returned By"
            secondaryValue={item.user.name}
            onPress={() => handleBookPress(item.book.id)}
            onUserPress={() => handleUserPress(item.user.id)}
            status={item.condition}
            statusColor={item.condition === "good" ? "#4CAF50" : item.condition === "damaged" ? "#FFA000" : "#F44336"}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );
  };

  const renderReservationsTab = () => {
    const filteredReservations = filterData(reservationData);

    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#4568DC"
          />
          <Text style={styles.loadingText}>Loading reservations...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <ErrorDisplay
          error={error}
          onRetry={loadCirculationData}
        />
      );
    }

    if (filteredReservations.length === 0) {
      return (
        <EmptyState
          icon="book-clock"
          message="No active reservations"
          description="No books are currently reserved"
        />
      );
    }

    return (
      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CirculationListItem
            title={item.book.title}
            subtitle={item.book.author}
            imageUrl={item.book.coverImage}
            primaryLabel="Reserved Until"
            primaryValue={new Date(item.expiryDate).toLocaleDateString()}
            secondaryLabel="Reserved By"
            secondaryValue={item.user.name}
            onPress={() => handleBookPress(item.book.id)}
            onUserPress={() => handleUserPress(item.user.id)}
            actionIcon="eye"
            actionLabel="View"
            onAction={() => handleViewReservation(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );
  };

  const renderOverdueTab = () => {
    const filteredOverdue = filterData(overdueData);

    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#4568DC"
          />
          <Text style={styles.loadingText}>Loading overdue books...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <ErrorDisplay
          error={error}
          onRetry={loadCirculationData}
        />
      );
    }

    if (filteredOverdue.length === 0) {
      return (
        <EmptyState
          icon="check-circle"
          message="No overdue books"
          description="All borrowed books are within their due dates"
        />
      );
    }

    return (
      <FlatList
        data={filteredOverdue}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CirculationListItem
            title={item.book.title}
            subtitle={item.book.author}
            imageUrl={item.book.coverImage}
            primaryLabel="Due Date"
            primaryValue={new Date(item.dueDate).toLocaleDateString()}
            secondaryLabel="Borrowed By"
            secondaryValue={item.user.name}
            onPress={() => handleBookPress(item.book.id)}
            onUserPress={() => handleUserPress(item.user.id)}
            status={`${item.daysOverdue} days overdue`}
            statusColor="#F44336"
            actionIcon="book-arrow-left"
            actionLabel="Return"
            onAction={() => handleReturn(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );
  };

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "checkouts":
        return renderCheckoutsTab();
      case "returns":
        return renderReturnsTab();
      case "reservations":
        return renderReservationsTab();
      case "overdue":
        return renderOverdueTab();
      default:
        return null;
    }
  };

  const tabBarBadge = (key) => {
    switch (key) {
      case "checkouts":
        return checkoutData.length || null;
      case "reservations":
        return reservationData.length || null;
      case "overdue":
        return overdueData.length || null;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search circulation records"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 100 }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={styles.tabBar}
            indicatorStyle={styles.tabIndicator}
            activeColor="#4568DC"
            inactiveColor="#757575"
            renderBadge={({ route }) => {
              const count = tabBarBadge(route.key);
              return count ? <Badge style={styles.tabBadge}>{count}</Badge> : null;
            }}
          />
        )}
      />

      <FAB
        style={styles.fab}
        icon={index === 0 ? "book-arrow-right" : "book-arrow-left"}
        onPress={index === 0 ? handleCheckout : handleReturn}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    padding: 8,
  },
  searchBar: {
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: "#fff",
    elevation: 2,
  },
  tabIndicator: {
    backgroundColor: "#4568DC",
  },
  tabBadge: {
    backgroundColor: "#F44336",
    color: "white",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#4568DC",
  },
  sectionHeader: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    paddingLeft: 16,
  },
  sectionHeaderText: {
    fontWeight: "bold",
    color: "#555",
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  actionButton: {
    marginVertical: 8,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  metaContainer: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 12,
    color: "#757575",
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default CirculationScreen;
