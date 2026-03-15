import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    slaughtered: 0,
    scheduled: 0,
    pending: 0,
    ongoing: 0,
  });

  const fetchAnalytics = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_antemortem_analytics.php"
      );

      const result = await response.json();

      if (result.status === "success") {
        setAnalytics({
          slaughtered: parseInt(result.data.total_slaughtered) || 0,
          scheduled: parseInt(result.data.total_scheduled) || 0,
          pending: parseInt(result.data.total_pending) || 0,
          ongoing: parseInt(result.data.total_ongoing) || 0,
        });
      } else {
        console.log("API error:", result.message);
        Alert.alert("Error", "Failed to load analytics.");
      }
    } catch (error) {
      console.log("Analytics fetch error:", error);
      Alert.alert("Error", "Failed to load analytics.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Move analytics lower */}
        <View style={{ marginTop: 40 }}>
          <Text style={styles.sectionTitle}></Text>

          {/* ANALYTICS GRID */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#2196F3"
              style={{ marginVertical: 50 }}
            />
          ) : (
            <View style={styles.analyticsGrid}>
              <TouchableOpacity style={styles.analyticsButton}>
                <MaterialIcons name="check-circle" size={40} color="#1B5E20" />
                <Text style={styles.analyticsValue}>
                  {analytics.slaughtered}
                </Text>
                <Text style={styles.analyticsLabel}>Slaughtered</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.analyticsButton}>
                <MaterialIcons name="schedule" size={40} color="#1565C0" />
                <Text style={styles.analyticsValue}>{analytics.scheduled}</Text>
                <Text style={styles.analyticsLabel}>Scheduled</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.analyticsButton}>
                <MaterialIcons
                  name="pending-actions"
                  size={40}
                  color="#F57F17"
                />
                <Text style={styles.analyticsValue}>{analytics.pending}</Text>
                <Text style={styles.analyticsLabel}>Pending</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.analyticsButton}>
                <MaterialIcons name="autorenew" size={40} color="#00838F" />
                <Text style={styles.analyticsValue}>{analytics.ongoing}</Text>
                <Text style={styles.analyticsLabel}>Ongoing</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* NAVIGATION BUTTONS */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#2196F3" }]}
            onPress={() => router.push("/antemortemSchedules")}
          >
            <Text style={styles.buttonText}>Schedules</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#E53935" }]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9F0", // light greenish background for agri theme
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2E7D32", // deep green header
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  analyticsButton: {
    width: "48%",
    paddingVertical: 25,
    backgroundColor: "#FFFDE7", // soft yellow for agri feeling
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
    borderWidth: 1,
    borderColor: "#DCE775",
    marginBottom: 20,
  },
  analyticsValue: {
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 10,
    color: "#33691E",
  },
  analyticsLabel: {
    fontSize: 16,
    color: "#558B2F",
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    width: "100%",
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
