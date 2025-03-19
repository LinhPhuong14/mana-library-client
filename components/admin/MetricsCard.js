"use client"
import { View, StyleSheet } from "react-native"
import { Surface, Text, useTheme } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Animated, { FadeInUp } from "react-native-reanimated"

const MetricsCard = ({ title, value, icon, color, subtitle, index = 0 }) => {
  const theme = useTheme()

  //
  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)} style={styles.container}>
      <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: color + "20" }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
          </View>
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.value, { color: theme.colors.text }]} numberOfLines={1}>
            {value}
          </Text>
          <Text style={[styles.title, { color: theme.colors.text + "CC" }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.text + "99" }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </Surface>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
  },
  surface: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
})

export default MetricsCard

