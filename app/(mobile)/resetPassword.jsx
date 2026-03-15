import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
  TextInput,
} from "react-native-paper";

const API_RESET_PASSWORD =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/reset_password.php";

export default function ResetPassword() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const resetPassword = async () => {
    if (!password || !confirm)
      return Alert.alert("Error", "All fields are required.");
    if (password.length < 6)
      return Alert.alert("Error", "Password must be at least 6 characters.");
    if (password !== confirm)
      return Alert.alert("Error", "Passwords do not match!");

    setLoading(true);
    try {
      const res = await fetch(API_RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      setLoading(false);

      if (result.success) {
        Alert.alert("Success", "Password reset successfully!", [
          { text: "Login", onPress: () => router.replace("/") },
        ]);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F1F8E9" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Card
          style={{
            borderRadius: 16,
            paddingVertical: 25,
            paddingHorizontal: 20,
            backgroundColor: "#fff",
            elevation: 5,
          }}
        >
          <Card.Content>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#2E7D32",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Reset Password
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#4b4b4b",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Enter your new password for:{"\n"}
              <Text style={{ fontWeight: "bold", color: "#000" }}>{email}</Text>
            </Text>

            <TextInput
              label="New Password"
              mode="outlined"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={{ marginBottom: 15, backgroundColor: "#fff" }}
              theme={{
                colors: {
                  text: "#2E7D32",
                  primary: "#2E7D32",
                  placeholder: "#4b4b4b",
                },
              }}
            />

            <TextInput
              label="Confirm Password"
              mode="outlined"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              style={{ marginBottom: 20, backgroundColor: "#fff" }}
              theme={{
                colors: {
                  text: "#2E7D32",
                  primary: "#2E7D32",
                  placeholder: "#4b4b4b",
                },
              }}
            />

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#2E7D32"
                style={{ marginTop: 10 }}
              />
            ) : (
              <Button
                mode="contained"
                onPress={resetPassword}
                buttonColor="#388E3C"
                textColor="#fff"
                style={{ borderRadius: 8, paddingVertical: 6 }}
              >
                Update Password
              </Button>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
