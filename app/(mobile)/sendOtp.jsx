import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
  TextInput,
} from "react-native-paper";

const API_SEND_OTP =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/send_otp.php";

export default function SendOtp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (!email) return Alert.alert("Error", "Enter your email.");

    setLoading(true);
    try {
      const res = await fetch(API_SEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "reset" }),
      });
      const result = await res.json();
      setLoading(false);

      if (result.success) {
        Alert.alert("Success", "OTP sent to your email!");
        router.push({
          pathname: "/verifyOtp",
          params: { email, purpose: "reset" },
        });
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#F1F8E9",
      }}
    >
      <Card
        style={{
          padding: 25,
          borderRadius: 20,
          backgroundColor: "#fff",
          elevation: 3,
        }}
      >
        <Text
          variant="headlineSmall"
          style={{ marginBottom: 10, color: "#2E7D32", fontWeight: "bold" }}
        >
          Send OTP
        </Text>

        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          left={<TextInput.Icon icon="email" />}
          style={{ marginBottom: 20 }}
          outlineColor="#A5D6A7"
          activeOutlineColor="#2E7D32"
          theme={{
            colors: {
              text: "#ffffffff",
              primary: "#2E7D32",
              placeholder: "#ffffffff",
              background: "#ffffffff",
            },
          }}
        />

        {loading ? (
          <ActivityIndicator color="#2E7D32" />
        ) : (
          <Button
            mode="contained"
            onPress={sendOTP}
            buttonColor="#388E3C"
            textColor="#000000ff"
            style={{ borderRadius: 10 }}
          >
            Send OTP
          </Button>
        )}
      </Card>
    </View>
  );
}
