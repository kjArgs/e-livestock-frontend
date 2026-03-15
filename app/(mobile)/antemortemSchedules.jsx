import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_ENDPOINTS = {
  pending:
    "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_pending_schedules.php",
  accepted:
    "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_accepted_schedules.php",
  ongoing:
    "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_ongoing_schedules.php",
  done: "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_done_schedules.php",
  cancelled:
    "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_cancelled_schedules.php",
};

const UPDATE_URL =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/update_schedule_status.php";

const cancel_URL =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/cancel_antemortem_schedules.php";

const formatTime = (time) => {
  if (!time) return "";
  const [hour, minute] = time.split(":");
  const h = ((+hour + 11) % 12) + 1;
  const ampm = +hour >= 12 ? "PM" : "AM";
  return `${h}:${minute} ${ampm}`;
};

export default function AntemortemScheduleScreen() {
  const router = useRouter();
  const [allSchedules, setAllSchedules] = useState([]); 
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSchedules();
  }, [statusFilter]);

  useEffect(() => {
    applySearch(searchQuery);
  }, [searchQuery]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS[statusFilter]);
      const data = await res.json();
      if (data.status === "success") {
        setAllSchedules(data.schedules || []);
        setSchedules(data.schedules || []);
      } else {
        setAllSchedules([]);
        setSchedules([]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch schedules.");
    } finally {
      setLoading(false);
    }
  };

  const applySearch = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return setSchedules(allSchedules);

    const filtered = allSchedules.filter(
      (s) =>
        s.owner_name.toLowerCase().includes(lowerQuery) ||
        s.eartag_number.toLowerCase().includes(lowerQuery) ||
        s.form_id?.toString().includes(lowerQuery)
    );
    setSchedules(filtered);
  };

  const updateScheduleStatus = async (scheduleId, newStatus) => {
    try {
      setLoading(true);
      const res = await fetch(UPDATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule_id: scheduleId,
          new_status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        Alert.alert("Success", `Schedule marked as ${newStatus}!`);
        setSchedules((prev) =>
          prev.filter((s) => s.schedule_id !== scheduleId)
        );
        setAllSchedules((prev) =>
          prev.filter((s) => s.schedule_id !== scheduleId)
        );
      } else {
        Alert.alert("Error", data.message || "Failed to update schedule");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    try {
      setLoading(true);
      const res = await fetch(cancel_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule_id: scheduleId }),
      });
      const data = await res.json();

      if (data.status === "success") {
        Alert.alert("Delete", "Schedule Cancelled successfully!");
        setSchedules((prev) =>
          prev.filter((s) => s.schedule_id !== scheduleId)
        );
        setAllSchedules((prev) =>
          prev.filter((s) => s.schedule_id !== scheduleId)
        );
      } else {
        Alert.alert("Error", data.message || "Failed to cancel schedule");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to cancel schedule.");
    } finally {
      setLoading(false);
    }
  };

  const renderSchedule = ({ item }) => (
    <View style={styles.scheduleCard}>
      <Text style={styles.ownerText}>Owner: {item.owner_name}</Text>
      <Text>Eartag: {item.eartag_number}</Text>
      <Text>Location: {item.location}</Text>
      <Text>
        Scheduled:{" "}
        {item.date
          ? `${new Date(item.date).toLocaleDateString()} ${
              item.start_time && item.end_time
                ? `${formatTime(item.start_time)} - ${formatTime(
                    item.end_time
                  )}`
                : item.start_time
                ? formatTime(item.start_time)
                : ""
            }`
          : "N/A"}
      </Text>
      <Text>Status: {item.status}</Text>

      {/* Buttons based on status */}
      {statusFilter === "pending" && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => updateScheduleStatus(item.schedule_id, "accepted")}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => updateScheduleStatus(item.schedule_id, "cancelled")}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {statusFilter === "accepted" && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => updateScheduleStatus(item.schedule_id, "ongoing")}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.verifyButton]}
            onPress={() =>
              router.push({
                pathname: "/antemortemScanQRcode",
                params: { form_id: item.form_id },
              })
            }
          >
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() =>
              Alert.alert(
                "Confirm",
                "Are you sure you want to cancel this schedule?",
                [
                  { text: "No", style: "cancel" },
                  {
                    text: "Yes",
                    onPress: () => deleteSchedule(item.schedule_id),
                  },
                ]
              )
            }
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {statusFilter === "ongoing" && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.doneButton]}
            onPress={() => updateScheduleStatus(item.schedule_id, "done")}
          >
            <Text style={styles.buttonText}>Mark Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by Owner, Eartag, or Form ID"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Status Filter */}
      <View style={{ marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["pending", "accepted", "ongoing", "done", "cancelled"].map(
            (status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  statusFilter === status && styles.activeFilterButton,
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[
                    styles.filterText,
                    statusFilter === status && styles.activeFilterText,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            )
          )}
          <View style={{ marginRight: 10 }} />
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : schedules.length === 0 ? (
        <Text style={{ marginTop: 50, textAlign: "center" }}>
          No {statusFilter} schedules.
        </Text>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.schedule_id.toString()}
          renderItem={renderSchedule}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#E6F2E6" },
  searchInput: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderColor: "#2E7D32",
    borderWidth: 1,
    color: "#333",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#C8E6C9",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  activeFilterButton: { backgroundColor: "#4CAF50" },
  filterText: { color: "#000", fontWeight: "bold" },
  activeFilterText: { color: "#fff" },
  scheduleCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  ownerText: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#2E7D32",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
    marginTop: 5,
  },
  acceptButton: { backgroundColor: "#2196F3" },
  cancelButton: { backgroundColor: "#f44336" },
  startButton: { backgroundColor: "#FF9800" },
  verifyButton: { backgroundColor: "#009688" },
  doneButton: { backgroundColor: "#4CAF50" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
