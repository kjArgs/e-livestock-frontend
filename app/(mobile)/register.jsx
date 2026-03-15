import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  MD3LightTheme,
  Provider as PaperProvider,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import AppHeader from "../../components/header";

const agricultureTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4CAF50",
    secondary: "#81C784",
    background: "#E8F5E9",
    surface: "#ffffff",
    onPrimary: "#ffffff",
    outline: "#A5D6A7",
  },
};

const API_URL =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/register.php";
const API_SEND_OTP =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/send_otp.php";

export default function Register() {
  return (
    <PaperProvider theme={agricultureTheme}>
      <RegisterScreen />
    </PaperProvider>
  );
}

function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => email.includes("@");
  const isValidPhone = (phone) => phone.length === 11;

  const handleRegister = async () => {
    if (
      !firstname ||
      !lastname ||
      !address ||
      !email ||
      !phone ||
      !username ||
      !password
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Email must contain @");
      return;
    }

    if (!isValidPhone(phone)) {
      Alert.alert(
        "Invalid Phone Number",
        "Phone number must be exactly 11 digits."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname,
          lastname,
          address,
          email,
          phone,
          username,
          password,
        }),
      });

      const rawText = await response.text();
      const result = JSON.parse(rawText);

      if (!result.success) {
        Alert.alert("Error", result.message);
        setLoading(false);
        return;
      }

      // Send OTP after successful registration
      const otpRes = await fetch(API_SEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "register" }),
      });

      const otpResult = await otpRes.json();

      if (!otpResult.success) {
        Alert.alert("Error", otpResult.message);
        setLoading(false);
        return;
      }

      Alert.alert("Success", "OTP sent to your email!");
      router.replace({
        pathname: "/verifyOtp",
        params: { email, purpose: "register" },
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Create Your Account</Text>
          <View style={styles.formContainer}>
            <TextInput
              label="First Name"
              mode="outlined"
              value={firstname}
              onChangeText={setFirstname}
              style={styles.input}
            />
            <TextInput
              label="Last Name"
              mode="outlined"
              value={lastname}
              onChangeText={setLastname}
              style={styles.input}
            />
            <TextInput
              label="Address"
              mode="outlined"
              value={address}
              onChangeText={setAddress}
              style={styles.input}
            />
            <TextInput
              label="Email"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              label="Phone Number"
              mode="outlined"
              value={phone}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, "");
                if (numeric.length <= 11) setPhone(numeric);
              }}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              label="Username"
              mode="outlined"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerText}>
                {loading ? "Registering..." : "Register"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingTop: 140, paddingBottom: 60, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  formContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
  },
  input: { marginBottom: 12 },
  registerBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 24,
  },
  registerText: { color: "white", fontWeight: "bold", textAlign: "center" },
});
