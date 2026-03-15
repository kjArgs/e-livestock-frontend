import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
const statusColors = {
  Pending: "#FFB300", 
  Ongoing: "#0288D1", 
  Done: "#2E7D32", 
  Cancelled: "#B71C1C",
};

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      const storedFirst = await AsyncStorage.getItem("first_name");
      const storedLast = await AsyncStorage.getItem("last_name");

      if (storedFirst && storedLast) {
        setFirstName(storedFirst);
        setLastName(storedLast);
        fetchSchedules(storedFirst, storedLast);
      }
    };
    loadUserData();
  }, []);

  const fetchSchedules = async (first, last) => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_schedules.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ first_name: first, last_name: last }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        setSchedules(data.schedules || []);
      } else {
        Alert.alert("Notice", data.message || "No schedules found.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch schedules.");
    }
    setLoading(false);
  };

  const cancelSchedule = async (schedule_id) => {
    Alert.alert(
      "Confirm Cancel",
      "Are you sure you want to cancel this schedule?",
      [
        { text: "No" },
        {
          text: "Yes, Cancel",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await fetch(
                "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_schedules.php",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "cancel",
                    schedule_id,
                  }),
                }
              );

              const data = await res.json();

              if (data.status === "success") {
                Alert.alert("Success", "Schedule cancelled successfully!");
                setSchedules((prev) =>
                  prev.map((s) =>
                    s.schedule_id === schedule_id
                      ? { ...s, status: "Cancelled" }
                      : s
                  )
                );
              } else {
                Alert.alert(
                  "Error",
                  data.message || "Failed to cancel schedule."
                );
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Something went wrong while cancelling.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderSchedule = ({ item }) => (
    <View style={styles.scheduleCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.ownerName}>{item.owner_name}</Text>
        <Text
          style={{
            ...styles.status,
            color: statusColors[item.status] || "#FFB300",
          }}
        >
          {item.status || "Pending"}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.label}>
          🌱 Eartag: <Text style={styles.value}>{item.eartag_number}</Text>
        </Text>
        <Text style={styles.label}>
          🌿 Location: <Text style={styles.value}>{item.location}</Text>
        </Text>
        <Text style={styles.label}>
          📅 Date:{" "}
          <Text style={styles.value}>
            {new Date(item.date).toLocaleString()}
          </Text>
        </Text>
      </View>

      {item.qr_code && (
        <View style={styles.qrWrapper}>
          <QRCode value={item.qr_code} size={90} backgroundColor="#fff" />
        </View>
      )}

      {item.status !== "Cancelled" && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => cancelSchedule(item.schedule_id)}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Schedules</Text>

      {loading && <ActivityIndicator size="large" color="#4CAF50" />}

      {!loading && schedules.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#555" }}>
          No schedules found.
        </Text>
      )}

      <FlatList
        data={schedules}
        keyExtractor={(item) => item.schedule_id.toString()}
        renderItem={renderSchedule}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 30, // lowered content from top
    backgroundColor: "#F0F4E8", // more agri-like background
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2E7D32",
  },
  scheduleCard: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cardContent: { marginBottom: 12 },
  label: {
    fontSize: 15,
    color: "#2E7D32",
    marginBottom: 5,
  },
  value: {
    fontWeight: "bold",
    color: "#1B5E20",
  },
  qrWrapper: {
    alignItems: "center",
    marginVertical: 10,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cancelBtn: {
    marginTop: 8,
    backgroundColor: "#D32F2F",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
