"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { TextInput, Button, Text, HelperText, useTheme, IconButton } from "react-native-paper"
import { useNavigation, useRoute } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, { FadeIn } from "react-native-reanimated"

const AddBookManualScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const theme = useTheme()
  const editBook = route.params?.book

  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [isbn, setIsbn] = useState("")
  const [category, setCategory] = useState("")
  const [publisher, setPublisher] = useState("")
  const [publishYear, setPublishYear] = useState("")
  const [pages, setPages] = useState("")
  const [description, setDescription] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [totalCopies, setTotalCopies] = useState("")
  const [availableCopies, setAvailableCopies] = useState("")

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editBook) {
      setTitle(editBook.title || "")
      setAuthor(editBook.author || "")
      setIsbn(editBook.isbn || "")
      setCategory(editBook.category || "")
      setPublisher(editBook.publisher || "")
      setPublishYear(editBook.publishYear || "")
      setPages(editBook.pages || "")
      setDescription(editBook.description || "")
      setCoverUrl(editBook.coverUrl || "")
      setTotalCopies(editBook.total?.toString() || "")
      setAvailableCopies(editBook.available?.toString() || "")
    }
  }, [editBook])

  const validate = () => {
    const newErrors = {}

    if (!title.trim()) newErrors.title = "Title is required"
    if (!author.trim()) newErrors.author = "Author is required"
    if (!isbn.trim()) newErrors.isbn = "ISBN is required"
    else if (!/^[0-9-]{10,17}$/.test(isbn)) newErrors.isbn = "Invalid ISBN format"
    if (!category.trim()) newErrors.category = "Category is required"

    if (!totalCopies.trim()) newErrors.totalCopies = "Total copies is required"
    else if (!/^\d+$/.test(totalCopies)) newErrors.totalCopies = "Must be a number"

    if (!availableCopies.trim()) newErrors.availableCopies = "Available copies is required"
    else if (!/^\d+$/.test(availableCopies)) newErrors.availableCopies = "Must be a number"
    else if (Number.parseInt(availableCopies) > Number.parseInt(totalCopies))
      newErrors.availableCopies = "Cannot exceed total copies"

    if (publishYear && !/^\d{4}$/.test(publishYear)) {
      newErrors.publishYear = "Invalid year format"
    }

    if (pages && !/^\d+$/.test(pages)) {
      newErrors.pages = "Must be a number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      navigation.goBack()
    }, 1000)
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton icon="arrow-left" iconColor="#ffffff" size={24} onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>{editBook ? "Edit Book" : "Add New Book"}</Text>
          {editBook && (
            <IconButton
              icon="delete"
              iconColor="#ff4d4d"
              size={24}
              onPress={() => {
                // Handle delete
                navigation.goBack()
              }}
            />
          )}
          {!editBook && <View style={{ width: 40 }} />}
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View entering={FadeIn.duration(500)} style={styles.formContainer}>
            <TextInput
              label="Title *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              error={!!errors.title}
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 8 }}
              outlineColor="#333333"
              activeOutlineColor="#4a6fff"
              textColor="#ffffff"
            />
            {errors.title && (
              <HelperText type="error" style={styles.errorText}>
                {errors.title}
              </HelperText>
            )}

            <TextInput
              label="Author *"
              value={author}
              onChangeText={setAuthor}
              mode="outlined"
              style={styles.input}
              error={!!errors.author}
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 8 }}
              outlineColor="#333333"
              activeOutlineColor="#4a6fff"
              textColor="#ffffff"
            />
            {errors.author && (
              <HelperText type="error" style={styles.errorText}>
                {errors.author}
              </HelperText>
            )}

            <TextInput
              label="ISBN *"
              value={isbn}
              onChangeText={setIsbn}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              error={!!errors.isbn}
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 8 }}
              outlineColor="#333333"
              activeOutlineColor="#4a6fff"
              textColor="#ffffff"
            />
            {errors.isbn && (
              <HelperText type="error" style={styles.errorText}>
                {errors.isbn}
              </HelperText>
            )}

            <TextInput
              label="Category *"
              value={category}
              onChangeText={setCategory}
              mode="outlined"
              style={styles.input}
              error={!!errors.category}
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 8 }}
              outlineColor="#333333"
              activeOutlineColor="#4a6fff"
              textColor="#ffffff"
            />
            {errors.category && (
              <HelperText type="error" style={styles.errorText}>
                {errors.category}
              </HelperText>
            )}

            <View style={styles.row}>
              <TextInput
                label="Total Copies *"
                value={totalCopies}
                onChangeText={setTotalCopies}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                error={!!errors.totalCopies}
                outlineStyle={styles.inputOutline}
                theme={{ roundness: 8 }}
                outlineColor="#333333"
                activeOutlineColor="#4a6fff"
                textColor="#ffffff"
              />

              <TextInput
                label="Available *"
                value={availableCopies}
                onChangeText={setAvailableCopies}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                error={!!errors.availableCopies}
                outlineStyle={styles.inputOutline}
                theme={{ roundness: 8 }}
                outlineColor="#333333"
                activeOutlineColor="#4a6fff"
                textColor="#ffffff"
              />
            </View>

            {errors.totalCopies && (
              <HelperText type="error" style={styles.errorText}>
                {errors.totalCopies}
              </HelperText>
            )}
            {errors.availableCopies && (
              <HelperText type="error" style={styles.errorText}>
                {errors.availableCopies}
              </HelperText>
            )}

            <TextInput
              label="Publisher"
              value={publisher}
              onChangeText={setPublisher}
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 8 }}
              outlineColor="#333333"
              activeOutlineColor="#4a6fff"
              textColor="#ffffff"
            />

            <View style={styles.row}>
              <TextInput
                label="Publish Year"
                value={publishYear}
                onChangeText={setPublishYear}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                error={!!errors.publishYear}
                outlineStyle={styles.inputOutline}
                theme={{ roundness: 8 }}
                outlineColor="#333333"
                activeOutlineColor="#4a6fff"
                textColor="#ffffff"
              />

              <TextInput
                label="Pages"
                value={pages}
                onChangeText={setPages}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                error={!!errors.pages}
                outlineStyle={styles.inputOutline}
                theme={{ roundness: 8 }}
                outlineColor="#333333"
                activeOutlineColor="#4a6fff"
                textColor="#ffffff"
              />
            </View>

            {errors.publishYear && (
              <HelperText type="error" style={styles.errorText}>
                {errors.publishYear}
              </HelperText>
            )}
            {errors.pages && (
              <HelperText type="error" style={styles.errorText}>
                {errors.pages}
              </HelperText>
            )}

            <TextInput
              label="Cover URL"
              value={coverUrl}
              onChangeText={setCoverUrl}
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 8 }}
              outlineColor="#333333"
              activeOutlineColor="#4a6fff"
              textColor="#ffffff"
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
              outlineStyle={styles.inputOutline}
              theme={{ roundness: 8 }}
              outlineColor="#333333"
              activeOutlineColor="#4a6fff"
              textColor="#ffffff"
            />

            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              loading={loading}
              disabled={loading}
              buttonColor="#4a6fff"
            >
              {editBook ? "Update Book" : "Add Book"}
            </Button>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formContainer: {
    width: "100%",
  },
  input: {
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  textArea: {
    height: 100,
  },
  inputOutline: {
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  errorText: {
    color: "#ff4d4d",
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
    paddingVertical: 6,
  },
})

export default AddBookManualScreen


