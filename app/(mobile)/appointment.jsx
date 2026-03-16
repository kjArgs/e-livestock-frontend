import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Appointment() {
  const [formId, setFormId] = useState(null);
  const [ownerName, setOwnerName] = useState("");
  const [eartagNumber, setEartagNumber] = useState("");
  const [location, setLocation] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const [availableSlots, setAvailableSlots] = useState([]);

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Modal
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const router = useRouter();

  // Load stored form data
  useEffect(() => {
    const loadData = async () => {
      setFormId(parseInt(await AsyncStorage.getItem("selected_form_id"), 10));
      setOwnerName(await AsyncStorage.getItem("selected_form_owner"));
      setEartagNumber(await AsyncStorage.getItem("selected_form_eartag"));
      setLocation(await AsyncStorage.getItem("selected_form_address"));
      setExpirationDate(await AsyncStorage.getItem("selected_form_expiration"));
    };
    loadData();
  }, []);

  // Fetch slots when date changes
  useEffect(() => {
    fetchAvailableSlots();
  }, [date]);

  const fetchAvailableSlots = async () => {
    try {
      const today = new Date();
      const selectedDay = date.toISOString().split("T")[0];

      const res = await fetch(
        "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_appointments.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: selectedDay }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        let slots = data.available_slots;

        // ⏳ Filter out past time slots for today
        if (selectedDay === today.toISOString().split("T")[0]) {
          const currentHour = today.getHours();
          slots = slots.filter((slot) => {
            const slotHour = parseInt(slot[0].slice(0, 2));
            return slotHour >= currentHour;
          });
        }

        setAvailableSlots(slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to fetch slots.");
    }
  };

  // CONFIRM MODAL OPEN
  const openConfirmation = (slot) => {
    setSelectedSlot(slot);
    setConfirmVisible(true);
  };

  // SEND APPOINTMENT
  const bookSlot = async () => {
    setConfirmVisible(false);

    try {
      const res = await fetch(
        "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/create_appointments.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            form_id: formId,
            owner_name: ownerName,
            eartag_number: eartagNumber,
            location,
            date: date.toISOString().split("T")[0],
            start_time: selectedSlot[0],
            end_time: selectedSlot[1],
          }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        Alert.alert(
          "Appointment Created",
          `Status: ${data.auto_status}\nSeverity Level: ${
            data.severity_rating ?? "N/A"
          }`,
          [{ text: "OK", onPress: () => router.replace("/stockyard") }]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to create appointment");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error");
    }
  };

  // LIMIT DATE PICKER TO EXPIRATION DATE
  const minDate = new Date();
  const maxDate = expirationDate ? new Date(expirationDate) : new Date();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule Appointment</Text>

      {/* DATE PICKER */}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.dateBox}
      >
        <Text style={styles.dateText}>{date.toISOString().split("T")[0]}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          mode="date"
          value={date}
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* TIME + BUTTON */}
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>Available Time Slots</Text>
        <TouchableOpacity
          style={styles.scheduleBtn}
          onPress={fetchAvailableSlots}
        >
          <Text style={styles.scheduleBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* SLOTS */}
      <FlatList
        data={availableSlots}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.slotButton}
            onPress={() => openConfirmation(item)}
          >
            <Text style={styles.slotText}>
              {item[0].slice(0, 5)} - {item[1].slice(0, 5)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {availableSlots.length === 0 && (
        <Text style={styles.noSlots}>No slots available.</Text>
      )}

      {/* CONFIRMATION MODAL */}
      <Modal transparent visible={confirmVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={32}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={styles.blurBackdrop}
          />
          <View style={styles.modalTint} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Appointment?</Text>
            <Text style={styles.modalText}>
              {selectedSlot ? `${selectedSlot[0]} - ${selectedSlot[1]}` : ""}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#4CAF50" }]}
                onPress={bookSlot}
              >
                <Text style={styles.modalBtnText}>Confirm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#aaa" }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#F8FFF9" },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#2E7D32",
  },

  dateBox: {
    padding: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#A5D6A7",
    borderRadius: 10,
    marginBottom: 15,
  },

  dateText: {
    fontSize: 18,
    textAlign: "center",
    color: "#2E7D32",
    fontWeight: "600",
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },

  timeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  scheduleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },

  scheduleBtnText: { color: "#fff", fontWeight: "bold" },

  slotButton: {
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    marginBottom: 10,
  },

  slotText: { color: "#fff", fontSize: 16, textAlign: "center" },

  noSlots: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blurBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  modalBox: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },

  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
  },

  modalBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
