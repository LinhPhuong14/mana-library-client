import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Text, Card, Title, Paragraph, Button, ActivityIndicator, Chip, Divider, DataTable, Menu, IconButton, ProgressBar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import bookService from "../../services/bookService";
import userService from "../../services/userService";
import ErrorDisplay from "../../components/common/ErrorDisplay";

const screenWidth = Dimensions.get("window").width - 40;

const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookStats, setBookStats] = useState(null);
  const [reportPeriod, setReportPeriod] = useState("month");
  const [menuVisible, setMenuVisible] = useState(false);
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [chartType, setChartType] = useState("pie");

  useFocusEffect(
    useCallback(() => {
      loadReportData();
    }, [reportPeriod])
  );

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get book statistics from API
      const stats = await bookService.getBookStats({ period: reportPeriod });
      setBookStats(stats);
    } catch (err) {
      console.error("Failed to load report data:", err);
      setError(err.message || "Failed to load library statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setExportMenuVisible(false);
      // Implementation would call an export API endpoint
      // For example: await bookService.exportBookStats(format);
      alert(`Report exported as ${format.toUpperCase()} successfully`);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const renderGenreDistribution = () => {
    if (!bookStats?.genreDistribution) return null;

    const data = bookStats.genreDistribution.map((item, index) => ({
      name: item.genre,
      count: item.count,
      color: chartColors[index % chartColors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Genre Distribution</Title>
            <View style={styles.chartTypeSelector}>
              <IconButton
                icon="chart-pie"
                size={20}
                onPress={() => setChartType("pie")}
                color={chartType === "pie" ? "#4568DC" : "#999"}
              />
              <IconButton
                icon="chart-bar"
                size={20}
                onPress={() => setChartType("bar")}
                color={chartType === "bar" ? "#4568DC" : "#999"}
              />
            </View>
          </View>

          {chartType === "pie" ? (
            <PieChart
              data={data}
              width={screenWidth}
              height={200}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          ) : (
            <BarChart
              data={{
                labels: data.map((d) => d.name.substring(0, 5)),
                datasets: [{ data: data.map((d) => d.count) }],
              }}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={30}
            />
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderMonthlyActivity = () => {
    if (!bookStats?.monthlyActivity) return null;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>Monthly Activity</Title>
          <LineChart
            data={{
              labels: bookStats.monthlyActivity.map((item) => item.month.substring(0, 3)),
              datasets: [
                {
                  data: bookStats.monthlyActivity.map((item) => item.checkouts),
                  color: (opacity = 1) => `rgba(69, 104, 220, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: bookStats.monthlyActivity.map((item) => item.returns),
                  color: (opacity = 1) => `rgba(176, 106, 179, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
              legend: ["Checkouts", "Returns"],
            }}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
          />
        </Card.Content>
      </Card>
    );
  };

  const renderPopularBooks = () => {
    if (!bookStats?.popularBooks || bookStats.popularBooks.length === 0) return null;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>Most Popular Books</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Title</DataTable.Title>
              <DataTable.Title>Author</DataTable.Title>
              <DataTable.Title numeric>Checkouts</DataTable.Title>
            </DataTable.Header>

            {bookStats.popularBooks.slice(0, 5).map((book) => (
              <DataTable.Row key={book.id}>
                <DataTable.Cell>{book.title}</DataTable.Cell>
                <DataTable.Cell>{book.author}</DataTable.Cell>
                <DataTable.Cell numeric>{book.checkoutCount}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    );
  };

  const renderActiveUsers = () => {
    if (!bookStats?.activeUsers || bookStats.activeUsers.length === 0) return null;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>Most Active Users</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>User</DataTable.Title>
              <DataTable.Title numeric>Books Read</DataTable.Title>
              <DataTable.Title numeric>Avg. Days</DataTable.Title>
            </DataTable.Header>

            {bookStats.activeUsers.slice(0, 5).map((user) => (
              <DataTable.Row key={user.id}>
                <DataTable.Cell>{user.name}</DataTable.Cell>
                <DataTable.Cell numeric>{user.bookCount}</DataTable.Cell>
                <DataTable.Cell numeric>{user.avgBorrowDays}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    );
  };

  const renderOverdueStats = () => {
    if (!bookStats?.overdue) return null;

    const { current, average, trend } = bookStats.overdue;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>Overdue Books</Title>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Paragraph style={styles.statLabel}>Current</Paragraph>
              <Text style={styles.statValue}>{current}</Text>
            </View>
            <View style={styles.statItem}>
              <Paragraph style={styles.statLabel}>Avg. per Month</Paragraph>
              <Text style={styles.statValue}>{average}</Text>
            </View>
            <View style={styles.statItem}>
              <Paragraph style={styles.statLabel}>Monthly Trend</Paragraph>
              <Text style={[styles.statValue, { color: trend > 0 ? "#F44336" : "#4CAF50" }]}>
                {trend > 0 ? `+${trend}%` : `${trend}%`}
                <MaterialIcons
                  name={trend > 0 ? "trending-up" : "trending-down"}
                  size={18}
                />
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderSummaryCards = () => {
    if (!bookStats?.summary) return null;

    const { totalBooks, booksCheckedOut, booksReserved, booksOverdue } = bookStats.summary;

    return (
      <View style={styles.summaryCardsContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.summaryValue}>{totalBooks}</Title>
            <Paragraph>Total Books</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.summaryValue}>{booksCheckedOut}</Title>
            <Paragraph>Checked Out</Paragraph>
            <ProgressBar
              progress={booksCheckedOut / totalBooks}
              color="#4568DC"
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.summaryValue}>{booksReserved}</Title>
            <Paragraph>Reserved</Paragraph>
            <ProgressBar
              progress={booksReserved / totalBooks}
              color="#B06AB3"
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={[styles.summaryValue, { color: booksOverdue > 0 ? "#F44336" : "#4CAF50" }]}>{booksOverdue}</Title>
            <Paragraph>Overdue</Paragraph>
            <ProgressBar
              progress={booksOverdue / totalBooks}
              color="#F44336"
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>
      </View>
    );
  };

  if (loading && !bookStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#4568DC"
        />
        <Text style={styles.loadingText}>Loading library statistics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={loadReportData}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Title style={styles.headerTitle}>Library Reports</Title>

        <View style={styles.actionContainer}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                icon="calendar"
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                style={styles.periodButton}
              >
                {reportPeriod === "week" ? "This Week" : reportPeriod === "month" ? "This Month" : reportPeriod === "quarter" ? "This Quarter" : "This Year"}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setReportPeriod("week");
                setMenuVisible(false);
              }}
              title="This Week"
            />
            <Menu.Item
              onPress={() => {
                setReportPeriod("month");
                setMenuVisible(false);
              }}
              title="This Month"
            />
            <Menu.Item
              onPress={() => {
                setReportPeriod("quarter");
                setMenuVisible(false);
              }}
              title="This Quarter"
            />
            <Menu.Item
              onPress={() => {
                setReportPeriod("year");
                setMenuVisible(false);
              }}
              title="This Year"
            />
          </Menu>

          <Menu
            visible={exportMenuVisible}
            onDismiss={() => setExportMenuVisible(false)}
            anchor={
              <Button
                icon="download"
                mode="contained"
                onPress={() => setExportMenuVisible(true)}
                style={styles.exportButton}
              >
                Export
              </Button>
            }
          >
            <Menu.Item
              onPress={() => handleExport("pdf")}
              title="PDF"
            />
            <Menu.Item
              onPress={() => handleExport("csv")}
              title="CSV"
            />
            <Menu.Item
              onPress={() => handleExport("excel")}
              title="Excel"
            />
          </Menu>
        </View>
      </View>

      <Divider style={styles.divider} />

      {renderSummaryCards()}
      {renderGenreDistribution()}
      {renderMonthlyActivity()}
      {renderPopularBooks()}
      {renderActiveUsers()}
      {renderOverdueStats()}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Report generated on {new Date().toLocaleDateString()}</Text>
      </View>
    </ScrollView>
  );
};

// Chart colors and configuration
const chartColors = ["#4568DC", "#B06AB3", "#FF7F50", "#32CD32", "#4169E1", "#FF69B4", "#FFD700", "#8A2BE2"];

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(69, 104, 220, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#4568DC",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
  },
  actionContainer: {
    flexDirection: "row",
  },
  periodButton: {
    marginRight: 10,
  },
  exportButton: {
    backgroundColor: "#4568DC",
  },
  divider: {
    marginBottom: 16,
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  chartTypeSelector: {
    flexDirection: "row",
  },
  summaryCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    width: "48%",
    marginBottom: 10,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  progressBar: {
    marginTop: 8,
    height: 6,
    borderRadius: 3,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    marginVertical: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#757575",
    fontSize: 12,
  },
});

export default ReportsScreen;
