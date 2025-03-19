import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import DateTimePicker from "@react-native-community/datetimepicker";

const UserDetailScreen = ({ navigation, route }) => {
  const { user, isEditing, isViewing, isAdding } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: user?.id || "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "Student",
    memberSince: user?.memberSince || new Date().toISOString().split("T")[0],
    status: user?.status || "active",
    booksCheckedOut: user?.booksCheckedOut || 0,
    fines: user?.fines || "$0.00",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zipCode: user?.zipCode || "",
    notes: user?.notes || "",
    studentId: user?.studentId || "",
    canBorrowBooks: user?.canBorrowBooks !== false,
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const ROLES = ["Student", "Teacher", "Staff", "Admin"];
  const STATUS_OPTIONS = ["active", "inactive", "restricted", "pending"];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when field is edited
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (formData.role === "Student" && !formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form.");
      return;
    }

    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      if (isAdding) {
        Alert.alert("Success", "User created successfully", [{ text: "OK", onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert("Success", "User updated successfully", [{ text: "OK", onPress: () => navigation.goBack() }]);
      }
    }, 1500);
  };

  const handleResetPassword = () => {
    Alert.alert("Reset Password", "Are you sure you want to reset the password for this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          setLoading(true);
          // Simulate API call
          setTimeout(() => {
            setLoading(false);
            Alert.alert("Success", "Password reset email has been sent to the user.");
          }, 1500);
        },
      },
    ]);
  };

  const handleChangeStatus = (status) => {
    Alert.alert(`Change Status to ${status.charAt(0).toUpperCase() + status.slice(1)}`, `Are you sure you want to change the user's status to ${status}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Change",
        onPress: () => {
          handleInputChange("status", status);
        },
      },
    ]);
  };

  const handleManageLoans = () => {
    // Alert.alert("Manage Loans", "This would navigate to a screen to manage this user's book loans.", [{ text: "OK" }]);
    // navigate to ManageLoansScreen
    navigation.navigate("ManageLoans", { user: formData });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      handleInputChange("memberSince", formattedDate);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#22c55e"; // green
      case "inactive":
        return "#757575"; // gray
      case "restricted":
        return "#f97316"; // orange
      case "pending":
        return "#3b82f6"; // blue
      default:
        return "#ef4444"; // red
    }
  };

  const renderReadOnlyField = (label, value, icon) => (
    <View style={styles.readOnlyField}>
      <View style={styles.readOnlyIcon}>{icon}</View>
      <View>
        <Text style={styles.readOnlyLabel}>{label}</Text>
        <Text style={styles.readOnlyValue}>{value}</Text>
      </View>
    </View>
  );

  const isEditMode = isEditing || isAdding;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isAdding ? "Add User" : isEditing ? "Edit User" : "User Details"}</Text>
        {!isAdding && !isEditing && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.setParams({ isEditing: true, isViewing: false })}
          >
            <Ionicons
              name="create-outline"
              size={24}
              color="#B06AB3"
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* User Avatar (placeholder) */}
        {!isAdding && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {formData.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(formData.status) }]}>
              <Text style={styles.statusText}>{formData.status}</Text>
            </View>
          </View>
        )}

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {isEditMode ? (
            <>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
                placeholder="Enter full name"
                placeholderTextColor="#757575"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                placeholder="Enter email address"
                placeholderTextColor="#757575"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                placeholder="Enter phone number"
                placeholderTextColor="#757575"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Role</Text>
              <View style={styles.pickerContainer}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.pickerOption, formData.role === role && styles.selectedOption]}
                    onPress={() => handleInputChange("role", role)}
                  >
                    <Text style={formData.role === role ? styles.selectedOptionText : styles.optionText}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {formData.role === "Student" && (
                <>
                  <Text style={styles.label}>Student ID</Text>
                  <TextInput
                    style={[styles.input, errors.studentId && styles.inputError]}
                    value={formData.studentId}
                    onChangeText={(text) => handleInputChange("studentId", text)}
                    placeholder="Enter student ID"
                    placeholderTextColor="#757575"
                  />
                  {errors.studentId && <Text style={styles.errorText}>{errors.studentId}</Text>}
                </>
              )}

              <Text style={styles.label}>Member Since</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateInputText}>{formData.memberSince}</Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#B06AB3"
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(formData.memberSince)}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {!isAdding && (
                <>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.pickerContainer}>
                    {STATUS_OPTIONS.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[styles.pickerOption, formData.status === status && { backgroundColor: getStatusColor(status) }]}
                        onPress={() => handleChangeStatus(status)}
                      >
                        <Text style={formData.status === status ? styles.selectedOptionText : styles.optionText}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Can Borrow Books</Text>
                <Switch
                  value={formData.canBorrowBooks}
                  onValueChange={(value) => handleInputChange("canBorrowBooks", value)}
                  trackColor={{ false: "#2A2A2A", true: "#4568DC" }}
                  thumbColor={formData.canBorrowBooks ? "#B06AB3" : "#FFFFFF"}
                />
              </View>
            </>
          ) : (
            <>
              {renderReadOnlyField(
                "Name",
                formData.name,
                <Ionicons
                  name="person"
                  size={20}
                  color="#B06AB3"
                />
              )}

              {renderReadOnlyField(
                "Email",
                formData.email,
                <Ionicons
                  name="mail"
                  size={20}
                  color="#B06AB3"
                />
              )}

              {formData.phone &&
                renderReadOnlyField(
                  "Phone",
                  formData.phone,
                  <Ionicons
                    name="call"
                    size={20}
                    color="#B06AB3"
                  />
                )}

              {renderReadOnlyField(
                "Role",
                formData.role,
                <Ionicons
                  name="briefcase"
                  size={20}
                  color="#B06AB3"
                />
              )}

              {formData.role === "Student" &&
                formData.studentId &&
                renderReadOnlyField(
                  "Student ID",
                  formData.studentId,
                  <FontAwesome5
                    name="id-card"
                    size={20}
                    color="#B06AB3"
                  />
                )}

              {renderReadOnlyField(
                "Member Since",
                formData.memberSince,
                <Ionicons
                  name="calendar"
                  size={20}
                  color="#B06AB3"
                />
              )}

              {renderReadOnlyField(
                "Borrowing Privileges",
                formData.canBorrowBooks ? "Allowed" : "Not Allowed",
                <MaterialIcons
                  name={formData.canBorrowBooks ? "check-circle" : "cancel"}
                  size={20}
                  color={formData.canBorrowBooks ? "#22c55e" : "#ef4444"}
                />
              )}
            </>
          )}
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>

          {isEditMode ? (
            <>
              <Text style={styles.label}>Street Address</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => handleInputChange("address", text)}
                placeholder="Enter street address"
                placeholderTextColor="#757575"
              />

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.city}
                    onChangeText={(text) => handleInputChange("city", text)}
                    placeholder="City"
                    placeholderTextColor="#757575"
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>State</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.state}
                    onChangeText={(text) => handleInputChange("state", text)}
                    placeholder="State"
                    placeholderTextColor="#757575"
                  />
                </View>
              </View>

              <Text style={styles.label}>Zip Code</Text>
              <TextInput
                style={styles.input}
                value={formData.zipCode}
                onChangeText={(text) => handleInputChange("zipCode", text)}
                placeholder="Enter zip code"
                placeholderTextColor="#757575"
                keyboardType="numeric"
              />
            </>
          ) : formData.address ? (
            <>
              {renderReadOnlyField(
                "Address",
                formData.address,
                <Ionicons
                  name="home"
                  size={20}
                  color="#B06AB3"
                />
              )}
              {formData.city &&
                formData.state &&
                renderReadOnlyField(
                  "City, State",
                  `${formData.city}, ${formData.state} ${formData.zipCode}`,
                  <Ionicons
                    name="location"
                    size={20}
                    color="#B06AB3"
                  />
                )}
            </>
          ) : (
            <Text style={styles.noDataText}>No address information provided</Text>
          )}
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          {isEditMode ? (
            <>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => handleInputChange("notes", text)}
                placeholder="Enter any additional notes"
                placeholderTextColor="#757575"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </>
          ) : (
            <>
              {!isAdding && (
                <>
                  {renderReadOnlyField(
                    "Books Checked Out",
                    formData.booksCheckedOut.toString(),
                    <Ionicons
                      name="book"
                      size={20}
                      color="#B06AB3"
                    />
                  )}

                  {formData.fines !== "$0.00" &&
                    renderReadOnlyField(
                      "Outstanding Fines",
                      formData.fines,
                      <MaterialIcons
                        name="attach-money"
                        size={20}
                        color="#ef4444"
                      />
                    )}

                  {formData.notes ? (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{formData.notes}</Text>
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>No additional notes</Text>
                  )}
                </>
              )}
            </>
          )}
        </View>

        {/* Action Buttons */}
        {isEditMode ? (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              <LinearGradient
                colors={["#4568DC", "#B06AB3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                {saving ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text style={styles.saveButtonText}>{isAdding ? "Create User" : "Save Changes"}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                if (isAdding) {
                  navigation.goBack();
                } else {
                  navigation.setParams({ isEditing: false, isViewing: true });
                }
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtonsContainer}>
            {!isAdding && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleManageLoans}
                >
                  <LinearGradient
                    colors={["#4568DC", "#B06AB3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionGradient}
                  >
                    <Text style={styles.actionButtonText}>
                      <Ionicons
                        name="book-outline"
                        size={16}
                        color="#FFFFFF"
                      />{" "}
                      Manage Loans
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resetPasswordButton}
                  onPress={handleResetPassword}
                >
                  <Text style={styles.resetPasswordText}>
                    <Ionicons
                      name="key-outline"
                      size={16}
                      color="#4568DC"
                    />{" "}
                    Reset Password
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            size="large"
            color="#B06AB3"
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4568DC",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    position: "absolute",
    bottom: -10,
    backgroundColor: "#22c55e",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B06AB3",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    marginBottom: 16,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: -12,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: "#2A2A2A",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#4568DC",
  },
  optionText: {
    color: "#FFFFFF",
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  dateInput: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateInputText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  readOnlyField: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  readOnlyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  readOnlyLabel: {
    fontSize: 14,
    color: "#757575",
  },
  readOnlyValue: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 2,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 16,
    color: "#FFFFFF",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
  },
  noDataText: {
    fontStyle: "italic",
    color: "#757575",
    marginTop: 4,
  },
  actionButtonsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  saveButton: {
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 16,
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#757575",
    fontSize: 16,
  },
  actionButton: {
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 16,
  },
  actionGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  resetPasswordButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  resetPasswordText: {
    color: "#4568DC",
    fontSize: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UserDetailScreen;
