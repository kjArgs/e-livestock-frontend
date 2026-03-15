import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button, Card } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import FormDetailsModal from "../../components/FormDetailsModal";

export default function Stockyard() {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchForms();
  }, []);
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredForms(forms);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredForms(
        forms.filter(
          (f) =>
            f.owner_name.toLowerCase().includes(query) ||
            f.animal_unique_identifier.toLowerCase().includes(query) ||
            f.form_id.toString().includes(query)
        )
      );
    }
  }, [searchQuery, forms]);

  const fetchForms = async () => {
    try {
      const first_name = await AsyncStorage.getItem("first_name");
      const last_name = await AsyncStorage.getItem("last_name");
      if (!first_name || !last_name) return;

      const res = await fetch(
        "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_user_form.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ first_name, last_name }),
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        setForms(data.forms);
        setFilteredForms(data.forms);
      } else Alert.alert("Error", data.message || "No forms found.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch forms.");
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchForms();
  };

  const isQRExpired = (expirationDate, isExpiredFlag) => {
    if (typeof isExpiredFlag === "boolean") return isExpiredFlag;
    if (!expirationDate) return true;
    const expiry = new Date(expirationDate);
    return expiry <= new Date();
  };

  const goToAppointment = async (form) => {
    if (isQRExpired(form.qr_expiration, form.is_expired)) {
      Alert.alert(
        "QR Expired",
        "Your QR code has expired. Please request a new inspection form."
      );
      return;
    }

    await AsyncStorage.setItem("selected_form_id", form.form_id.toString());
    await AsyncStorage.setItem("selected_form_owner", form.owner_name);
    await AsyncStorage.setItem(
      "selected_form_eartag",
      form.animal_unique_identifier
    );
    await AsyncStorage.setItem("selected_form_address", form.owner_address);

    router.push("/appointment");
  };

  const openModal = (form) => {
    setSelectedForm(form);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search eartag"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredForms.length === 0 && (
          <Text style={styles.noFormsText}>No forms found.</Text>
        )}

        {filteredForms.map((item) => {
          const expired = isQRExpired(item.qr_expiration, item.is_expired);

          return (
            <Card key={item.form_id} style={styles.formCard}>
              <View style={styles.cardTopRow}>
                <Card.Content style={{ flex: 1 }}>
                  <Text style={styles.label}>Form ID: {item.form_id}</Text>
                  <Text style={styles.text}>
                    Eartag: {item.animal_unique_identifier}
                  </Text>
                  <Text style={styles.text}>Owner: {item.owner_name}</Text>
                  <Text style={styles.text}>Address: {item.owner_address}</Text>
                  {expired && (
                    <Text style={styles.expiredText}>
                      ❌ QR Expired – Please request a new form
                    </Text>
                  )}
                </Card.Content>

                <View style={styles.qrBox}>
                  <QRCode value={item.qr_code} size={80} />
                  <Text style={styles.qrLabel}>Scan Form</Text>
                </View>
              </View>

              <Card.Actions style={styles.buttonRow}>
                <Button
                  mode="contained"
                  onPress={() => openModal(item)}
                  style={[styles.button, { backgroundColor: "#2E7D32" }]}
                >
                  View Details
                </Button>
                {!expired && (
                  <Button
                    mode="contained"
                    onPress={() => goToAppointment(item)}
                    style={[styles.button, { backgroundColor: "#4CAF50" }]}
                  >
                    Create Schedule
                  </Button>
                )}
              </Card.Actions>
            </Card>
          );
        })}
      </ScrollView>

      <FormDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        form={selectedForm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e8f5e9", padding: 10 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    color: "#2E7D32",
  },
  searchBar: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    marginTop: 20,
    borderColor: "#2E7D32",
    borderWidth: 1,
    color: "#2E7D32",
  },
  noFormsText: { textAlign: "center", marginTop: 20, color: "#2E7D32" },
  formCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    paddingBottom: 10,
  },
  cardTopRow: { flexDirection: "row", alignItems: "center" },
  label: { fontWeight: "bold", marginBottom: 4, color: "#2E7D32" },
  text: { fontSize: 14, marginBottom: 2, color: "#4CAF50" },
  expiredText: { color: "red", fontWeight: "600", marginTop: 6 },
  buttonRow: { justifyContent: "space-between", marginTop: 10 },
  button: { flex: 1, marginHorizontal: 5 },
  qrBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2E7D32",
    marginRight: 5,
  },
  qrLabel: { fontSize: 12, color: "#2E7D32", fontWeight: "bold", marginTop: 4 },
});
