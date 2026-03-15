import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { Button } from "react-native-paper"; // use paper button for consistent styling

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("account_id");
              router.replace("/"); // <-- root index page
            } catch (err) {
              console.error("Logout error:", err);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Button
      mode="contained"
      onPress={handleLogout}
      buttonColor="#f44336"
      textColor="#fff"
    >
      Logout
    </Button>
  );
}
