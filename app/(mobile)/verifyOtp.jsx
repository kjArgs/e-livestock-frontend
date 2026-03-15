import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Button,
  Card,
  Text,
  TextInput,
  ActivityIndicator,
} from "react-native-paper";

export default function VerifyOtp() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email, purpose = "reset" } = params;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const VERIFY_OTP_URL =
    "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/verify_otp.php";

  useEffect(() => {
    if (!email) {
      Alert.alert("Error", "Missing email. Going back.");
      router.replace("/");
    }
  }, [email]);

  const handleVerifyOtp = async () => {
    if (!otp) return Alert.alert("Error", "Enter your OTP.");
    setLoading(true);

    try {
      const response = await fetch(VERIFY_OTP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose }),
      });
      const result = await response.json();
      setLoading(false);

      if (!result.success) {
        Alert.alert("Error", result.message);
        return;
      }

      Alert.alert("Success", "OTP verified successfully!");

      if (purpose === "register") {
        router.replace("/"); // go to login
      } else if (purpose === "reset") {
        router.replace({ pathname: "/resetPassword", params: { email } }); // go to reset password
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Network error.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F1F8E9" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to your email: {"\n"}
              <Text style={{ fontWeight: "bold" }}>{email}</Text>
            </Text>

            <TextInput
              label="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  text: "#2E7D32",
                  primary: "#2E7D32",
                  placeholder: "#4b4b4b",
                  background: "#fff",
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
                onPress={handleVerifyOtp}
                buttonColor="#388E3C"
                textColor="#fff"
                style={styles.button}
              >
                Verify OTP
              </Button>
            )}
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: "#ffffff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 26,
    color: "#2E7D32",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#4b4b4b",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 6,
  },
});
