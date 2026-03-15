import { MaterialIcons } from "@expo/vector-icons"; // 👈 for dropdown arrow
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Button, Card, Menu, Text } from "react-native-paper";
import LogoutButton from "../../components/logOutButton";

const screenWidth = Dimensions.get("window").width - 60; // adjusted for padding
const API_URL =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_inspection_summary.php";

const InspectorDashboard = () => {
  const router = useRouter();
  const [filter, setFilter] = useState("today");
  const [menuVisible, setMenuVisible] = useState(false);
  const [total, setTotal] = useState(0);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState(null);

  // Load account_id from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        console.log("Stored user data:", userData);
        if (userData) {
          const parsed = JSON.parse(userData);
          console.log("Parsed account_id:", parsed.account_id);
          setAccountId(parsed.account_id);
        }
      } catch (err) {
        console.error("Error loading user:", err);
      }
    })();
  }, []);

  // Fetch data when filter or accountId changes
  useEffect(() => {
    if (accountId !== null && accountId !== undefined) {
      fetchSummary();
    }
  }, [filter, accountId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const url = `${API_URL}?filter=${filter}&account_id=${accountId}`;
      console.log("Fetching:", url);
      const response = await fetch(url);
      const result = await response.json();
      console.log("Response JSON:", result);

      if (result.success) {
        setTotal(result.total);
        setAnalytics(result.analytics);
      } else {
        console.error("Error:", result.message);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const lastThreeMonths = analytics.slice(-3); 

  const chartData = {
    labels: lastThreeMonths.map((a) => a.month),
    datasets: [{ data: lastThreeMonths.map((a) => parseInt(a.total)) }],
  };

  const chartConfig = {
    backgroundColor: "#e8f5e9",
    backgroundGradientFrom: "#a5d6a7",
    backgroundGradientTo: "#e8f5e9",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, 
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "#ccc",
      strokeDasharray: "3",
    },
  };

  return (
    <LinearGradient
      colors={["#A5D6A7", "#E8F5E9"]}
      style={styles.gradientBackground}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.header}>
            Inspector Dashboard
          </Text>
          <Text style={styles.subHeader}>
            Manage your inspection forms and view analytics
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.row}>
          <Card style={[styles.card, { flex: 1, marginRight: 10 }]}>
            <Card.Title
              title="Total Inspected Forms"
              titleVariant="titleLarge"
              titleStyle={{ color: "#000" }}
            />
            <Card.Content>
              {loading ? (
                <ActivityIndicator size="small" color="#2E7D32" />
              ) : (
                <Text style={styles.totalText}>{total}</Text>
              )}
            </Card.Content>
          </Card>

          {/* Filter Card with Dropdown Arrow */}
          <Card style={[styles.card, { flex: 1 }]}>
            <Card.Title
              title="Filter"
              titleVariant="titleLarge"
              titleStyle={{ color: "#000" }}
            />
            <Card.Content>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    style={{
                      borderColor: "#2E7D32",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                    labelStyle={{ color: "#2E7D32" }}
                  >
                    {filter === "today"
                      ? "Today"
                      : filter === "week"
                      ? "This Week"
                      : "This Month"}
                    <MaterialIcons
                      name={
                        menuVisible
                          ? "keyboard-arrow-up"
                          : "keyboard-arrow-down"
                      }
                      size={20}
                      color="#2E7D32"
                    />
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setFilter("today");
                    setMenuVisible(false);
                  }}
                  title="Today"
                />
                <Menu.Item
                  onPress={() => {
                    setFilter("week");
                    setMenuVisible(false);
                  }}
                  title="This Week"
                />
                <Menu.Item
                  onPress={() => {
                    setFilter("month");
                    setMenuVisible(false);
                  }}
                  title="This Month"
                />
              </Menu>
            </Card.Content>
          </Card>
        </View>

        {/* Chart */}
        <Card style={styles.chartCard} mode="elevated">
          <Card.Title
            title="Inspection Analytics"
            titleVariant="titleLarge"
            titleStyle={{ color: "#000" }}
          />
          <Card.Content>
            {loading ? (
              <ActivityIndicator size="large" color="#2E7D32" />
            ) : (
              <View style={{ overflow: "hidden", paddingHorizontal: 10 }}>
                <BarChart
                  data={chartData}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  fromZero
                  showValuesOnTopOfBars
                  withInnerLines={true}
                  withHorizontalLabels={true}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* View Forms */}
        <Card style={styles.card}>
          <Card.Title
            title="Submitted Forms"
            titleVariant="titleLarge"
            titleStyle={{ color: "#000" }}
          />
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => router.push("/viewForms")}
              style={styles.greenButton}
            >
              View Forms
            </Button>
          </Card.Actions>
        </Card>

        {/* Create Form */}
        <Card style={styles.card}>
          <Card.Title
            title="Create New Form"
            titleVariant="titleLarge"
            titleStyle={{ color: "#000" }}
          />
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => router.push("/createLivestockForm")}
              style={styles.greenButton}
            >
              Create Form
            </Button>
          </Card.Actions>
        </Card>

        {/* Logout */}
        <View style={{ marginTop: 20 }}>
          <LogoutButton />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default InspectorDashboard;

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flexGrow: 1, padding: 20 },
  headerContainer: { marginBottom: 25, alignItems: "center" },
  header: { fontWeight: "bold", color: "#1B5E20" },
  subHeader: { fontSize: 16, color: "#2E7D32", marginTop: 4 },
  chartCard: {
    borderRadius: 16,
    backgroundColor: "white",
    marginBottom: 25,
    elevation: 5,
    paddingBottom: 10,
  },
  chart: { marginVertical: 8, borderRadius: 16 },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: "white",
    elevation: 5,
  },
  row: { flexDirection: "row", marginBottom: 20 },
  totalText: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2E7D32",
  },
  greenButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 10,
    marginLeft: "auto",
  },
});
