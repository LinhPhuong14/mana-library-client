
"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, Dimensions } from "react-native"
import { Appbar, Title, Text, Button, useTheme, Surface } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { VictoryPie, VictoryChart, VictoryLine, VictoryTheme, VictoryAxis } from "victory-native"
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated"
import MetricsCard from "../../components/admin/MetricsCard"

const SystemMetricScreen = () => {
  const navigation = useNavigation()
  const theme = useTheme()
  const screenWidth = Dimensions.get("window").width

  // Mock data
  const [metrics, setMetrics] = useState({
    totalBooks: 1245,
    availableBooks: 987,
    borrowedBooks: 258,
    totalUsers: 342,
    activeUsers: 289,
    overdueBooks: 17,
  })

  const [timeRange, setTimeRange] = useState("week") // 'week', 'month', 'year'

  const borrowingData = {
    week: [
      { x: "T2", y: 5 },
      { x: "T3", y: 8 },
      { x: "T4", y: 12 },
      { x: "T5", y: 7 },
      { x: "T6", y: 10 },
      { x: "T7", y: 15 },
      { x: "CN", y: 6 },
    ],
    month: [
      { x: "Tuần 1", y: 32 },
      { x: "Tuần 2", y: 45 },
      { x: "Tuần 3", y: 37 },
      { x: "Tuần 4", y: 41 },
    ],
    year: [
      { x: "T1", y: 65 },
      { x: "T2", y: 59 },
      { x: "T3", y: 80 },
      { x: "T4", y: 81 },
      { x: "T5", y: 56 },
      { x: "T6", y: 55 },
      { x: "T7", y: 40 },
      { x: "T8", y: 60 },
      { x: "T9", y: 70 },
      { x: "T10", y: 45 },
      { x: "T11", y: 55 },
      { x: "T12", y: 60 },
    ],
  }

  const categoryData = [
    { x: "Văn học", y: 35 },
    { x: "Khoa học", y: 25 },
    { x: "Kinh tế", y: 15 },
    { x: "Kỹ năng", y: 20 },
    { x: "Khác", y: 5 },
  ]

  const colorScale = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <StatusBar style={""} />

      <Appbar.Header style={[styles.header, { backgroundColor: theme.colors.surface }]} elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Thống kê hệ thống" titleStyle={styles.headerTitle} />
        <Appbar.Action
          icon="refresh"
          onPress={() => {
            // Refresh data
            console.log("Refreshing data")
          }}
          size={24}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.metricsContainer}>
          <View style={styles.row}>
            <MetricsCard
              title="Tổng số sách"
              value={metrics.totalBooks}
              icon="book"
              color={theme.colors.primary}
              index={0}
            />
            <MetricsCard
              title="Sách có sẵn"
              value={metrics.availableBooks}
              icon="book-open-variant"
              color={theme.colors.success}
              index={1}
            />
          </View>

          <View style={styles.row}>
            <MetricsCard
              title="Sách đang mượn"
              value={metrics.borrowedBooks}
              icon="book-account"
              color={theme.colors.warning}
              index={2}
            />
            <MetricsCard
              title="Sách quá hạn"
              value={metrics.overdueBooks}
              icon="alert-circle"
              color={theme.colors.error}
              index={3}
            />
          </View>

          <View style={styles.row}>
            <MetricsCard
              title="Tổng người dùng"
              value={metrics.totalUsers}
              icon="account-group"
              color="#9b59b6"
              index={4}
            />
            <MetricsCard
              title="Người dùng hoạt động"
              value={metrics.activeUsers}
              icon="account-check"
              color="#1abc9c"
              index={5}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={styles.chartHeader}>
              <Title style={styles.chartTitle}>Thống kê mượn sách</Title>
              <View style={styles.timeRangeButtons}>
                <Button
                  mode={timeRange === "week" ? "contained" : "outlined"}
                  onPress={() => setTimeRange("week")}
                  style={styles.timeButton}
                  compact
                >
                  Tuần
                </Button>
                <Button
                  mode={timeRange === "month" ? "contained" : "outlined"}
                  onPress={() => setTimeRange("month")}
                  style={styles.timeButton}
                  compact
                >
                  Tháng
                </Button>
                <Button
                  mode={timeRange === "year" ? "contained" : "outlined"}
                  onPress={() => setTimeRange("year")}
                  style={styles.timeButton}
                  compact
                >
                  Năm
                </Button>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <VictoryChart
                width={screenWidth - 40}
                height={220}
                theme={VictoryTheme.material}
                domainPadding={{ x: 20 }}
                padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              >
                <VictoryAxis
                  tickFormat={(t) => t}
                  style={{
                    axis: { stroke: theme.dark ? "#555" : "#ccc" },
                    tickLabels: {
                      fontSize: 10,
                      padding: 5,
                      fill: theme.colors.text,
                    },
                    grid: { stroke: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(t) => t}
                  style={{
                    axis: { stroke: theme.dark ? "#555" : "#ccc" },
                    tickLabels: {
                      fontSize: 10,
                      padding: 5,
                      fill: theme.colors.text,
                    },
                    grid: { stroke: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
                  }}
                />
                <VictoryLine
                  data={borrowingData[timeRange]}
                  style={{
                    data: { stroke: theme.colors.primary, strokeWidth: 3 },
                  }}
                  animate={{
                    duration: 500,
                    onLoad: { duration: 500 },
                  }}
                />
              </VictoryChart>
            </View>
          </Surface>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <Title style={styles.chartTitle}>Phân loại sách</Title>
            <View style={styles.chartContainer}>
              <VictoryPie
                data={categoryData}
                width={screenWidth - 40}
                height={220}
                colorScale={colorScale}
                innerRadius={30}
                labelRadius={({ innerRadius }) => innerRadius + 30}
                style={{
                  labels: {
                    fontSize: 12,
                    fill: theme.colors.text,
                    fontWeight: "bold",
                  },
                }}
                animate={{
                  duration: 500,
                  onLoad: { duration: 500 },
                }}
              />
            </View>
            <View style={styles.legendContainer}>
              {categoryData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colorScale[index] }]} />
                  <Text style={[styles.legendText, { color: theme.colors.text }]}>
                    {item.x}: {item.y}%
                  </Text>
                </View>
              ))}
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
    paddingBottom: 20,
  },
  metricsContainer: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  timeRangeButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  timeButton: {
    marginHorizontal: 4,
    borderRadius: 20,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
  footer: {
    height: 20,
  },
})

export default SystemMetricScreen

