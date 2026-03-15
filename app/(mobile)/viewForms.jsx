import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button, Card, Menu } from "react-native-paper";
import FormDetailsModal from "../../components/FormDetailsModal";

const API_URL =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_forms.php";

export default function ViewForms() {
  const [allGroupedForms, setAllGroupedForms] = useState({}); // original fetched grouped forms
  const [allFilteredForms, setAllFilteredForms] = useState([]); // original fetched filtered forms
  const [groupedForms, setGroupedForms] = useState({});
  const [filteredForms, setFilteredForms] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [filter, setFilter] = useState("all");

  // Fetch forms from API whenever filter changes
  useEffect(() => {
    fetchForms(filter);
  }, [filter]);

  // Apply search whenever searchQuery changes
  useEffect(() => {
    applySearch(searchQuery);
  }, [searchQuery]);

  const fetchForms = async (filterParam) => {
    try {
      const account_id = await AsyncStorage.getItem("account_id");
      if (!account_id) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      const response = await fetch(
        `${API_URL}?filter=${filterParam}&account_id=${account_id}`
      );

      const data = await response.json();

      if (data.status === "success") {
        if (filterParam === "all") {
          setAllGroupedForms(data.forms || {});
          setGroupedForms(data.forms || {});
          setAllFilteredForms([]);
          setFilteredForms([]);
        } else {
          setAllFilteredForms(data.forms || []);
          setFilteredForms(data.forms || []);
          setAllGroupedForms({});
          setGroupedForms({});
        }
      } else {
        Alert.alert("Error", data.message || "Failed to load forms.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch forms.");
    }
  };

  const applySearch = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    if (filter === "all") {
      if (lowerQuery === "") return setGroupedForms(allGroupedForms);

      const newGrouped = {};
      Object.keys(allGroupedForms).forEach((date) => {
        const matches = allGroupedForms[date].filter(
          (f) =>
            f.owner_name.toLowerCase().includes(lowerQuery) ||
            f.animal_unique_identifier.toLowerCase().includes(lowerQuery) ||
            f.form_id.toString().includes(lowerQuery)
        );
        if (matches.length > 0) newGrouped[date] = matches;
      });
      setGroupedForms(newGrouped);
    } else {
      if (lowerQuery === "") return setFilteredForms(allFilteredForms);

      const newFiltered = allFilteredForms.filter(
        (f) =>
          f.owner_name.toLowerCase().includes(lowerQuery) ||
          f.animal_unique_identifier.toLowerCase().includes(lowerQuery) ||
          f.form_id.toString().includes(lowerQuery)
      );
      setFilteredForms(newFiltered);
    }
  };

  const viewFormDetails = async (form_id) => {
    try {
      const response = await fetch(
        "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_form_details.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ form_id }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setSelectedForm(data.form);
        setModalVisible(true);
      } else {
        Alert.alert("Error", data.message || "Failed to get form details.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch form details.");
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ SEARCH BAR */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by Owner, Eartag, or Form ID"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* ✅ FILTER MENU */}
      <View style={styles.filterContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.filterButton}
              labelStyle={{ color: "#2E7D32" }}
            >
              {filter === "today"
                ? "Today"
                : filter === "week"
                ? "This Week"
                : filter === "month"
                ? "This Month"
                : "All Forms"}
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color="#2E7D32"
              />
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setFilter("all");
            }}
            title="All Forms"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setFilter("today");
            }}
            title="Today"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setFilter("week");
            }}
            title="This Week"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setFilter("month");
            }}
            title="This Month"
          />
        </Menu>
      </View>

      {/* ✅ FORMS LIST */}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {filter === "all"
          ? Object.keys(groupedForms).map((date) => (
              <View key={date} style={{ marginBottom: 15 }}>
                <Text style={styles.dateHeader}>{date}</Text>

                {groupedForms[date].map((item) => (
                  <Card key={item.form_id} style={styles.formCard}>
                    <View style={styles.row}>
                      <View style={{ flex: 3 }}>
                        <Text style={styles.label}>EARTAG:</Text>
                        <Text style={styles.value}>
                          {item.animal_unique_identifier}
                        </Text>
                      </View>

                      <View style={{ flex: 3 }}>
                        <Text style={styles.label}>OWNER:</Text>
                        <Text style={styles.value}>{item.owner_name}</Text>
                      </View>

                      <View style={{ flex: 2 }}>
                        <Button
                          mode="contained"
                          onPress={() => viewFormDetails(item.form_id)}
                          style={{ backgroundColor: "#2E7D32" }}
                        >
                          View
                        </Button>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            ))
          : filteredForms.map((item) => (
              <Card key={item.form_id} style={styles.formCard}>
                <View style={styles.row}>
                  <View style={{ flex: 3 }}>
                    <Text style={styles.label}>EARTAG:</Text>
                    <Text style={styles.value}>
                      {item.animal_unique_identifier}
                    </Text>
                  </View>

                  <View style={{ flex: 3 }}>
                    <Text style={styles.label}>OWNER:</Text>
                    <Text style={styles.value}>{item.owner_name}</Text>
                  </View>

                  <View style={{ flex: 2 }}>
                    <Button
                      mode="contained"
                      onPress={() => viewFormDetails(item.form_id)}
                      style={{ backgroundColor: "#2E7D32" }}
                    >
                      View
                    </Button>
                  </View>
                </View>
              </Card>
            ))}
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
  container: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 15,
    backgroundColor: "#E8F5E9",
  },
  searchInput: {
    
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderColor: "#2E7D32",
    borderWidth: 1,
    color: "#333",
  },
  filterContainer: { alignItems: "center", marginBottom: 15 },
  filterButton: {
    borderColor: "#2E7D32",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: 160,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#2E7D32",
  },
  formCard: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
  },
  row: { flexDirection: "row", alignItems: "center" },
  label: { fontWeight: "bold", color: "#2E7D32" },
  value: { fontSize: 15, color: "#333", marginBottom: 5 },
});
