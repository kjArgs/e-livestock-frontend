import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot, usePathname, useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";

export default function ScreensLayout() {
  const path = usePathname();
  const router = useRouter();

  // Screens where footer should be hidden
  const hideFooterScreens = [
    "/ownerDashboard",
    "/register",
    "/login",
    "/livestockInspectorDashboard",
    "/createLivestockForm",
    "/viewForms",
    "/antemortemDashboard",
    "/antemortemSchedules",
    "/sendOtp",
    "/verifyOtp",
    "/antemortemScanQRcode",
  ];
  const shouldHideFooter = hideFooterScreens.includes(path);

  // Logout function
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace("/"); // Redirect to login
            } catch (err) {
              console.error("Logout error:", err);
              Alert.alert("Error", "Failed to log out.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        {/* Slot renders the current page */}
        <Slot />

        {/* Footer */}
        {!shouldHideFooter && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              paddingVertical: 10,
              borderTopWidth: 1,
              borderColor: "#ccc",
              backgroundColor: "#f8f8f8",
            }}
          >
            <FooterButton label="Stockyard" to="/stockyard" path={path} />
            <FooterButton label="Schedules" to="/checkSchedule" path={path} />
            <Pressable onPress={handleLogout}>
              <Text style={{ color: "red", fontWeight: "bold" }}>Logout</Text>
            </Pressable>
          </View>
        )}
      </View>
    </PaperProvider>
  );
}

function FooterButton({ label, to, path }) {
  const router = useRouter();
  const isActive = path === to;

  return (
    <Pressable onPress={() => router.replace(to)}>
      <Text style={{ color: isActive ? "blue" : "black", fontWeight: "bold" }}>
        {label}
      </Text>
    </Pressable>
  );
}
