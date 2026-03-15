import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Button } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";

const BARANGAYS = [
  "Aldezar",
  "Alteza",
  "Anib",
  "Awayan",
  "Azucena",
  "Bagong Sirang",
  "Binahian",
  "Bolo Norte",
  "Bolo Sur",
  "Bulan",
  "Bulawan",
  "Cabuyao",
  "Caima",
  "Calagbangan",
  "Calampinay",
  "Carayrayan",
  "Cotmo",
  "Gabi",
  "Gaongan",
  "Impig",
  "Lipilip",
  "Lubigan Jr.",
  "Lubigan Sr.",
  "Malaguico",
  "Malubago",
  "Manangle",
  "Mangapo",
  "Mangga",
  "Manlubang",
  "Mantila",
  "North Centro",
  "North Villazar",
  "Sagrada Familia",
  "Salanda",
  "Salvacion",
  "San Isidro",
  "San Vicente",
  "Serranzana",
  "South Centro",
  "South Villazar",
  "Taisan",
  "Tara",
  "Tible",
  "Tula-tula",
  "Vigaan",
  "Yabo",
];

export default function AddLivestockForm() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    animal_species: "",
    animal_unique_identifier: "",
    live_weight: "",
    purpose: "Slaughter",
    inspection_time_start: "",
    inspection_time_end: "",
    owner_name: "",
    owner_barangay: "",
    owner_city: "Sipocot",
    owner_province: "Camarines Sur",
    animal_origin_barangay: "",
    animal_origin_city: "Sipocot",
    animal_origin_province: "Camarines Sur",
    animal_destination: "Sipocot Abattoir Impig Sipocot - Camarines Sur",
    vehicle_used: "",
    paid_number: "",
    inspector_issued: "",
    remarks: "",
  });

  const [accountId, setAccountId] = useState(null);
  const [formId, setFormId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [currentTimeKey, setCurrentTimeKey] = useState("");
  const [loadingAccount, setLoadingAccount] = useState(true);

  const [urgent, setUrgent] = useState(false);
  const [showNewFormButton, setShowNewFormButton] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [dssClicked, setDssClicked] = useState(false);

  // Load account info
  useEffect(() => {
    const loadAccountInfo = async () => {
      try {
        const [storedId, firstName, lastName] = await Promise.all([
          AsyncStorage.getItem("account_id"),
          AsyncStorage.getItem("first_name"),
          AsyncStorage.getItem("last_name"),
        ]);

        if (storedId) setAccountId(parseInt(storedId, 10));

        if (firstName && lastName) {
          setFormData((prev) => ({
            ...prev,
            inspector_issued: `${firstName} ${lastName}`,
          }));
        } else {
          console.warn("Inspector name not found in AsyncStorage.");
        }
      } catch (err) {
        console.error("Error loading account info:", err);
      } finally {
        setLoadingAccount(false);
      }
    };
    loadAccountInfo();
  }, []);

  const handleChange = (key, value) =>
    setFormData({ ...formData, [key]: value });

  const openTimePicker = (key) => {
    setCurrentTimeKey(key);
    setTimePickerVisible(true);
  };

  const handleTimeConfirm = (date) => {
    if (currentTimeKey) {
      const timeString = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setFormData({ ...formData, [currentTimeKey]: timeString });
      setTimePickerVisible(false);
      setCurrentTimeKey("");
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    for (let key in formData) {
      if (!formData[key] || formData[key].trim() === "") {
        Alert.alert(
          "Error",
          `Please fill the field: ${key.replace(/_/g, " ")}`
        );
        return;
      }
    }

    if (!accountId) return Alert.alert("Error", "Account ID not retrieved.");

    try {
      const payload = {
        account_id: accountId,
        inspector: formData.inspector_issued,
        inspection_time_start: formData.inspection_time_start,
        inspection_time_end: formData.inspection_time_end,
        animals: [
          {
            animal_species: formData.animal_species,
            animal_unique_identifier: formData.animal_unique_identifier,
            live_weight: formData.live_weight,
            purpose: formData.purpose,
            owner_name: formData.owner_name,
            owner_address: `${formData.owner_barangay}, ${formData.owner_city}, ${formData.owner_province}`,
            animal_origin: `${formData.animal_origin_barangay}, ${formData.animal_origin_city}, ${formData.animal_origin_province}`,
            animal_destination: formData.animal_destination,
            vehicle_used: formData.vehicle_used,
            paid_number: formData.paid_number,
            inspector_issued: formData.inspector_issued,
            remarks: formData.remarks,
          },
        ],
      };

      console.log("Payload sent to API:", payload);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/create_form.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();
      console.log("Raw API Response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        throw new Error("Invalid JSON response from API.");
      }

      if (data.status === "success") {
        setQrValue(data.qr_code || "");
        setFormId(data.form_id);
        setSubmitted(true);
        Alert.alert("Success", "Form submitted successfully!");
      } else {
        Alert.alert("Submission Failed", data.message || "Unknown error.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      Alert.alert("Error", err.message || "Something went wrong.");
    }
  };

  const checkDSS = async () => {
    if (!formData.remarks || !formId) {
      return Alert.alert(
        "Error",
        "Please submit the form first and provide remarks."
      );
    }
    try {
      const response = await fetch(
        "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/check_suggestion.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remarks: formData.remarks, form_id: formId }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setSuggestions(data.matches || []);
        const isUrgent =
          data.severity_label === "Severe" || data.severity_score >= 0.6;
        setUrgent(isUrgent);
        setShowNewFormButton(true);
        setDssClicked(true);
        Alert.alert("DSS Checked", "DSS suggestions retrieved!");
      } else Alert.alert("Error", data.message || "No suggestions found.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to check DSS suggestions.");
    }
  };

  const resetForm = () => {
    setFormData((prev) => ({
      ...prev,
      animal_species: "",
      animal_unique_identifier: "",
      live_weight: "",
      purpose: "Slaughter",
      inspection_time_start: "",
      inspection_time_end: "",
      owner_name: "",
      owner_barangay: "",
      animal_origin_barangay: "",
      vehicle_used: "",
      paid_number: "",
      remarks: "",
    }));
    setFormId(null);
    setSuggestions([]);
    setQrValue("");
    setUrgent(false);
    setShowNewFormButton(false);
    setSubmitted(false);
    setDssClicked(false);
  };

  if (loadingAccount)
    return (
      <View style={styles.center}>
        <Text>Loading account information...</Text>
      </View>
    );

  const isEditable = !submitted;

  return (
    <ScrollView style={styles.container}>
      {/* Livestock Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Livestock Information</Text>
        <Text style={styles.label}>Animal Species</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.animal_species}
            onValueChange={(v) => handleChange("animal_species", v)}
            enabled={isEditable}
            style={styles.picker}
          >
            <Picker.Item label="Select Species" value="" />
            <Picker.Item label="Hog" value="Hog" />
            <Picker.Item label="Bovine" value="Bovine" />
            <Picker.Item label="Cattle" value="Cattle" />
          </Picker>
        </View>

        <Text style={styles.label}>Unique Identifier</Text>
        <TextInput
          style={styles.input}
          placeholder="Animal Unique Identifier"
          value={formData.animal_unique_identifier}
          editable={isEditable}
          onChangeText={(v) => handleChange("animal_unique_identifier", v)}
        />

        <Text style={styles.label}>Live Weight (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Live Weight"
          keyboardType="numeric"
          value={formData.live_weight}
          editable={isEditable}
          onChangeText={(v) => handleChange("live_weight", v)}
        />

        <Text style={styles.label}>Purpose</Text>
        <TextInput
          style={styles.input}
          placeholder="Purpose"
          value={formData.purpose}
          editable={isEditable}
          onChangeText={(v) => handleChange("purpose", v)}
        />

        <Text style={styles.label}>Inspection Start Time</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => isEditable && openTimePicker("inspection_time_start")}
        >
          <Text>{formData.inspection_time_start || "Select Time"}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Inspection End Time</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => isEditable && openTimePicker("inspection_time_end")}
        >
          <Text>{formData.inspection_time_end || "Select Time"}</Text>
        </TouchableOpacity>
      </View>

      {/* Owner & Origin Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Owner & Animal Origin</Text>

        <Text style={styles.label}>Owner Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Owner Name"
          value={formData.owner_name}
          editable={isEditable}
          onChangeText={(v) => handleChange("owner_name", v)}
        />

        <Text style={styles.label}>Owner Barangay</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.owner_barangay}
            onValueChange={(v) => handleChange("owner_barangay", v)}
            enabled={isEditable}
            style={styles.picker}
          >
            <Picker.Item label="Select Barangay" value="" />
            {BARANGAYS.map((b) => (
              <Picker.Item key={b} label={b} value={b} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Animal Origin Barangay</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.animal_origin_barangay}
            onValueChange={(v) => handleChange("animal_origin_barangay", v)}
            enabled={isEditable}
            style={styles.picker}
          >
            <Picker.Item label="Select Barangay" value="" />
            {BARANGAYS.map((b) => (
              <Picker.Item key={b} label={b} value={b} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Vehicle & Inspector Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Vehicle & Inspector</Text>

        <Text style={styles.label}>Vehicle Used</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.vehicle_used}
            onValueChange={(v) => handleChange("vehicle_used", v)}
            enabled={isEditable}
            style={styles.picker}
          >
            <Picker.Item label="Select Vehicle" value="" />
            <Picker.Item label="Jeep" value="Jeep" />
            <Picker.Item label="Hauler" value="Hauler" />
          </Picker>
        </View>

        <Text style={styles.label}>Paid Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Paid Number"
          value={formData.paid_number}
          editable={isEditable}
          onChangeText={(v) => handleChange("paid_number", v)}
        />

        <Text style={styles.label}>Inspector Issued</Text>
        <TextInput
          style={styles.input}
          placeholder="Inspector Issued"
          value={formData.inspector_issued}
          editable={false}
        />

        <Text style={styles.label}>Remarks</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          placeholder="Remarks"
          multiline
          value={formData.remarks}
          editable={isEditable}
          onChangeText={(v) => handleChange("remarks", v)}
        />
      </View>

      {/* Submit Buttons */}
      <View style={{ paddingHorizontal: 15, marginBottom: 10 }}>
        {!submitted && (
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            Submit Form
          </Button>
        )}

        {submitted && !dssClicked && (
          <Button
            mode="contained"
            onPress={checkDSS}
            style={[styles.submitButton, { backgroundColor: "#FF9800" }]}
          >
            Check DSS
          </Button>
        )}

        {urgent && (
          <Button
            mode="contained"
            style={[styles.submitButton, { backgroundColor: "red" }]}
            onPress={() =>
              navigation.navigate("appointment", {
                owner_name: formData.owner_name,
                eartag_number: formData.animal_unique_identifier,
                location: `${formData.owner_barangay}, ${formData.owner_city}`,
                form_id: formId,
              })
            }
          >
            Urgent Schedule
          </Button>
        )}

        {showNewFormButton && (
          <Button
            mode="contained"
            onPress={resetForm}
            style={[styles.submitButton, { backgroundColor: "#2196F3" }]}
          >
            Create New Form
          </Button>
        )}
      </View>

      {/* DSS Result */}
      {dssClicked && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>DSS Result</Text>
          {suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <View key={i} style={styles.suggestionItem}>
                <Text>Keyword: {s.keyword}</Text>
                <Text>Suggestion: {s.suggestion}</Text>
                <Text>
                  Match Strength: {(s.match_strength * 100).toFixed(1)}%
                </Text>
              </View>
            ))
          ) : (
            <Text>No matching symptoms found.</Text>
          )}
        </View>
      )}

      {/* QR Code */}
      {qrValue && (
        <View style={[styles.card, styles.qrContainer]}>
          <Text style={styles.sectionTitle}>QR Code</Text>
          <QRCode
            value={String(qrValue)}
            size={140}
            color="#2E7D32"
            backgroundColor="#fff"
          />
          <Text style={styles.qrExpiry}>Expires in 3 days</Text>
        </View>
      )}

      <DateTimePickerModal
        isVisible={timePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setTimePickerVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e8f5e9" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  label: { fontWeight: "bold", marginBottom: 5, color: "#2E7D32" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    width: "100%",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 10,
    width: "100%",
  },
  picker: { height: 50, width: "100%" },
  submitButton: {
    marginVertical: 8,
    backgroundColor: "#2E7D32",
    width: "100%",
  },
  qrContainer: { alignItems: "center" },
  qrExpiry: { fontSize: 12, color: "red", marginTop: 5 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  dssSeverity: { fontWeight: "bold", marginBottom: 8 },
  suggestionItem: { marginBottom: 5, paddingLeft: 5 },
});
