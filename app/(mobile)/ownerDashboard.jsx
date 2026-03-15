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
    total: 0,
    expired: 0,
    valid: 0,
  });

  // Fetch analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_owner_analytics_summary.php"
      );
      const data = await response.json();

      setAnalytics({
        total: data.total,
        expired: data.expired,
        valid: data.valid,
      });
    } catch (error) {
      console.log(error);
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Analytics Cards */}
        <View style={styles.analyticsWrapper}>
          {/* TOTAL FORMS */}
          <TouchableOpacity
            style={[styles.analyticsCard, { backgroundColor: "#4CAF50" }]}
            onPress={() => router.push("stockyard")}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <Text style={styles.analyticsTitle}>Total Forms</Text>
                <Text style={styles.analyticsNumber}>{analytics.total}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* EXPIRED FORMS */}
          <TouchableOpacity
            style={[styles.analyticsCard, { backgroundColor: "#EF5350" }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <Text style={styles.analyticsTitle}>Expired</Text>
                <Text style={styles.analyticsNumber}>{analytics.expired}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* NOT EXPIRED */}
          <TouchableOpacity
            style={[styles.analyticsCard, { backgroundColor: "#66BB6A" }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <Text style={styles.analyticsTitle}>Valid Forms</Text>
                <Text style={styles.analyticsNumber}>{analytics.valid}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: "#81C784" }]}
            onPress={() => router.push("/stockyard")}
          >
            <Text style={styles.smallButtonText}>Stockyard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: "#4DB6AC" }]}
            onPress={() => router.push("/checkSchedule")}
          >
            <Text style={styles.smallButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button Below */}
        <View style={styles.logoutWrapper}>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: "#E57373" }]}
            onPress={handleLogout}
          >
            <Text style={styles.smallButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  analyticsWrapper: {
    marginTop: 50,
    marginBottom: 25,
  },

  analyticsCard: {
    width: "100%",
    paddingVertical: 25,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  analyticsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },

  analyticsNumber: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 15,
  },

  logoutWrapper: {
    marginTop: 10,
  },

  smallButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  smallButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
